import { ArrowLeft, MessageCircle, Mail, Phone, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Support() {
  const navigate = useNavigate();

  const items = [
    { icon: MessageCircle, label: "Live Chat",         desc: "Chat with our support team"       },
    { icon: Mail,          label: "Email Support",     desc: "support@rideapp.com"               },
    { icon: Phone,         label: "Call Us",           desc: "Available 24/7"                    },
    { icon: FileText,      label: "Help Center",       desc: "Browse FAQs and guides"            },
  ];

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/rider")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Help & Support</h1>
      </div>

      <div className="p-5 space-y-6">
        <p className="text-sm text-muted-foreground">
          How can we help you today?
        </p>

        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-4 px-4 py-3.5 bg-secondary rounded-xl hover:bg-secondary/70 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
