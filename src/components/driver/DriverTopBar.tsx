import { Menu } from "lucide-react";
import { useDriver } from "@/contexts/DriverContext";

interface Props {
  onMenuOpen: () => void;
}

export default function DriverTopBar({ onMenuOpen }: Props) {
  const { driverStatus, earnings } = useDriver();

  const statusLabel: Record<string, string> = {
    offline: "Offline",
    online: "Looking for rides…",
    ride_offered: "New ride request!",
    heading_to_pickup: "Heading to pickup",
    at_pickup: "Waiting for rider",
    ride_in_progress: "Ride in progress",
    ride_complete: "Ride complete!",
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-20 safe-top px-4 pt-3">
      <div className="flex items-center justify-between">
        <button
          onClick={onMenuOpen}
          className="w-11 h-11 rounded-full glass flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        <div className="glass rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${driverStatus === "offline" ? "bg-muted-foreground" : "bg-primary animate-pulse"}`} />
          <span className="text-xs font-medium text-foreground">{statusLabel[driverStatus]}</span>
        </div>

        <div className="glass rounded-full px-3 py-2 shadow-lg">
          <span className="text-xs font-semibold text-primary">${earnings.today.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}
