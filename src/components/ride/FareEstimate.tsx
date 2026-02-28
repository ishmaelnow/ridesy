import { ArrowLeft, Car, Zap, Users } from "lucide-react";
import { useRide } from "@/contexts/RideContext";
import { useState } from "react";

const rideTypes = [
  { id: "standard", label: "Standard", icon: Car, multiplier: 1, eta: "4 min", desc: "Affordable rides" },
  { id: "premium", label: "Premium", icon: Zap, multiplier: 1.8, eta: "2 min", desc: "Luxury vehicles" },
  { id: "shared", label: "Shared", icon: Users, multiplier: 0.7, eta: "7 min", desc: "Share & save" },
];

export default function FareEstimate() {
  const { setStatus, ride, requestRide } = useRide();
  const [selected, setSelected] = useState("standard");

  const selectedType = rideTypes.find((r) => r.id === selected)!;
  const fare = (ride.fare * selectedType.multiplier).toFixed(2);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setStatus("selecting_destination")} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">To</p>
          <p className="text-sm font-medium text-foreground truncate">{ride.dropoff?.address}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{ride.distance}</p>
          <p className="text-xs text-muted-foreground">{ride.duration}</p>
        </div>
      </div>

      {/* Ride Types */}
      <div className="space-y-2">
        {rideTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelected(type.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              selected === type.id
                ? "bg-primary/10 border border-primary/30"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              selected === type.id ? "bg-primary/20" : "bg-muted"
            }`}>
              <type.icon className={`w-5 h-5 ${selected === type.id ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">{type.label}</p>
              <p className="text-xs text-muted-foreground">{type.desc}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                ${(ride.fare * type.multiplier).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">{type.eta}</p>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={requestRide}
        className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform"
      >
        Request {selectedType.label} · ${fare}
      </button>
    </div>
  );
}
