import { ArrowLeft, MapPin, Clock, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

const rides = [
  { id: "1", from: "Current Location", to: "Times Square", date: "Today, 2:30 PM", fare: "$12.50", status: "Completed" },
  { id: "2", from: "Home", to: "JFK Airport", date: "Feb 25, 9:00 AM", fare: "$35.00", status: "Completed" },
  { id: "3", from: "Work", to: "Brooklyn Bridge", date: "Feb 23, 6:15 PM", fare: "$15.75", status: "Completed" },
  { id: "4", from: "Central Park", to: "SoHo", date: "Feb 20, 1:00 PM", fare: "$9.25", status: "Cancelled" },
];

export default function RideHistory() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/rider")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">My Rides</h1>
      </div>

      <div className="p-5 space-y-3">
        {rides.map((ride) => (
          <div key={ride.id} className="bg-secondary rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{ride.date}</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                ride.status === "Completed" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
              }`}>
                {ride.status}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <p className="text-sm text-foreground">{ride.from}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-sm bg-accent" />
                <p className="text-sm text-foreground">{ride.to}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <p className="text-sm font-semibold text-foreground">{ride.fare}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
