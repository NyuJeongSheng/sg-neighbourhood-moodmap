import { Check } from 'lucide-react'; // Make sure this is installed

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
const darkColor = '#222'; // dark button/checkbox fill
const lightColor = '#eee'; // unselected fill

export default function FilterPanel({
  filters,
  setFilters,
  selectedNeighbourhood,
  onResetView,
}: FilterPanelProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
      }}
    >
      {selectedNeighbourhood ? (
        <button
          onClick={onResetView}
          style={{
            padding: '8px 20px',
            backgroundColor: darkColor,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Reset View
        </button>
      ) : (
        <>
          <button
            onClick={() => setFilters(allColors)}
            style={{
              padding: '6px 12px',
              backgroundColor: darkColor,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Select All
          </button>

          <div style={{ display: 'flex', gap: '16px' }}>
            {allColors.map((color) => {
              const isSelected = filters.includes(color);
              return (
                <label
                  key={color}
                  onClick={() =>
                    setFilters((prev) =>
                      prev.includes(color)
                        ? prev.filter((c) => c !== color)
                        : [...prev, color]
                    )
                  }
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: 'sans-serif',
                    color: '#333',
                    gap: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: isSelected ? darkColor : lightColor,
                      border: '2px solid #ccc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && (
                      <Check size={16} color="white" strokeWidth={3} />
                    )}
                  </div>
                  {colorLabels[color]}
                </label>
              );
            })}
          </div>

          <button
            onClick={() => setFilters([])}
            style={{
              padding: '6px 12px',
              backgroundColor: darkColor,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Clear All
          </button>
        </>
      )}
    </div>
  );
}
