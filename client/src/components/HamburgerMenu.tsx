import { useState } from 'react';
import neighbourhoods from '../../../server/data/neighbourhoods.json';

interface HamburgerMenuProps {
  isOpen: boolean;
  onSearch: (query: string) => void;
  onToggle: () => void;
  onSelectNeighbourhood: (lat: number | null, lng: number | null, name: string | null) => void;
}

export default function HamburgerMenu({ isOpen, onSearch, onToggle, onSelectNeighbourhood }: HamburgerMenuProps) {
  const [search, setSearch] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onSearch(value);

    if (value.trim() === '') {
      onSelectNeighbourhood(null, null, null);
    }
  };

  const filtered = neighbourhoods.filter(n =>
    n.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Sidebar */}
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: isOpen ? '0' : '-360px',
          width: '340px',
          height: '100vh',
          background: 'linear-gradient(to bottom, #f8fafc, #ffffff)',
          boxShadow: '4px 0 12px rgba(0,0,0,0.1)',
          padding: '28px 32px 16px',
          boxSizing: 'border-box',
          transition: 'left 0.3s ease-in-out',
          zIndex: 1101,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        {/* ✕ Close Button */}
        <div
          onClick={onToggle}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            color: '#1f2937',
            cursor: 'pointer',
            zIndex: 1002
          }}
        >
          ✕
        </div>

        {/* Search Bar */}
        <div style={{ marginTop: '48px', marginBottom: '20px' }}>
          <input
            type="text"
            value={search}
            onChange={handleInputChange}
            placeholder="Search neighbourhood..."
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff',
              color: '#111827',
              boxSizing: 'border-box',
              outline: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}
          />
        </div>

        {/* Neighbourhood List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.map((n, index) => (
            <div
              key={index}
              onClick={() => onSelectNeighbourhood(n.lat, n.lng, n.name)}
              style={{
                padding: '12px 14px',
                color: '#1e293b',
                cursor: 'pointer',
                borderRadius: '8px',
                marginBottom: '10px',
                transition: 'all 0.2s ease-in-out',
                fontSize: '15px',
                fontWeight: 500,
                backgroundColor: '#f1f5f9'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#f1f5f9')}
            >
              {n.name}
            </div>
          ))}
        </div>
      </div>

      {/* Toggle Button - always visible */}
      <div
        onClick={onToggle}
        style={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          zIndex: 1100,
          background: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          color: 'black',
          fontSize: '18px'
        }}
      >
        ☰
      </div>
    </>
  );
}