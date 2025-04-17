// src/components/SettingsPanel/SettingsPanel.tsx
import { useState } from 'react';
import { Settings } from 'lucide-react';

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 1500 }}>
      {/* Icon Button */}
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

      {/* Settings Dropdown */}
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
            minWidth: '160px',
            zIndex: 1501,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '8px', color: 'black' }}>Settings</div>
          <div style={{ fontSize: '14px', color: '#333' }}>Coming soon...</div>
        </div>
      )}
    </div>
  );
}
