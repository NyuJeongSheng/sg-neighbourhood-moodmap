import { useState } from 'react';
import styles from './HamburgerMenu.module.css';
import neighbourhoods from '../../../../server/data/raw/neighbourhoods.json';

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
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : styles.sidebarClosed}`}
      >
        {/* Close Button */}
        <div className={styles.closeButton} onClick={onToggle}>✕</div>

        {/* Search Bar */}
        <div className={styles.searchWrapper}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              value={search}
              onChange={handleInputChange}
              placeholder="Search neighbourhood..."
              className={styles.searchInput}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  onSearch('');
                  onSelectNeighbourhood(null, null, null);
                }}
                className={styles.clearInside}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Neighbourhood List */}
        <div className={styles.neighbourhoodList}>
          {filtered.map((n, index) => (
            <div
              key={index}
              onClick={() => onSelectNeighbourhood(n.lat, n.lng, n.name)}
              className={styles.neighbourhoodItem}
            >
              {n.name}
            </div>
          ))}
        </div>
      </div>

      {/* Always-visible Toggle Button */}
      <div className={styles.toggleButton} onClick={onToggle}>☰</div>
    </>
  );
}
