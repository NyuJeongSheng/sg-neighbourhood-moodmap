import { useState } from 'react';
import { Settings } from 'lucide-react';

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [dataSource, setDataSource] = useState<'online' | 'csv'>('online');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('📁 Uploaded CSV file:', file.name);
      // TODO: parse and store CSV file here
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
            onChange={(e) => setDataSource(e.target.value as 'online' | 'csv')}
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
            <option value="online">Online (Reddit)</option>
            <option value="csv">Import from CSV</option>
          </select>

          {/* File Upload Input (only if CSV selected) */}
          {dataSource === 'csv' && (
            <div>
              <label htmlFor="csv-upload" style={{ fontSize: '13px', marginBottom: '4px', display: 'block' }}>
                Upload CSV File
              </label>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ fontSize: '13px' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
