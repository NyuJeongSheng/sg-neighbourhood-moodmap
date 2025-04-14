import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import neighbourhoods from '../../../server/data/neighbourhoods.json';
import sentimentScoresRaw from '../../../server/data/neighbourhood_sentiment.json';
import FilterPanel from './FilterPanel';
import HamburgerMenu from './HamburgerMenu';

const sentimentScores: Record<string, number> = sentimentScoresRaw;

const getMarkerColor = (score: number | undefined): string => {
  if (score === undefined) return 'grey';
  if (score >= 0.50) return 'green';
  if (score >= 0.25) return 'yellow';
  if (score >= -0.25) return 'orange';
  return 'red';
};

const createColoredIcon = (color: string) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

export default function SingaporeMap() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<string[]>(['green', 'yellow', 'orange', 'red', 'grey']);
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState<{ lat: number, lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const mapRef = useRef<LeafletMap | null>(null);

  const handleResetView = () => {
    const map = mapRef.current;
    if (map) map.setView([1.3621, 103.7958], 13);
    setSelectedNeighbourhood(null);
  };

  return (
    <div>
      <HamburgerMenu
        isOpen={menuOpen}
        onToggle={() => setMenuOpen(!menuOpen)}
        onSearch={(query) => setSearchQuery(query.toLowerCase())}
        onSelectNeighbourhood={(lat: number | null, lng: number | null) => {
          const map = mapRef.current;
          if (lat !== null && lng !== null && map) {
            map.setView([lat, lng], 15);
            setSelectedNeighbourhood({ lat, lng });
          } else {
            setSelectedNeighbourhood(null);
          }
        }}
      />

      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        selectedNeighbourhood={selectedNeighbourhood}
        onResetView={handleResetView}
      />

      <MapContainer
        center={[1.3621, 103.7958]}
        zoom={13}
        minZoom={13}
        style={{ height: '100vh', width: '100vw' }}
        zoomControl={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        maxBounds={L.latLngBounds([1.230, 103.660], [1.480, 103.960])}
        maxBoundsViscosity={1.0}
        whenReady={() => {
          const map = mapRef.current;
          if (!map) return;
          map.touchZoom.disable();
          map.boxZoom.disable();
          map.keyboard.disable();
          map.zoomControl?.remove();
        }}
        ref={mapRef}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" />

        {selectedNeighbourhood ? (
          <Marker
            position={[selectedNeighbourhood.lat, selectedNeighbourhood.lng]}
            icon={createColoredIcon(getMarkerColor(
              sentimentScores[
              neighbourhoods.find(n =>
                n.lat === selectedNeighbourhood.lat && n.lng === selectedNeighbourhood.lng
              )?.name || ''
              ]
            ))}
          >
            <Popup>
              <strong>
                {
                  neighbourhoods.find(n =>
                    n.lat === selectedNeighbourhood.lat && n.lng === selectedNeighbourhood.lng
                  )?.name
                }
              </strong>
            </Popup>
          </Marker>
        ) : (
          neighbourhoods.filter(n => n.name.toLowerCase().includes(searchQuery))
            .map((n, i) => {
              const score = sentimentScores[n.name];
              const color = getMarkerColor(score);
              if (!filters.includes(color)) return null;
              const icon = createColoredIcon(color);
              return (
                <Marker key={i} position={[n.lat, n.lng]} icon={icon}>
                  <Popup>
                    <strong>{n.name}</strong><br />
                    {score !== undefined ? `Sentiment: ${score}` : 'No sentiment data'}
                  </Popup>
                </Marker>
              );
            })
        )}
      </MapContainer>
    </div>
  );
}