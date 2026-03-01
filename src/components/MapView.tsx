import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";

export default function MapView({ showDriver }: { showDriver?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [position, setPosition] = useState<[number, number]>([40.7128, -74.006]);
  const riderMarkerRef = useRef<L.CircleMarker | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Get user location
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  }, []);

  const initMap = useCallback(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;
    
    const rect = el.getBoundingClientRect();
    // Don't init if container has no real size yet
    if (rect.width < 100 || rect.height < 100) {
      requestAnimationFrame(initMap);
      return;
    }

    const map = L.map(el, {
      center: position,
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setMapReady(true);

    // Invalidate after fully painted
    requestAnimationFrame(() => {
      map.invalidateSize({ animate: false });
      setTimeout(() => map.invalidateSize({ animate: false }), 100);
      setTimeout(() => map.invalidateSize({ animate: false }), 500);
    });

    const ro = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
    };
  }, [position]);

  // Initialize map after mount
  useEffect(() => {
    // Wait for next frame so layout is settled
    const raf = requestAnimationFrame(() => {
      initMap();
    });

    return () => {
      cancelAnimationFrame(raf);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initMap]);

  // Update map center & rider marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.setView(position, 15, { animate: true });

    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng(position);
    } else {
      riderMarkerRef.current = L.circleMarker(position, {
        radius: 8,
        fillColor: "hsl(152,70%,48%)",
        fillOpacity: 1,
        color: "#fff",
        weight: 3,
      }).addTo(map);
    }
  }, [position, mapReady]);

  // Driver marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (showDriver) {
      const driverPos: [number, number] = [position[0] + 0.003, position[1] - 0.002];
      const driverIcon = L.divIcon({
        className: "",
        html: `<div style="width:28px;height:28px;background:hsl(220,15%,6%);border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.4);"><svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng(driverPos);
      } else {
        driverMarkerRef.current = L.marker(driverPos, { icon: driverIcon }).addTo(map);
      }
    } else if (driverMarkerRef.current) {
      driverMarkerRef.current.remove();
      driverMarkerRef.current = null;
    }
  }, [showDriver, position, mapReady]);

  return (
    <div
      ref={containerRef}
      id="map-container"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
      }}
    />
  );
}
