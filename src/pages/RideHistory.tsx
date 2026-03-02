import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface RideRecord {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  fare: number | null;
  status: string;
  created_at: string;
}

export default function RideHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rides, setRides]     = useState<RideRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("rides")
      .select("id, pickup_address, dropoff_address, fare, status, created_at")
      .eq("rider_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setRides(data ?? []);
        setLoading(false);
      });
  }, [user]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000)  return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    if (diff < 172800000) return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case "completed":  return { label: "Completed",  classes: "bg-primary/15 text-primary"           };
      case "cancelled":  return { label: "Cancelled",  classes: "bg-destructive/15 text-destructive"   };
      case "in_progress":return { label: "In Progress",classes: "bg-warning/15 text-warning"           };
      default:           return { label: s,             classes: "bg-muted text-muted-foreground"       };
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/rider")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">My Rides</h1>
      </div>

      <div className="p-5 space-y-3">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : rides.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-20">No rides yet</p>
        ) : (
          rides.map((ride) => {
            const st = statusLabel(ride.status);
            return (
              <div key={ride.id} className="bg-secondary rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{formatDate(ride.created_at)}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.classes}`}>
                    {st.label}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <p className="text-sm text-foreground truncate">{ride.pickup_address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-sm bg-accent shrink-0" />
                    <p className="text-sm text-foreground truncate">{ride.dropoff_address}</p>
                  </div>
                </div>
                {ride.fare != null && (
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <p className="text-sm font-semibold text-foreground">${Number(ride.fare).toFixed(2)}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
