import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { neighbourhoods } from '../data/neighbourhoods';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for missing icons in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

// Boundaries for Singapore (rough box around the country)
const singaporeBounds = L.latLngBounds(
  [1.130, 103.590], // Southwest corner
  [1.470, 104.100]  // Northeast corner
);

export default function SingaporeMap() {
  return (
    <MapContainer
      center={[1.3521, 103.8198]}
      zoom={13}
      style={{ height: '100vh', width: '100vw' }}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      zoomControl={false}
      attributionControl={false}
      touchZoom={false}
      boxZoom={false}
      keyboard={false}
      maxBounds={singaporeBounds}
      maxBoundsViscosity={1.0} // Makes it "bounce back" if user tries to drag outside
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
      />
      {neighbourhoods.map((neighbourhoods, i) => (
        <Marker key={i} position={[neighbourhoods.lat, neighbourhoods.lng]}>
          <Popup>{neighbourhoods.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
