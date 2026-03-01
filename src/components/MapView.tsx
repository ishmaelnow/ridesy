import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import { useRide } from "@/contexts/RideContext";

export default function MapView({ showDriver }: { showDriver?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const riderMarkerRef = useRef<L.CircleMarker | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropoffMarkerRef = useRef<L.Marker | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const { ride, status, userLocation } = useRide();

  const userPos: [number, number] | null = userLocation
    ? [userLocation.lat, userLocation.lng]
    : null;

  const initMap = useCallback(() => {
    const el = containerRef.current;
    if (!el || mapRef.current || !userPos) return;
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
      setTimeout(() => map.invalidateSize({ animate: false }), 500);
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

  // User location blue dot
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng(userPos);
    } else {
      riderMarkerRef.current = L.circleMarker(userPos, {
        radius: 8,
        fillColor: "hsl(152,70%,48%)",
        fillOpacity: 1,
        color: "#fff",
        weight: 3,
      }).addTo(map);
    }
  }, [userPos, mapReady]);

  // Pickup & Dropoff markers + route line
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const pickup = ride.pickup;
    const dropoff = ride.dropoff;

    // Pickup marker (green)
    if (pickup) {
      const pos: [number, number] = [pickup.lat, pickup.lng];
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:20px;height:20px;background:hsl(152,70%,48%);border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setLatLng(pos);
      } else {
        pickupMarkerRef.current = L.marker(pos, { icon }).addTo(map);
      }
    } else if (pickupMarkerRef.current) {
      pickupMarkerRef.current.remove();
      pickupMarkerRef.current = null;
    }

    // Dropoff marker (red)
    if (dropoff) {
      const pos: [number, number] = [dropoff.lat, dropoff.lng];
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:20px;height:20px;background:hsl(0,80%,55%);border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      if (dropoffMarkerRef.current) {
        dropoffMarkerRef.current.setLatLng(pos);
      } else {
        dropoffMarkerRef.current = L.marker(pos, { icon }).addTo(map);
      }
    } else if (dropoffMarkerRef.current) {
      dropoffMarkerRef.current.remove();
      dropoffMarkerRef.current = null;
    }

    // Route line
    if (pickup && dropoff) {
      const points: [number, number][] = [
        [pickup.lat, pickup.lng],
        [dropoff.lat, dropoff.lng],
      ];
      if (routeLineRef.current) {
        routeLineRef.current.setLatLngs(points);
      } else {
        routeLineRef.current = L.polyline(points, {
          color: "hsl(152,70%,48%)",
          weight: 4,
          opacity: 0.8,
          dashArray: "8, 8",
        }).addTo(map);
      }
      // Fit map to show both points
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15, animate: true });
    } else if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    // If only pickup, pan to it
    if (pickup && !dropoff) {
      map.setView([pickup.lat, pickup.lng], 15, { animate: true });
    }
  }, [ride.pickup, ride.dropoff, mapReady]);

  // Reset map view when idle
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (status === "idle") {
      // Clean up markers
      pickupMarkerRef.current?.remove(); pickupMarkerRef.current = null;
      dropoffMarkerRef.current?.remove(); dropoffMarkerRef.current = null;
      routeLineRef.current?.remove(); routeLineRef.current = null;
      map.setView(userPos, 15, { animate: true });
    }
  }, [status, mapReady, userPos]);

  // Driver marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    if (showDriver && ride.pickup) {
      const driverPos: [number, number] = [ride.pickup.lat + 0.003, ride.pickup.lng - 0.002];
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
  }, [showDriver, ride.pickup, mapReady]);

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
