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
    grey: 'N/A'
  };
  
  const allColors = Object.keys(colorLabels);
  
  export default function FilterPanel({ filters, setFilters, selectedNeighbourhood, onResetView }: FilterPanelProps) {
    return (
      <div
        style={{
          position: 'absolute',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }}
      >
        {selectedNeighbourhood ? (
          <button onClick={onResetView} style={{ padding: '8px 20px', fontWeight: 'bold' }}>Reset View</button>
        ) : (
          <>
            <button onClick={() => setFilters(allColors)} style={{ padding: '4px 10px', marginRight: '10px' }}>Select All</button>
            <div style={{ display: 'flex', gap: '12px' }}>
              {allColors.map((color) => (
                <label
                  key={color}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '80px',
                    color: 'black',
                    textAlign: 'center',
                    fontFamily: 'sans-serif'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={filters.includes(color)}
                    onChange={() =>
                      setFilters((prev: string[]) =>
                        prev.includes(color)
                          ? prev.filter((c: string) => c !== color)
                          : [...prev, color]
                      )
                    }
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>{colorLabels[color]}</span>
                </label>
              ))}
            </div>
            <button onClick={() => setFilters([])} style={{ padding: '4px 10px', marginLeft: '10px' }}>Clear All</button>
          </>
        )}
      </div>
    );
  }