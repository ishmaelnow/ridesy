import { ArrowLeft, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useRide } from "@/contexts/RideContext";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, markNotificationsRead } = useRide();

  // Mark all as read when page is opened
  useEffect(() => {
    markNotificationsRead();
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/rider")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Notifications</h1>
      </div>

      <div className="p-5">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Bell className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex gap-3 px-4 py-3 rounded-xl transition-colors ${
                  n.read ? "bg-secondary/50" : "bg-secondary"
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-muted-foreground/30" : "bg-primary"}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {n.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
