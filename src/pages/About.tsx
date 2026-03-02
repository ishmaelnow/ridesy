import { ArrowLeft, Car, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/rider")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">About</h1>
      </div>

      <div className="p-5 space-y-8">
        <div className="flex flex-col items-center py-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
            <Car className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">RideApp</h2>
          <p className="text-sm text-muted-foreground mt-1">Version 1.0.0</p>
        </div>

        <div className="space-y-4">
          {[
            { icon: Zap,    title: "Fast Rides",       desc: "Get a ride in minutes, any time of day."          },
            { icon: Shield, title: "Safe & Secure",    desc: "In-app SOS, verified drivers, and no phone number exposure." },
            { icon: Car,    title: "Multiple Options", desc: "Choose Standard, Premium, or Shared rides."        },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 items-start px-4 py-3.5 bg-secondary rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} RideApp. All rights reserved.
        </p>
      </div>
    </div>
  );
}
