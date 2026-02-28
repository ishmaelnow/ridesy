import { ArrowLeft, User, Mail, Phone, CreditCard, MapPin, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  const fields = [
    { icon: User, label: "Full Name", value: "Alex Johnson" },
    { icon: Mail, label: "Email", value: "alex@example.com" },
    { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
    { icon: CreditCard, label: "Payment", value: "Visa •••• 4242" },
    { icon: MapPin, label: "Home", value: "742 Evergreen Terrace" },
  ];

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Profile</h1>
      </div>

      <div className="p-5 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Camera className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
          <p className="text-lg font-semibold text-foreground mt-3">Alex Johnson</p>
          <p className="text-sm text-muted-foreground">Member since 2024</p>
        </div>

        {/* Fields */}
        <div className="space-y-1">
          {fields.map((field) => (
            <button
              key={field.label}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-secondary/60 transition-colors"
            >
              <field.icon className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="text-xs text-muted-foreground">{field.label}</p>
                <p className="text-sm text-foreground">{field.value}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
