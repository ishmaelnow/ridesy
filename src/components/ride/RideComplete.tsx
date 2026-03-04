import { Star, Check } from "lucide-react";
import { useRide } from "@/contexts/RideContext";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function RideComplete() {
  const { ride, cancelRide, activeRideId, paymentError, paymentMethod, ridePaid } = useRide();
  const { user } = useAuth();
  const [rating, setRating]         = useState(0);
  const [feedback, setFeedback]     = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleDone = async () => {
    setSubmitting(true);

    if (activeRideId && user) {
      const updates: Record<string, unknown> = {};
      if (rating > 0) updates.rating_by_rider = rating;
      if (feedback.trim()) updates.feedback = feedback.trim();

      if (Object.keys(updates).length > 0) {
        await supabase
          .from("rides")
          .update(updates)
          .eq("id", activeRideId);
      }
    }

    cancelRide();
  };

  return (
    <div className="space-y-5 py-2">
      {/* Header */}
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-3">
          <Check className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Ride Complete!</h3>
        <p className="text-2xl font-bold text-foreground mt-1">${ride.fare.toFixed(2)}</p>
        {paymentError ? (
          <p className="text-xs text-destructive mt-1">{paymentError}</p>
        ) : (ridePaid || paymentMethod === "card") ? (
          <p className="text-xs text-primary">Paid by card</p>
        ) : (
          <p className="text-xs text-muted-foreground">Paid from wallet</p>
        )}
      </div>

      {/* Receipt summary */}
      {ride.dropoff && (
        <div className="bg-secondary rounded-xl px-4 py-3 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>From</span>
            <span className="text-foreground text-right max-w-[60%] truncate">{ride.pickup?.address}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>To</span>
            <span className="text-foreground text-right max-w-[60%] truncate">{ride.dropoff.address}</span>
          </div>
          {ride.distance && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Distance</span>
              <span className="text-foreground">{ride.distance}</span>
            </div>
          )}
          {ride.driver && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Driver</span>
              <span className="text-foreground">{ride.driver.name}</span>
            </div>
          )}
        </div>
      )}

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

      {/* Feedback */}
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Leave feedback (optional)…"
        rows={2}
        className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground resize-none"
      />

      <button
        onClick={handleDone}
        disabled={submitting}
        className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Done"}
      </button>
    </div>
  );
}
