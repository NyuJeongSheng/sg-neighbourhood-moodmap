import { useEffect, useState } from 'react';
import sentimentScoresRaw from '../../../../server/data/processed/neighbourhood_sentiment.json';
import styles from './CommentsPanel.module.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface CommentsPanelProps {
  neighbourhoodName: string | null;
  onClose: () => void;
}

interface CommentEntry {
  comment: string;
  matched_neighbourhoods: string[];
  timestamp?: string;
  sentiment: {
    neg: number;
    neu: number;
    pos: number;
    compound: number;
  };
}

interface TrendPoint {
  date: string;
  sentiment: number;
}

export default function CommentsPanel({ neighbourhoodName, onClose }: CommentsPanelProps) {
  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showTrend, setShowTrend] = useState(false);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);

  const sentimentScores: Record<string, number> = sentimentScoresRaw.sentiment;

  useEffect(() => {
    if (!neighbourhoodName) return;
    setIsVisible(true);

    fetch(`http://localhost:5000/api/comments/${encodeURIComponent(neighbourhoodName)}`)
      .then((res) => res.json())
      .then((data) => {
        const list: CommentEntry[] = Array.isArray(data) ? data : data.results || [];

        const sorted = list
          .filter(entry => entry.timestamp)
          .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());

        setComments(sorted);
        generateTrend(list);
      })
      .catch((err) => {
        console.error('Error fetching comments:', err);
        setComments([]);
        setTrendData([]);
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

  const generateTrend = (list: CommentEntry[]) => {
    const withDate = list
      .filter(entry => entry.timestamp)
      .map(entry => {
        const ts = new Date(entry.timestamp!);
        return {
          date: ts.toLocaleDateString('en-GB'),
          fullTime: ts.getTime(),
          sentiment: entry.sentiment.compound,
        };
      })
      .sort((a, b) => a.fullTime - b.fullTime)
      .map(({ date, sentiment }) => ({ date, sentiment }));
  
    setTrendData(withDate);
  };
  
  if (!neighbourhoodName || averageScore === null) return null;

  return (
    <div className={`${styles.panel} ${isVisible ? styles.panelVisible : styles.panelHidden}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>{neighbourhoodName}</h2>
        <button className={styles.closeButton} onClick={handleClose}>✕</button>
      </div>

      <div className={styles.average}>
        <strong>Average Sentiment:</strong>{' '}
        <span
          className={
            averageScore >= 0.25
              ? styles.positive
              : averageScore >= -0.25
                ? styles.neutral
                : styles.negative
          }
        >
          {averageScore.toFixed(3)}
        </span>
      </div>

      {comments.length > 2 && (
        <>
          <div style={{ marginBottom: '12px' }}>
            <label>
              <input
                type="checkbox"
                checked={showTrend}
                onChange={() => setShowTrend(!showTrend)}
                style={{ marginRight: '8px' }}
              />
              Show Sentiment Trend
            </label>
          </div>

          {showTrend && (
            <div style={{ marginBottom: '20px', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="date" />
                  <YAxis domain={[-1, 1]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="sentiment" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      <div className={styles.commentCount}>
        <strong>Comments ({comments.length}):</strong>
      </div>

      <ul className={styles.commentList}>
        {comments.map((entry, idx) => (
          <li key={idx} className={styles.commentItem}>
            <div className={styles.commentText}>{entry.comment}</div>
            <div className={styles.commentMeta}>
              <div>
                Sentiment Score: <strong>{entry.sentiment.compound.toFixed(3)}</strong>{' '}
                (Pos: {entry.sentiment.pos}, Neg: {entry.sentiment.neg}, Neu: {entry.sentiment.neu})
              </div>
              {entry.timestamp && (
                <div style={{ fontSize: '12px', color: '#777', marginTop: '20px' }}>
                  Posted on: {new Date(entry.timestamp).toLocaleDateString('en-GB')}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
