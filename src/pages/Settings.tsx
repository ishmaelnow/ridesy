import { ArrowLeft, Bell, Globe, Moon, Shield, HelpCircle, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRide } from "@/contexts/RideContext";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { soundEnabled, setSoundEnabled } = useRide();

  const sections = [
    {
      title: "Preferences",
      items: [
        {
          icon: soundEnabled ? Volume2 : VolumeX,
          label: "Notification Sound",
          value: soundEnabled ? "On" : "Off",
          toggle: true,
          onToggle: () => setSoundEnabled(!soundEnabled),
        },
        { icon: Globe, label: "Language", value: "English" },
        { icon: Moon, label: "Theme", value: "Dark" },
      ],
    },
    {
      title: "Privacy & Security",
      items: [
        { icon: Shield, label: "Privacy Settings" },
        { icon: Bell, label: "Notification Preferences" },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help & Support" },
      ],
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
      </div>

      <div className="p-5 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-xs text-muted-foreground mb-2 px-1">{section.title}</p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={'onToggle' in item ? item.onToggle : undefined}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-secondary/60 transition-colors"
                >
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="flex-1 text-left text-sm text-foreground">{item.label}</span>
                  {'value' in item && (
                    <span className="text-xs text-muted-foreground">{item.value}</span>
                  )}
                  {'toggle' in item && (
                    <div className={`w-10 h-6 rounded-full transition-colors ${
                      soundEnabled ? "bg-primary" : "bg-muted"
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-foreground mt-0.5 transition-transform ${
                        soundEnabled ? "translate-x-[18px]" : "translate-x-0.5"
                      }`} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
