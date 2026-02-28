import { Navigation, MessageCircle, Shield } from "lucide-react";
import { useRide } from "@/contexts/RideContext";
import { useNavigate } from "react-router-dom";

export default function RideActive() {
  const { ride } = useRide();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <p className="text-sm font-medium text-foreground">Ride in progress</p>
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <Navigation className="w-3 h-3" />
          <span>{ride.dropoff?.address}</span>
        </div>
      </div>

      <div className="bg-secondary rounded-xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-muted-foreground">Estimated arrival</p>
            <p className="text-xl font-bold text-foreground">{ride.duration || "12 min"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Distance</p>
            <p className="text-sm font-semibold text-foreground">{ride.distance || "3.2 mi"}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate("/chat")}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-foreground text-sm font-medium"
        >
          <MessageCircle className="w-4 h-4" />
          Message Driver
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 text-destructive text-sm font-medium">
          <Shield className="w-4 h-4" />
          SOS
        </button>
      </div>
    </div>
  );
}
