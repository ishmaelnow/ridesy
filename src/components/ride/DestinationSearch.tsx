import { MapPin, ArrowLeft, Navigation } from "lucide-react";
import { useRide } from "@/contexts/RideContext";
import { useState, useRef } from "react";

const pickupSuggestions = [
  { address: "Current Location", distance: "", isCurrentLocation: true },
  { address: "Penn Station, Manhattan", distance: "0.5 mi" },
  { address: "Union Square, Manhattan", distance: "1.2 mi" },
  { address: "Columbus Circle", distance: "2.0 mi" },
  { address: "Wall Street, Financial District", distance: "1.4 mi" },
];

const dropoffSuggestions = [
  { address: "Times Square, Manhattan", distance: "2.3 mi" },
  { address: "Central Park Zoo", distance: "1.8 mi" },
  { address: "Grand Central Terminal", distance: "3.1 mi" },
  { address: "Brooklyn Bridge", distance: "4.5 mi" },
  { address: "JFK International Airport", distance: "15.2 mi" },
];

type ActiveField = "pickup" | "dropoff";

export default function DestinationSearch() {
  const { setStatus, setRide } = useRide();
  const [pickup, setPickup] = useState("Current Location");
  const [dropoff, setDropoff] = useState("");
  const [activeField, setActiveField] = useState<ActiveField>("dropoff");
  const pickupRef = useRef<HTMLInputElement>(null);
  const dropoffRef = useRef<HTMLInputElement>(null);

  const filteredPickupSuggestions = pickup && pickup !== "Current Location"
    ? pickupSuggestions.filter((s) =>
        s.address.toLowerCase().includes(pickup.toLowerCase())
      )
    : pickupSuggestions;

  const filteredDropoffSuggestions = dropoff
    ? dropoffSuggestions.filter((s) =>
        s.address.toLowerCase().includes(dropoff.toLowerCase())
      )
    : dropoffSuggestions;

  const suggestions = activeField === "pickup" ? filteredPickupSuggestions : filteredDropoffSuggestions;

  const handleSelectDropoff = (address: string) => {
    setDropoff(address);
    const pickupAddress = pickup || "Current Location";
    setRide((prev) => ({
      ...prev,
      pickup: { lat: 40.7128, lng: -74.006, address: pickupAddress },
      dropoff: { lat: 40.758, lng: -73.9855, address },
      fare: +(Math.random() * 20 + 8).toFixed(2),
      distance: (Math.random() * 10 + 1).toFixed(1) + " mi",
      duration: Math.floor(Math.random() * 25 + 5) + " min",
    }));
    setStatus("fare_estimate");
  };

  const handleSelectPickup = (address: string) => {
    setPickup(address);
    setActiveField("dropoff");
    dropoffRef.current?.focus();
  };

  const handleSelect = (address: string) => {
    if (activeField === "pickup") {
      handleSelectPickup(address);
    } else {
      handleSelectDropoff(address);
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
            onChange={(e) => setPickup(e.target.value)}
            onFocus={() => setActiveField("pickup")}
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Pickup location"
          />
          {activeField === "pickup" && pickup && (
            <button
              onClick={() => {
                setPickup("");
                pickupRef.current?.focus();
              }}
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
            onChange={(e) => setDropoff(e.target.value)}
            onFocus={() => setActiveField("dropoff")}
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Where to?"
            autoFocus
          />
          {activeField === "dropoff" && dropoff && (
            <button
              onClick={() => {
                setDropoff("");
                dropoffRef.current?.focus();
              }}
              className="text-xs text-muted-foreground hover:text-foreground px-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Active field label */}
      <p className="text-xs text-muted-foreground px-1">
        {activeField === "pickup" ? "Select pickup point" : "Select destination"}
      </p>

      {/* Suggestions */}
      <div className="space-y-0.5 max-h-48 overflow-y-auto">
        {suggestions.map((s) => (
          <button
            key={s.address}
            onClick={() => handleSelect(s.address)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              {"isCurrentLocation" in s && s.isCurrentLocation ? (
                <Navigation className="w-4 h-4 text-primary" />
              ) : (
                <MapPin className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm text-foreground">{s.address}</p>
              {s.distance && <p className="text-xs text-muted-foreground">{s.distance}</p>}
            </div>
          </button>
        ))}
        {suggestions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No results found</p>
        )}
      </div>
    </div>
  );
}
