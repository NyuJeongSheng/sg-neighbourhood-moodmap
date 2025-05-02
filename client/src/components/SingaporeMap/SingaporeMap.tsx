import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import HamburgerMenu from '../HamburgerMenu/HamburgerMenu';
import FilterPanel from '../FilterPanel/FilterPanel';
import CommentsPanel from '../CommentsPanel/CommentsPanel';
import SettingsPanel from '../SettingsPanel/SettingsPanel';
import { API_BASE } from '../../utils/apiBase';

interface Neighbourhood {
  name: string;
  lat: number;
  lng: number;
}

interface SingaporeMapProps {
  setLoading: (loading: boolean) => void;
}

const singaporeBounds = L.latLngBounds(
  [1.200, 103.600],
  [1.500, 104.020]
);

const getMarkerColor = (score: number | undefined): string => {
  if (score === undefined) return 'grey';
  if (score >= 0.5) return 'green';
  if (score >= 0.25) return 'yellow';
  if (score >= -0.25) return 'orange';
  return 'red';
};

const createColoredIcon = (color: string) =>
  new L.Icon({
    iconUrl: `/markers/marker-icon-${color}.png`,
    shadowUrl: `/markers/marker-shadow.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

export default function SingaporeMap({ setLoading }: SingaporeMapProps) {
  const [filters, setFilters] = useState(['green', 'yellow', 'orange', 'red', 'grey']);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [neighbourhoods, setNeighbourhoods] = useState<Neighbourhood[]>([]);
  const [sentimentScores, setSentimentScores] = useState<Record<string, number>>({});

  const mapRef = useRef<LeafletMap | null>(null);
  const markerRefs = useRef<Record<string, L.Marker>>({});

  const fetchData = async () => {
    try {
      const [neighRes, sentimentRes] = await Promise.all([
        fetch(`${API_BASE}/files/raw/neighbourhoods.json`),
        fetch(`${API_BASE}/files/processed/neighbourhood_sentiment.json`)
      ]);
      const neighData = await neighRes.json();
      const sentimentData = await sentimentRes.json();
      setNeighbourhoods(neighData);
      setSentimentScores(sentimentData.sentiment || {});
    } catch (err) {
      console.error('Failed to load map data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSettingsChange = () => {
    fetchData();
  };

  const handleResetView = () => {
    mapRef.current?.setView([1.3621, 103.7958], 13);
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
            map.setView([lat, lng], 15, { animate: true });
            setSelectedNeighbourhood({ name: match.name, lat, lng });
            setSelectedName(match.name);

            map.panTo([lat, lng], { animate: true });

            setTimeout(() => {
              const marker = markerRefs.current[match.name];
              if (marker) marker.openPopup();
            }, 250);
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

      <SettingsPanel setLoading={setLoading} onSettingsChange={handleSettingsChange} />

      <MapContainer
        center={[1.3621, 103.7958]}
        zoom={13}
        minZoom={13}
        zoomControl={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        maxBounds={singaporeBounds}
        maxBoundsViscosity={1.0}
        style={{ height: '100vh', width: '100vw' }}
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
          .filter(n => n.name.toLowerCase().includes(searchQuery))
          .map((n, i) => {
            const score = sentimentScores[n.name];
            const color = getMarkerColor(score);
            if (!filters.includes(color)) return null;

            return (
              <Marker
                key={i}
                position={[n.lat, n.lng]}
                icon={createColoredIcon(color)}
                eventHandlers={{
                  click: () => {
                    const map = mapRef.current;
                    if (map) {
                      map.setView([n.lat, n.lng], 15);
                      setSelectedNeighbourhood({ name: n.name, lat: n.lat, lng: n.lng });
                      setSelectedName(n.name);
                    }
                  }
                }}
                ref={(ref) => {
                  if (ref) markerRefs.current[n.name] = ref;
                }}
              >
                <Popup autoPan={false}>
                  <strong>{n.name}</strong>
                  <br />
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
