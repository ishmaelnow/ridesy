import { ArrowLeft, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDriver } from "@/contexts/DriverContext";

const reviews = [
  { id: "1", rider: "Sarah M.", rating: 5, comment: "Great driver, very professional!", date: "Today" },
  { id: "2", rider: "James W.", rating: 5, comment: "Smooth ride, thank you!", date: "Yesterday" },
  { id: "3", rider: "Emily R.", rating: 4, comment: "Good driver", date: "2 days ago" },
  { id: "4", rider: "Michael T.", rating: 5, comment: "Excellent service, clean car", date: "3 days ago" },
];

export default function DriverRatings() {
  const navigate = useNavigate();
  const { rating } = useDriver();

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/driver")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Ratings & Reviews</h1>
      </div>

      <div className="p-5 space-y-5">
        <div className="text-center bg-card rounded-2xl p-6 border border-border">
          <p className="text-5xl font-bold text-foreground">{rating}</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-5 h-5 ${s <= Math.round(rating) ? "text-warning fill-warning" : "text-muted"}`} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">Based on 156 ratings</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Recent Reviews</p>
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">{r.rider}</p>
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "text-warning fill-warning" : "text-muted"}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
