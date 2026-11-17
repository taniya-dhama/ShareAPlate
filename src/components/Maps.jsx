import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Leaflet's default marker images break with bundlers, so point to a CDN copy
const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const INDIA = [20.59, 78.96];

function Recenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, zoom); }, [center, zoom, map]);
  return null;
}

// Shows available food on a map. Coordinates from the API are [lng, lat].
export function ListingsMap({ listings, center }) {
  return (
    <MapContainer center={center || INDIA} zoom={center ? 12 : 5} className="map">
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Recenter center={center} zoom={12} />
      {listings.map((l) => (
        <Marker key={l._id} position={[l.location.coordinates[1], l.location.coordinates[0]]} icon={icon}>
          <Popup><strong>{l.title}</strong><br />{l.quantity} servings<br />{l.address}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function ClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick([e.latlng.lat, e.latlng.lng]) });
  return null;
}

// Donor clicks the map to set the pickup spot. value is [lat, lng].
export function PickerMap({ value, onChange }) {
  return (
    <MapContainer center={value || INDIA} zoom={value ? 15 : 5} className="map small">
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Recenter center={value} zoom={15} />
      <ClickHandler onPick={onChange} />
      {value && <Marker position={value} icon={icon} />}
    </MapContainer>
  );
}
