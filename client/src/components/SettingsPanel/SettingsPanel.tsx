import { useState } from 'react';
import { Settings } from 'lucide-react';

interface SettingsPanelProps {
  // onDataSourceChange: (source: 'online' | 'csv') => void;
  setLoading: (loading: boolean) => void;
}

export default function SettingsPanel({ setLoading }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dataSource, setDataSource] = useState<'online' | 'csv'>('csv');

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSource = e.target.value as 'online' | 'csv';
    setDataSource(newSource);
    setLoading(true);

    // Call appropriate backend API
    try {
      const endpoint =
        newSource === 'online'
          ? 'http://localhost:5000/api/scrape'
          : 'http://localhost:5000/api/process-csv';

      const res = await fetch(endpoint, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to trigger data update');

      console.log(`✅ ${newSource.toUpperCase()} data pipeline triggered.`);

      // Notify parent to re-fetch data
    } catch (err) {
      console.error('❌ Error updating data source:', err);
    } finally {
      setLoading(false); // hide loading overlay
    }
  };

  return (
    <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 1500 }}>
      {/* Settings Icon Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: 'white',
          borderRadius: '50%',
          padding: '10px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Settings"
      >
        <Settings size={20} color="#333" />
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            marginTop: '10px',
            position: 'absolute',
            right: 0,
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '12px 16px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            minWidth: '200px',
            zIndex: 1501,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>Settings</div>

          {/* Data Source Toggle */}
          <label htmlFor="data-source" style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
            Data Source
          </label>
          <select
            id="data-source"
            value={dataSource}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '6px',
              fontSize: '14px',
              marginBottom: '12px',
              backgroundColor: '#f1f5f9',
              color: '#333',
              border: '1px solid #ccc',
              borderRadius: '4px',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
            }}
          >
            <option value="csv">Local data</option>
            <option value="online">Online (Reddit)</option>
          </select>
        </div>
      )}
    </div>
  );
}
