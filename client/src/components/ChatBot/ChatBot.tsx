import { useState, useEffect, useRef } from 'react';
import styles from './ChatBot.module.css';

const exampleQuestions = [
  'Which neighbourhood has the best sentiment?',
  'Suggest peaceful areas in the East.',
  'Where do people complain the most?',
  'Which place has positive vibes?',
  'Give me a top 5 list to consider living.'
];

type Message = { from: 'user' | 'bot'; text: string };

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasDragged = useRef(false);

  const hasUserSentMessage = messages.some(msg => msg.from === 'user');

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          from: 'bot',
          text: `Hi! I'm your neighbourhood assistant, check out our recommended questions below, or simply ask me a question!`
        },
        {
          from: 'bot',
          text: '__EXAMPLE_QUESTIONS__'
        }
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleChat = () => setIsOpen(prev => !prev);

  const sendMessage = async (overrideMessage?: string) => {
    const messageToSend = overrideMessage ?? input.trim();
    if (!messageToSend) return;

    setMessages(prev => [...prev, { from: 'user', text: messageToSend }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend })
      });

      const data = await res.json();
      const reply = res.status === 200
        ? data.reply
        : res.status === 429
          ? 'Sorry! We\'re receiving too many requests right now. Please wait a few seconds and try again.'
          : 'Server error. We could not process your request right now.';

      setMessages(prev => [...prev, { from: 'bot', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { from: 'bot', text: 'Something went wrong while processing your request. Please check your connection or try again.' }]);
    }

    setLoading(false);
  };

  const startDrag = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const stopDrag = () => {
    isDragging.current = false;
  };

  const onDrag = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    if (Math.abs(walk) > 5) hasDragged.current = true;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const renderMessage = (msg: Message, index: number) => {
    if (msg.text === '__EXAMPLE_QUESTIONS__') {
      return (
        <div key={index} style={{ marginBlock: '6px' }}>
          <div className={styles.examplesContainer}>
            {exampleQuestions.map((q, i) => (
              <div
                key={i}
                onClick={() => sendMessage(q)}
                style={{
                  padding: '10px 12px',
                  borderBottom: i !== exampleQuestions.length - 1 ? '1px solid #eee' : 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                {q}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={index} style={{ textAlign: msg.from === 'user' ? 'right' : 'left' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '10px 14px',
            borderRadius: 16,
            backgroundColor: msg.from === 'user' ? '#DCF8C6' : '#eee',
            maxWidth: '80%',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            textAlign: 'left'
          }}
        >
          {msg.text}
        </span>
      </div>
    );
  };

  return (
    <>
      <button onClick={toggleChat} className={styles.chatButton} aria-label="Open chatbot">
        💬
      </button>

      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <span className={styles.chatHeaderText}>AI Chatbot</span>
            <button onClick={toggleChat} className={styles.closeButton} aria-label="Close chatbot">✕</button>
          </div>

          <div className={styles.messageContainer}>
            {messages.map((m, i) => renderMessage(m, i))}
            {loading && <div style={{ fontStyle: 'italic', color: '#aaa' }}>Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>

          {hasUserSentMessage && (
            <div
              ref={scrollRef}
              onMouseDown={startDrag}
              onMouseLeave={stopDrag}
              onMouseUp={stopDrag}
              onMouseMove={onDrag}
              className={`${styles.questionScrollArea} ${styles.noScrollbar}`}
            >
              {exampleQuestions.map((q, i) => (
                <button
                  key={i}
                  className={styles.suggestionButton}
                  onClick={(e) => {
                    if (hasDragged.current) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    sendMessage(q);
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className={styles.inputArea}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className={styles.inputField}
            />
            <button onClick={() => sendMessage()} disabled={loading} className={styles.sendButton}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
