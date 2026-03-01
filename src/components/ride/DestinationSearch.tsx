import { MapPin, ArrowLeft, Navigation, Loader2 } from "lucide-react";
import { useRide } from "@/contexts/RideContext";
import { useState, useRef, useEffect } from "react";
import { geocodeAddress, type GeoResult } from "@/lib/geocode";

type ActiveField = "pickup" | "dropoff";

export default function DestinationSearch() {
  const { setStatus, setRide, userLocation } = useRide();
  const [pickup, setPickup] = useState(userLocation?.address || "Current Location");
  const [dropoff, setDropoff] = useState("");
  const [activeField, setActiveField] = useState<ActiveField>("dropoff");
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(
    userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null
  );
  const pickupRef = useRef<HTMLInputElement>(null);
  const dropoffRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync with context location
  useEffect(() => {
    if (userLocation && !pickupCoords) {
      setPickupCoords({ lat: userLocation.lat, lng: userLocation.lng });
      setPickup(userLocation.address);
    }
  }, [userLocation]);

  // Debounced geocoding
  const searchAddress = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query === "Current Location") {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const results = await geocodeAddress(query);
      setSuggestions(results);
      setLoading(false);
    }, 400);
  };

  const handlePickupChange = (val: string) => {
    setPickup(val);
    searchAddress(val);
  };

  const handleDropoffChange = (val: string) => {
    setDropoff(val);
    searchAddress(val);
  };

  const handleSelect = (result: GeoResult) => {
    if (activeField === "pickup") {
      setPickup(result.displayName.split(",").slice(0, 2).join(","));
      setPickupCoords({ lat: result.lat, lng: result.lng });
      setSuggestions([]);
      setActiveField("dropoff");
      dropoffRef.current?.focus();
    } else {
      const pCoords = pickupCoords || (userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null);
      const pickupAddress = pickup || userLocation?.address || "Current Location";
      const shortName = result.displayName.split(",").slice(0, 2).join(",");
      setDropoff(shortName);

      // Calculate rough fare/distance
      const dist = haversine(pCoords.lat, pCoords.lng, result.lat, result.lng);
      const fare = Math.max(5, dist * 2.5 + 3);
      const duration = Math.max(3, Math.round(dist * 2.5));

      setRide((prev) => ({
        ...prev,
        pickup: { lat: pCoords.lat, lng: pCoords.lng, address: pickupAddress },
        dropoff: { lat: result.lat, lng: result.lng, address: shortName },
        fare: +fare.toFixed(2),
        distance: dist.toFixed(1) + " mi",
        duration: duration + " min",
      }));
      setStatus("fare_estimate");
    }
  };

  const handleCurrentLocation = () => {
    if (activeField === "pickup" && userLocation) {
      setPickup(userLocation.address);
      setPickupCoords({ lat: userLocation.lat, lng: userLocation.lng });
      setSuggestions([]);
      setActiveField("dropoff");
      dropoffRef.current?.focus();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => setStatus("idle")} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="text-base font-semibold text-foreground">Set destination</h2>
      </div>

      {/* Input Fields */}
      <div className="space-y-2">
        <div
          className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
            activeField === "pickup"
              ? "bg-primary/10 ring-1 ring-primary/30"
              : "bg-secondary"
          }`}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <input
            ref={pickupRef}
            value={pickup}
            onChange={(e) => handlePickupChange(e.target.value)}
            onFocus={() => { setActiveField("pickup"); setSuggestions([]); }}
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Pickup location"
          />
          {activeField === "pickup" && pickup && (
            <button
              onClick={() => { setPickup(""); pickupRef.current?.focus(); setSuggestions([]); }}
              className="text-xs text-muted-foreground hover:text-foreground px-1"
            >
              ✕
            </button>
          )}
        </div>
        <div
          className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
            activeField === "dropoff"
              ? "bg-primary/10 ring-1 ring-primary/30"
              : "bg-secondary"
          }`}
        >
          <div className="w-2.5 h-2.5 rounded-sm bg-accent" />
          <input
            ref={dropoffRef}
            value={dropoff}
            onChange={(e) => handleDropoffChange(e.target.value)}
            onFocus={() => { setActiveField("dropoff"); setSuggestions([]); }}
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Where to?"
            autoFocus
          />
          {activeField === "dropoff" && dropoff && (
            <button
              onClick={() => { setDropoff(""); dropoffRef.current?.focus(); setSuggestions([]); }}
              className="text-xs text-muted-foreground hover:text-foreground px-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground px-1">
        {activeField === "pickup" ? "Search pickup point" : "Search destination"}
      </p>

      {/* Current Location option */}
      {activeField === "pickup" && (
        <button
          onClick={handleCurrentLocation}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <Navigation className="w-4 h-4 text-primary" />
          </div>
          <p className="text-sm text-foreground">Current Location</p>
        </button>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        </div>
      )}

      {/* Geocoded Suggestions */}
      <div className="space-y-0.5 max-h-48 overflow-y-auto">
        {suggestions.map((s, i) => (
          <button
            key={`${s.lat}-${s.lng}-${i}`}
            onClick={() => handleSelect(s)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-foreground text-left line-clamp-2">{s.displayName}</p>
          </button>
        ))}
        {!loading && suggestions.length === 0 && (activeField === "dropoff" ? dropoff : (pickup && pickup !== "Current Location")) && (
          <p className="text-xs text-muted-foreground text-center py-3">Type to search real addresses</p>
        )}
      </div>
    </div>
  );
}

// Haversine distance in miles
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
