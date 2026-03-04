import { ArrowLeft, MapPin, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface Trip {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  created_at: string;
  fare: number | null;
  status: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) + `, ${time}`;
}

export default function DriverHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("rides")
      .select("id, pickup_address, dropoff_address, created_at, fare, status")
      .eq("driver_id", user.id)
      .in("status", ["completed", "cancelled"])
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => { setTrips(data ?? []); setLoading(false); });
  }, [user]);

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/driver")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Trip History</h1>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : trips.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 text-sm">No trips yet</p>
        ) : (
          trips.map((trip) => (
            <div key={trip.id} className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">{formatDate(trip.created_at)}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trip.status === "completed" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                  {trip.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground">{trip.pickup_address}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Navigation className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground">{trip.dropoff_address}</p>
                </div>
              </div>
              {trip.status === "completed" && trip.fare != null && (
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Fare earned</span>
                  <span className="text-sm font-semibold text-foreground">${Number(trip.fare).toFixed(2)}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
