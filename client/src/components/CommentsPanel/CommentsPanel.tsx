import { useEffect, useState } from 'react';
import sentimentScoresRaw from '../../../../server/data/neighbourhood_sentiment.json';
import styles from './CommentsPanel.module.css';

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
      className={`${styles.panel} ${isVisible ? styles.panelVisible : styles.panelHidden}`}
    >
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

      <div className={styles.commentCount}>
        <strong>Comments ({comments.length}):</strong>
      </div>

      <ul className={styles.commentList}>
        {comments.map((entry, idx) => (
          <li key={idx} className={styles.commentItem}>
            <div className={styles.commentText}>{entry.comment}</div>
            <div className={styles.commentMeta}>
              Sentiment Score: <strong>{entry.sentiment.compound.toFixed(3)}</strong> (Pos: {entry.sentiment.pos}, Neg: {entry.sentiment.neg}, Neu: {entry.sentiment.neu})
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
