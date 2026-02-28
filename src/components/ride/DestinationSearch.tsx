import { MapPin, ArrowLeft, Navigation } from "lucide-react";
import { useRide } from "@/contexts/RideContext";
import { useState } from "react";

const suggestions = [
  { address: "Times Square, Manhattan", distance: "2.3 mi" },
  { address: "Central Park Zoo", distance: "1.8 mi" },
  { address: "Grand Central Terminal", distance: "3.1 mi" },
  { address: "Brooklyn Bridge", distance: "4.5 mi" },
  { address: "JFK International Airport", distance: "15.2 mi" },
];

export default function DestinationSearch() {
  const { setStatus, setRide } = useRide();
  const [pickup, setPickup] = useState("Current Location");
  const [dropoff, setDropoff] = useState("");

  const handleSelect = (address: string) => {
    setDropoff(address);
    setRide((prev) => ({
      ...prev,
      pickup: { lat: 40.7128, lng: -74.006, address: pickup },
      dropoff: { lat: 40.758, lng: -73.9855, address },
      fare: +(Math.random() * 20 + 8).toFixed(2),
      distance: (Math.random() * 10 + 1).toFixed(1) + " mi",
      duration: Math.floor(Math.random() * 25 + 5) + " min",
    }));
    setStatus("fare_estimate");
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
        <div className="flex items-center gap-3 bg-secondary rounded-xl px-3 py-3">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <input
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Pickup location"
          />
        </div>
        <div className="flex items-center gap-3 bg-secondary rounded-xl px-3 py-3">
          <div className="w-2.5 h-2.5 rounded-sm bg-accent" />
          <input
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Where to?"
            autoFocus
          />
        </div>
      </div>

      {/* Suggestions */}
      <div className="space-y-0.5 max-h-48 overflow-y-auto">
        {suggestions.map((s) => (
          <button
            key={s.address}
            onClick={() => handleSelect(s.address)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm text-foreground">{s.address}</p>
              <p className="text-xs text-muted-foreground">{s.distance}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
