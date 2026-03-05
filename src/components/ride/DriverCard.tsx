import { Phone, MessageCircle, Star } from "lucide-react";
import { useRide } from "@/contexts/RideContext";
import { useNavigate } from "react-router-dom";

export default function DriverCard() {
  const { ride, status, cancelRide } = useRide();
  const navigate = useNavigate();
  const driver = ride.driver;

  if (!driver) return null;

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <p className="text-sm font-medium text-foreground">
          {status === "driver_accepted" && `Driver is ${driver.eta} min away`}
          {status === "driver_arriving" && "Driver is arriving"}
        </p>
      </div>

      {/* Driver Info */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-foreground">
          {driver.name.charAt(0)}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{driver.name}</p>
          <p className="text-xs text-muted-foreground">{driver.car}</p>
        </div>
        <div className="flex items-center gap-0.5 bg-secondary px-2 py-1 rounded-lg">
          <Star className="w-3.5 h-3.5 text-warning fill-warning" />
          <span className="text-xs font-medium text-foreground">{driver.rating}</span>
        </div>
      </div>

      {/* Plate */}
      <div className="bg-secondary rounded-xl px-4 py-2.5 text-center">
        <p className="text-lg font-bold tracking-widest text-foreground">{driver.plate}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate("/chat")}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-foreground text-sm font-medium active:scale-95 transition-transform"
        >
          <MessageCircle className="w-4 h-4" />
          Message
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium active:scale-95 transition-transform">
          <Phone className="w-4 h-4" />
          Call
        </button>
      </div>

      {/* Cancel */}
      <button
        onClick={cancelRide}
        className="w-full py-2.5 rounded-xl border border-destructive/40 text-destructive text-sm font-medium active:scale-95 transition-transform"
      >
        Cancel Ride
      </button>
    </div>
  );
}
