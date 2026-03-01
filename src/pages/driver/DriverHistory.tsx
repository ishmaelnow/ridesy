import { ArrowLeft, MapPin, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";

const trips = [
  { id: "1", from: "123 Main St", to: "456 Broadway", date: "Today, 2:30 PM", fare: 14.5, status: "completed" },
  { id: "2", from: "789 Park Ave", to: "321 5th Ave", date: "Today, 11:15 AM", fare: 22.0, status: "completed" },
  { id: "3", from: "55 Wall St", to: "100 Centre St", date: "Yesterday, 6:45 PM", fare: 18.75, status: "completed" },
  { id: "4", from: "200 W 34th St", to: "1 Penn Plaza", date: "Yesterday, 3:20 PM", fare: 9.0, status: "cancelled" },
];

export default function DriverHistory() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/driver")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Trip History</h1>
      </div>

      <div className="p-4 space-y-3">
        {trips.map((trip) => (
          <div key={trip.id} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{trip.date}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trip.status === "completed" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                {trip.status}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-sm text-foreground">{trip.from}</p>
              </div>
              <div className="flex items-start gap-2">
                <Navigation className="w-4 h-4 text-destructive mt-0.5" />
                <p className="text-sm text-foreground">{trip.to}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Fare earned</span>
              <span className="text-sm font-semibold text-foreground">${trip.fare.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
