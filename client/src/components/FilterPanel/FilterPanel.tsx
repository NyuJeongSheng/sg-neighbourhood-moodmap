import { Check } from 'lucide-react';
import styles from './FilterPanel.module.css';

interface FilterPanelProps {
  filters: string[];
  setFilters: (filters: string[] | ((prev: string[]) => string[])) => void;
  selectedNeighbourhood: { lat: number; lng: number } | null;
  onResetView: () => void;
}

const colorLabels: Record<string, string> = {
  green: 'Good',
  yellow: 'OK',
  orange: 'Neutral',
  red: 'Bad',
  grey: 'N/A',
};

const allColors = Object.keys(colorLabels);

export default function FilterPanel({
  filters,
  setFilters,
  selectedNeighbourhood,
  onResetView,
}: FilterPanelProps) {
  const toggleFilter = (color: string) => {
    setFilters(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  return (
    <div className={styles.panel}>
      {selectedNeighbourhood ? (
        <button className={styles.buttonReset} onClick={onResetView}>
          Reset View
        </button>
      ) : (
        <>
          <button className={styles.button} onClick={() => setFilters(allColors)}>
            Select All
          </button>

          <div className={styles.colorGroup}>
            {allColors.map(color => {
              const isSelected = filters.includes(color);
              return (
                <label
                  key={color}
                  onClick={() => toggleFilter(color)}
                  className={styles.label}
                >
                  <div
                    className={`${styles.checkbox} ${
                      isSelected ? styles.checkboxActive : styles.checkboxInactive
                    }`}
                  >
                    {isSelected && <Check size={16} color="white" strokeWidth={3} />}
                  </div>
                  {colorLabels[color]}
                </label>
              );
            })}
          </div>

          <button className={styles.button} onClick={() => setFilters([])}>
            Clear All
          </button>
        </>
      )}
    </div>
  );
}
