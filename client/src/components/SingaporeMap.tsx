import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import neighbourhoods from '../../../server/data/neighbourhoods.json';
import sentimentScoresRaw from '../../../server/data/neighbourhood_sentiment.json';
import HamburgerMenu from './HamburgerMenu';
import FilterPanel from './FilterPanel';
import CommentsPanel from './CommentsPanel';

const singaporeBounds = L.latLngBounds([
  [1.230, 103.660],
  [1.480, 103.960]
]);

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
  const [filters, setFilters] = useState<string[]>(['green', 'yellow', 'orange', 'red', 'grey']);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState<{ name: string, lat: number, lng: number } | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRefs = useRef<Record<string, L.Marker>>({});

  const handleResetView = () => {
    const map = mapRef.current;
    if (map) {
      map.setView([1.3621, 103.7958], 13);
    }
    setSelectedNeighbourhood(null);
    setSelectedName(null);
  };

  return (
    <div>
      <HamburgerMenu
        isOpen={menuOpen}
        onSearch={(query) => setSearchQuery(query.toLowerCase())}
        onToggle={() => setMenuOpen(!menuOpen)}
        onSelectNeighbourhood={(lat, lng, name) => {
          const map = mapRef.current;
          const match = neighbourhoods.find(n => n.name === name);
        
          if (lat !== null && lng !== null && map && match) {
            setSelectedNeighbourhood({ name: match.name, lat, lng });
            setSelectedName(match.name);
        
            // First pan the marker exactly to the center
            map.panTo([lat, lng], { animate: true });
        
            // Delay the popup slightly to avoid visual shift
            setTimeout(() => {
              const marker = markerRefs.current[match.name];
              if (marker) marker.openPopup();
            }, 250); // popup after pan animation
          } else {
            setSelectedNeighbourhood(null);
            setSelectedName(null);
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
        maxBounds={singaporeBounds}
        maxBoundsViscosity={1.0}
        whenReady={() => {
          const map = mapRef.current;
          if (map) {
            map.touchZoom.disable();
            map.boxZoom.disable();
            map.keyboard.disable();
            map.dragging.disable();
            map.zoomControl?.remove();
          }
        }}
        ref={mapRef}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" />

        {neighbourhoods
          .filter((n) => n.name.toLowerCase().includes(searchQuery))
          .map((n, i) => {
            const score = sentimentScores[n.name];
            const color = getMarkerColor(score);
            if (!filters.includes(color)) return null;

            const icon = createColoredIcon(color);
            return (
              <Marker
                key={i}
                position={[n.lat, n.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    const map = mapRef.current;
                    if (map) {
                      console.log("relocate");
                      console.log(n.lat + ", " + n.lng);
                      map.setView([n.lat, n.lng], 15);

                      setSelectedNeighbourhood({ name: n.name, lat: n.lat, lng: n.lng });
                      setSelectedName(n.name);
                    }
                  }
                }}
                ref={(ref) => {
                  if (ref) {
                    markerRefs.current[n.name] = ref;
                  }
                }}
              >
                <Popup autoPan={false}>
                  <strong>{n.name}</strong><br />
                  {score !== undefined ? `Sentiment: ${score}` : 'No sentiment data'}
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {selectedName && (
        <CommentsPanel
          neighbourhoodName={selectedName}
          onClose={handleResetView}
        />
      )}
    </div>
  );
}
