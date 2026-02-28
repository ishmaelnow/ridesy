import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

const riderIcon = L.divIcon({
  className: "",
  html: `<div style="width:20px;height:20px;background:hsl(152,70%,48%);border:3px solid white;border-radius:50%;box-shadow:0 0 12px rgba(74,222,128,0.5);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const driverIcon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;background:hsl(220,15%,6%);border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.4);"><svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15, { animate: true });
  }, [lat, lng, map]);
  return null;
}

export default function MapView({ showDriver }: { showDriver?: boolean }) {
  const [position, setPosition] = useState<[number, number]>([40.7128, -74.006]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      () => {} // Fallback to default
    );
  }, []);

  // Simulate driver position nearby
  const driverPos: [number, number] = [position[0] + 0.003, position[1] - 0.002];

  return (
    <MapContainer
      center={position}
      zoom={15}
      className="absolute inset-0 z-0"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        maxZoom={19}
      />
      <RecenterMap lat={position[0]} lng={position[1]} />
      <Marker position={position} icon={riderIcon} />
      {showDriver && <Marker position={driverPos} icon={driverIcon} />}
    </MapContainer>
  );
}
