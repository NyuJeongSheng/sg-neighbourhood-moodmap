import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import styles from './SettingsPanel.module.css';
import { API_BASE } from '../../utils/apiBase';

interface SettingsPanelProps {
  setLoading: (loading: boolean) => void;
  onSettingsChange: () => void;
}

export default function SettingsPanel({ setLoading, onSettingsChange }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dataSource, setDataSource] = useState<'online' | 'csv'>('csv');
  const [sentimentModel, setSentimentModel] = useState<'vader' | 'custom'>('vader');

  useEffect(() => {
    const loadInitialSettings = async () => {
      try {
        const [commentsRes, sentimentRes] = await Promise.all([
          fetch(`${API_BASE}/files/processed/comment_sentiment_scores.json`),
          fetch(`${API_BASE}/files/processed/neighbourhood_sentiment.json`)
        ]);

        const commentData = await commentsRes.json();
        const sentimentData = await sentimentRes.json();

        const model = sentimentData?.model;
        const postId = commentData?.[0]?.post_id;

        setSentimentModel(model === 'custom' ? 'custom' : 'vader');
        setDataSource(postId ? 'online' : 'csv');
      } catch (err) {
        console.error('⚠️ Failed to load sentiment data:', err);
        setDataSource('csv');
      }
    };

    loadInitialSettings();
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    const newModel = name === 'sentimentModel' ? (value as 'vader' | 'custom') : sentimentModel;
    const newDataSource = name === 'dataSource' ? (value as 'csv' | 'online') : dataSource;

    setSentimentModel(newModel);
    setDataSource(newDataSource);
    setLoading(true);

    try {
      const endpoint =
        newDataSource === 'online'
          ? `${API_BASE}/api/scrape`
          : `${API_BASE}/api/process-csv`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: newModel })
      });

      if (!res.ok) throw new Error('Failed to trigger backend update');

      console.log(`✅ Triggered: ${newDataSource} with model ${newModel}`);
      onSettingsChange();
    } catch (err) {
      console.error('Backend update failed:', err);
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
            name="dataSource"
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
            name="sentimentModel"
            value={sentimentModel}
            onChange={handleChange}
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
