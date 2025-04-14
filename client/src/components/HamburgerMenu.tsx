import { useState } from 'react';
import neighbourhoods from '../../../server/data/neighbourhoods.json';

interface HamburgerMenuProps {
  isOpen: boolean;
  onSearch: (query: string) => void;
  onToggle: () => void;
  onSelectNeighbourhood: (lat: number | null, lng: number | null) => void;
}

export default function HamburgerMenu({ isOpen, onSearch, onToggle, onSelectNeighbourhood }: HamburgerMenuProps) {
  const [search, setSearch] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onSearch(value);
  
    if (value.trim() === '') {
      onSelectNeighbourhood(null, null); // This clears the zoomed-in marker
    }
  };

  const filtered = neighbourhoods.filter(n =>
    n.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: isOpen ? '0' : '-360px',
          width: '340px',
          height: '100vh',
          backgroundColor: 'rgba(255, 255, 255, 0.97)',
          boxShadow: '2px 0 6px rgba(0, 0, 0, 0.2)',
          padding: '16px 36px',
          paddingTop: '70px',
          boxSizing: 'border-box',
          transition: 'left 0.3s ease-in-out',
          zIndex: 1000
        }}
      >
        <input
          type="text"
          value={search}
          onChange={handleInputChange}
          placeholder="Search neighbourhood..."
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '14px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            color: 'black',
            boxSizing: 'border-box',
            outline: 'none',
            marginBottom: '12px'
          }}
        />
        <div style={{ maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
          {filtered.map((n, index) => (
            <div
              key={index}
              onClick={() => onSelectNeighbourhood(n.lat, n.lng)}
              style={{ padding: '8px 4px', color: 'black',
                cursor: 'pointer',
                borderBottom: '1px solid #eee'
              }}
            >
              {n.name}
            </div>
          ))}
        </div>
      </div>

      {/* Toggle Button */}
      <div
        style={{
          position: 'absolute',
          top: '15px',
          left: isOpen ? '290px' : '15px',
          zIndex: 1100,
          background: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: isOpen ? undefined : '0 2px 4px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          color: 'black',
          transition: 'left 0.3s ease-in-out'
        }}
        onClick={onToggle}
      >
        {isOpen ? '✕' : '☰'}
      </div>
    </>
  );
}
