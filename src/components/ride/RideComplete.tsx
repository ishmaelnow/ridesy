import { Star, Check } from "lucide-react";
import { useRide } from "@/contexts/RideContext";
import { useState } from "react";

export default function RideComplete() {
  const { ride, cancelRide } = useRide();
  const [rating, setRating] = useState(0);

  return (
    <div className="space-y-5 py-2">
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-3">
          <Check className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Ride Complete!</h3>
        <p className="text-2xl font-bold text-foreground mt-1">${ride.fare.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground">Paid from wallet</p>
      </div>

      {/* Rating */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">Rate your driver</p>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => setRating(star)}>
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= rating ? "text-warning fill-warning" : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={cancelRide}
        className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform"
      >
        Done
      </button>
    </div>
  );
}
