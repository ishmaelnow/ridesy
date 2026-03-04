import { ArrowLeft, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface Review {
  id: string;
  rating: number;
  feedback: string | null;
  rider_name: string;
  created_at: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function DriverRatings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("rides")
      .select("id, rating_by_rider, feedback, completed_at, rider_id")
      .eq("driver_id", user.id)
      .not("rating_by_rider", "is", null)
      .order("completed_at", { ascending: false })
      .limit(50)
      .then(async ({ data }) => {
        if (!data || data.length === 0) { setLoading(false); return; }

        const avg = data.reduce((sum, r) => sum + (r.rating_by_rider ?? 0), 0) / data.length;
        setAvgRating(Math.round(avg * 10) / 10);

        // Fetch rider names in parallel
        const riderIds = [...new Set(data.map((r) => r.rider_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", riderIds);

        const nameMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.full_name]));

        setReviews(
          data.map((r) => ({
            id: r.id,
            rating: r.rating_by_rider ?? 0,
            feedback: r.feedback,
            rider_name: nameMap[r.rider_id] || "Rider",
            created_at: r.completed_at ?? "",
          }))
        );
        setLoading(false);
      });
  }, [user]);

  const count = reviews.length;

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
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <p className="text-5xl font-bold text-foreground">{count > 0 ? avgRating.toFixed(1) : "—"}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-5 h-5 ${s <= Math.round(avgRating) ? "text-warning fill-warning" : "text-muted"}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {count === 0 ? "No ratings yet" : `Based on ${count} rating${count !== 1 ? "s" : ""}`}
              </p>
            </>
          )}
        </div>

        {reviews.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Recent Reviews</p>
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">{r.rider_name}</p>
                    <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "text-warning fill-warning" : "text-muted"}`} />
                    ))}
                  </div>
                  {r.feedback && <p className="text-sm text-muted-foreground">{r.feedback}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
