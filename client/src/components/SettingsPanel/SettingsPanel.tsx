import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import styles from './SettingsPanel.module.css';

import sentimentCommentsData from '../../../../server/data/processed/comment_sentiment_scores.json';
import sentimentNeighbourhoodData from '../../../../server/data/processed/neighbourhood_sentiment.json';

interface SettingsPanelProps {
  setLoading: (loading: boolean) => void;
}

export default function SettingsPanel({ setLoading }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dataSource, setDataSource] = useState<'online' | 'csv'>('csv');
  const [sentimentModel, setSentimentModel] = useState<'vader' | 'custom'>('vader');

  useEffect(() => {
    try {
      const model = sentimentNeighbourhoodData?.model;
      const postId = sentimentCommentsData?.[0]?.post_id;

      setSentimentModel(model === 'custom' ? 'custom' : 'vader');
      setDataSource(postId ? 'online' : 'csv');
    } catch (err) {
      console.error('⚠️ Failed to load static sentiment data:', err);
      setDataSource('csv');
    }
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
          ? 'http://localhost:5000/api/scrape'
          : 'http://localhost:5000/api/process-csv';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: newModel }),
      });

      if (!res.ok) throw new Error('❌ Failed to trigger backend update');

      console.log(`✅ Triggered: ${newDataSource} with model ${newModel}`);
    } catch (err) {
      console.error('❌ Backend update failed:', err);
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
