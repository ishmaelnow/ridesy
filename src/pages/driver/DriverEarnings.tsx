import { ArrowLeft, DollarSign, TrendingUp, Clock, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDriver } from "@/contexts/DriverContext";

export default function DriverEarnings() {
  const navigate = useNavigate();
  const { earnings } = useDriver();

  const periods = [
    { label: "Today", value: earnings.today, icon: Clock },
    { label: "This Week", value: earnings.week, icon: Calendar },
    { label: "This Month", value: earnings.month, icon: TrendingUp },
  ];

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/driver")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Earnings</h1>
      </div>

      <div className="p-5 space-y-5">
        <div className="bg-primary rounded-2xl p-6 text-center">
          <DollarSign className="w-8 h-8 text-primary-foreground mx-auto mb-2" />
          <p className="text-3xl font-bold text-primary-foreground">${earnings.month.toFixed(2)}</p>
          <p className="text-sm text-primary-foreground/70 mt-1">Total this month</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {periods.map((p) => (
            <div key={p.label} className="bg-card rounded-xl p-4 text-center border border-border">
              <p.icon className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
              <p className="text-lg font-bold text-foreground">${p.value.toFixed(0)}</p>
              <p className="text-[10px] text-muted-foreground">{p.label}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Stats</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-card rounded-xl px-4 py-3 border border-border">
              <span className="text-sm text-muted-foreground">Total Trips</span>
              <span className="text-sm font-semibold text-foreground">{earnings.trips}</span>
            </div>
            <div className="flex items-center justify-between bg-card rounded-xl px-4 py-3 border border-border">
              <span className="text-sm text-muted-foreground">Avg. per Trip</span>
              <span className="text-sm font-semibold text-foreground">${earnings.trips > 0 ? (earnings.month / earnings.trips).toFixed(2) : "0.00"}</span>
            </div>
            <div className="flex items-center justify-between bg-card rounded-xl px-4 py-3 border border-border">
              <span className="text-sm text-muted-foreground">Online Hours</span>
              <span className="text-sm font-semibold text-foreground">38h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
