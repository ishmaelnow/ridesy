import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import { useDriver } from "@/contexts/DriverContext";

export default function DriverMap({ showRoute }: { showRoute?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [userPos] = useState<[number, number]>([40.7128, -74.006]);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropoffMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const { currentRequest, driverStatus } = useDriver();

  const initMap = useCallback(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 100 || rect.height < 100) {
      requestAnimationFrame(initMap);
      return;
    }

    const map = L.map(el, {
      center: userPos,
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setMapReady(true);

    requestAnimationFrame(() => {
      map.invalidateSize({ animate: false });
      setTimeout(() => map.invalidateSize({ animate: false }), 100);
    });

    const ro = new ResizeObserver(() => map.invalidateSize({ animate: false }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [userPos]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => initMap());
    return () => {
      cancelAnimationFrame(raf);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initMap]);

  // Driver position marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const icon = L.divIcon({
      className: "",
      html: `<div style="width:32px;height:32px;background:hsl(152,70%,40%);border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.4);"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng(userPos);
    } else {
      driverMarkerRef.current = L.marker(userPos, { icon }).addTo(map);
    }
  }, [userPos, mapReady]);

  // Pickup & dropoff for active ride
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    if (showRoute && currentRequest) {
      const { pickup, dropoff } = currentRequest;

      const pickupIcon = L.divIcon({
        className: "",
        html: `<div style="width:20px;height:20px;background:hsl(152,70%,48%);border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      const dropoffIcon = L.divIcon({
        className: "",
        html: `<div style="width:20px;height:20px;background:hsl(0,80%,55%);border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      if (pickupMarkerRef.current) pickupMarkerRef.current.setLatLng([pickup.lat, pickup.lng]);
      else pickupMarkerRef.current = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(map);

      if (dropoffMarkerRef.current) dropoffMarkerRef.current.setLatLng([dropoff.lat, dropoff.lng]);
      else dropoffMarkerRef.current = L.marker([dropoff.lat, dropoff.lng], { icon: dropoffIcon }).addTo(map);

      const points: [number, number][] = [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]];
      if (routeLineRef.current) routeLineRef.current.setLatLngs(points);
      else routeLineRef.current = L.polyline(points, { color: "hsl(152,70%,48%)", weight: 4, opacity: 0.8, dashArray: "8, 8" }).addTo(map);

      map.fitBounds(L.latLngBounds(points), { padding: [80, 80], maxZoom: 15, animate: true });
    } else {
      pickupMarkerRef.current?.remove(); pickupMarkerRef.current = null;
      dropoffMarkerRef.current?.remove(); dropoffMarkerRef.current = null;
      routeLineRef.current?.remove(); routeLineRef.current = null;
    }
  }, [showRoute, currentRequest, mapReady]);

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
    />
  );
}
