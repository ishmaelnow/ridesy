import { ArrowLeft, Bell, Shield, HelpCircle, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRide } from "@/contexts/RideContext";

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <div className={`w-10 h-6 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted"}`}>
      <div className={`w-5 h-5 rounded-full bg-foreground mt-0.5 transition-transform ${
        enabled ? "translate-x-[18px]" : "translate-x-0.5"
      }`} />
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { soundEnabled, setSoundEnabled, notificationsEnabled, setNotificationsEnabled } = useRide();

  const prefItems = [
    {
      icon: soundEnabled ? Volume2 : VolumeX,
      label: "Notification Sound",
      value: soundEnabled ? "On" : "Off",
      enabled: soundEnabled,
      onToggle: () => setSoundEnabled(!soundEnabled),
    },
    {
      icon: Bell,
      label: "Push Notifications",
      value: notificationsEnabled ? "On" : "Off",
      enabled: notificationsEnabled,
      onToggle: () => setNotificationsEnabled(!notificationsEnabled),
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/rider")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
      </div>

      <div className="p-5 space-y-6">
        {/* Preferences */}
        <div>
          <p className="text-xs text-muted-foreground mb-2 px-1">Preferences</p>
          <div className="space-y-1">
            {prefItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onToggle}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-secondary/60 transition-colors"
              >
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <span className="flex-1 text-left text-sm text-foreground">{item.label}</span>
                <span className="text-xs text-muted-foreground mr-2">{item.value}</span>
                <Toggle enabled={item.enabled} />
              </button>
            ))}
          </div>
        </div>

        {/* Privacy & Security */}
        <div>
          <p className="text-xs text-muted-foreground mb-2 px-1">Privacy & Security</p>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-secondary/60 transition-colors">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left text-sm text-foreground">Privacy Settings</span>
            </button>
          </div>
        </div>

        {/* Support */}
        <div>
          <p className="text-xs text-muted-foreground mb-2 px-1">Support</p>
          <div className="space-y-1">
            <button
              onClick={() => navigate("/support")}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-secondary/60 transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left text-sm text-foreground">Help & Support</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
