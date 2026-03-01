import { ArrowLeft, Bell, Car, Shield, HelpCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const items = [
  { icon: Car, label: "Vehicle Info", value: "Toyota Camry 2023" },
  { icon: Bell, label: "Notifications", value: "Enabled" },
  { icon: Shield, label: "Documents", value: "Verified" },
  { icon: HelpCircle, label: "Support", value: "" },
  { icon: LogOut, label: "Switch to Rider", value: "", path: "/rider" },
];

export default function DriverSettings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/driver")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Driver Settings</h1>
      </div>

      <div className="p-4 space-y-1">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => item.path && navigate(item.path)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-secondary/60 transition-colors"
          >
            <item.icon className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
            </div>
            {item.value && <span className="text-xs text-muted-foreground">{item.value}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
