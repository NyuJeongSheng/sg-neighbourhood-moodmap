import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import styles from './SettingsPanel.module.css';
import sentimentData from '../../../../server/data/comment_sentiment_scores.json'; // adjust path as needed

interface SettingsPanelProps {
  setLoading: (loading: boolean) => void;
}

export default function SettingsPanel({ setLoading }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dataSource, setDataSource] = useState<'online' | 'csv'>('csv');
  const [sentimentModel, setSentimentModel] = useState<'vader' | 'textblob' | 'custom'>('vader');

  useEffect(() => {
    try {
      const postId = sentimentData?.[0]?.post_id;
      if (postId !== null && postId !== undefined) {
        setDataSource('online');
      } else {
        setDataSource('csv');
      }
    } catch (err) {
      console.error('⚠️ Failed to load static sentiment data:', err);
      setDataSource('csv');
    }
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSource = e.target.value as 'online' | 'csv';
    setDataSource(newSource);
    setLoading(true);

    try {
      const endpoint =
        newSource === 'online'
          ? 'http://localhost:5000/api/scrape'
          : 'http://localhost:5000/api/process-csv';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: sentimentModel }),
      });

      if (!res.ok) throw new Error('Failed to trigger backend update');
      console.log(`✅ Triggered: ${newSource}`);
    } catch (err) {
      console.error('❌ Error updating data source:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.panelContainer}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={styles.settingsButton}
        title="Settings"
      >
        <Settings size={20} color="#333" />
      </div>

      {isOpen && (
        <div className={styles.dropdownPanel}>
          <div className={styles.panelTitle}>Settings</div>

          <label htmlFor="data-source" className={styles.label}>Data Source</label>
          <select
            id="data-source"
            value={dataSource}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="csv">Local data</option>
            <option value="online">Online (Reddit)</option>
          </select>

          <label htmlFor="sentiment-model" className={styles.label}>Sentiment Analysis Model</label>
          <select
            id="sentiment-model"
            value={sentimentModel}
            onChange={(e) =>
              setSentimentModel(e.target.value as 'vader' | 'textblob' | 'custom')
            }
            className={styles.select}
          >
            <option value="vader">VADER (default)</option>
            <option value="custom">Custom Model</option>
          </select>
        </div>
      )}
    </div>
  );
}
