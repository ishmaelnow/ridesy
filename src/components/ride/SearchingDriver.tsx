import { X } from "lucide-react";
import { useRide } from "@/contexts/RideContext";

export default function SearchingDriver() {
  const { cancelRide } = useRide();

  return (
    <div className="flex flex-col items-center py-6 space-y-5">
      {/* Pulse Animation */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-primary/20 pulse-ring" />
        <div className="absolute inset-2 rounded-full bg-primary/30 pulse-ring" style={{ animationDelay: "0.4s" }} />
        <div className="absolute inset-0 rounded-full bg-primary/40 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-primary" />
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-base font-semibold text-foreground">Finding your driver</h3>
        <p className="text-sm text-muted-foreground mt-1">This usually takes a few seconds...</p>
      </div>

      <button
        onClick={cancelRide}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-medium active:scale-95 transition-transform"
      >
        <X className="w-4 h-4" />
        Cancel
      </button>
    </div>
  );
}
