import { useEffect, useState } from 'react';
import sentimentScoresRaw from '../../../server/data/neighbourhood_sentiment.json';

interface CommentsPanelProps {
  neighbourhoodName: string | null;
  onClose: () => void;
}

interface CommentEntry {
  comment: string;
  matched_neighbourhoods: string[];
  sentiment: {
    neg: number;
    neu: number;
    pos: number;
    compound: number;
  };
}

export default function CommentsPanel({ neighbourhoodName, onClose }: CommentsPanelProps) {
  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const sentimentScores: Record<string, number> = sentimentScoresRaw;

  useEffect(() => {
    if (!neighbourhoodName) return;

    setIsVisible(true);

    fetch(`http://localhost:5000/api/comments/${encodeURIComponent(neighbourhoodName)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setComments(data);
        } else if (data.results && Array.isArray(data.results)) {
          setComments(data.results);
        } else {
          setComments([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching comments:', err);
        setComments([]);
      });

    const lowerCasedData: Record<string, number> = {};
    for (const key in sentimentScores) {
      lowerCasedData[key.toLowerCase()] = sentimentScores[key];
    }
    const score = lowerCasedData[neighbourhoodName.toLowerCase()] ?? null;
    setAverageScore(score);
  }, [neighbourhoodName]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!neighbourhoodName || averageScore === null) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        maxWidth: '100vw',
        width: '460px',
        height: '100vh',
        background: '#f9f9fb',
        color: '#1a1a1a',
        zIndex: 1001,
        boxShadow: '-6px 0 20px rgba(0,0,0,0.1)',
        padding: '28px 32px',
        overflowY: 'auto',
        overflowX: 'clip',
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s ease-in-out',
        fontFamily: 'Helvetica Neue, sans-serif',
        borderLeft: '1px solid #e0e0e0',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>{neighbourhoodName}</h2>
        <button
          onClick={handleClose}
          style={{
            fontSize: '24px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#777',
            transition: 'color 0.2s ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = '#222')}
          onMouseOut={(e) => (e.currentTarget.style.color = '#777')}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: '18px', fontSize: '16px' }}>
        <strong>Average Sentiment:</strong>{' '}
        <span style={{
          color: averageScore >= 0.25 ? '#28a745' : averageScore >= -0.25 ? '#ffc107' : '#dc3545',
          fontWeight: 600
        }}>
          {averageScore.toFixed(3)}
        </span>
      </div>

      <div style={{ marginBottom: '16px', fontSize: '15px', color: '#444' }}>
        <strong>Comments ({comments.length}):</strong>
      </div>

      <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
        {comments.map((entry, idx) => (
          <li
            key={idx}
            style={{
              marginBottom: '18px',
              padding: '16px 20px',
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.25s ease',
              lineHeight: 1.5
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.015)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
          >
            <div style={{ fontSize: '15px', marginBottom: '12px', color: '#2c2c2c' }}>{entry.comment}</div>
            <div style={{ fontSize: '13px', color: '#6c757d' }}>
              Sentiment Score: <strong>{entry.sentiment.compound.toFixed(3)}</strong> (Pos: {entry.sentiment.pos}, Neg: {entry.sentiment.neg}, Neu: {entry.sentiment.neu})
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
