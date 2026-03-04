import { ArrowLeft, Mail, Phone, FileText, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Support() {
  const navigate = useNavigate();

  const PHONE = "4698357520";
  const EMAIL = "admin@fairfaretransportation.app";

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/rider")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Help & Support</h1>
      </div>

      <div className="p-5 space-y-6">
        <p className="text-sm text-muted-foreground">How can we help you today?</p>

        <div className="space-y-2">
          <a
            href={`tel:${PHONE}`}
            className="w-full flex items-center gap-4 px-4 py-3.5 bg-secondary rounded-xl hover:bg-secondary/70 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Call Us</p>
              <p className="text-xs text-muted-foreground">({PHONE.slice(0,3)}) {PHONE.slice(3,6)}-{PHONE.slice(6)}</p>
            </div>
          </a>

          <a
            href={`mailto:${EMAIL}`}
            className="w-full flex items-center gap-4 px-4 py-3.5 bg-secondary rounded-xl hover:bg-secondary/70 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Email Support</p>
              <p className="text-xs text-muted-foreground">{EMAIL}</p>
            </div>
          </a>

          <a
            href={`sms:${PHONE}`}
            className="w-full flex items-center gap-4 px-4 py-3.5 bg-secondary rounded-xl hover:bg-secondary/70 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Text Us</p>
              <p className="text-xs text-muted-foreground">Send us a text message</p>
            </div>
          </a>

          <button
            className="w-full flex items-center gap-4 px-4 py-3.5 bg-secondary rounded-xl hover:bg-secondary/70 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Help Center</p>
              <p className="text-xs text-muted-foreground">Browse FAQs and guides</p>
            </div>
          </button>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border space-y-1">
          <p className="text-xs font-semibold text-foreground">Fair Fare Transportation</p>
          <p className="text-xs text-muted-foreground">Available 7 days a week</p>
          <p className="text-xs text-primary">{EMAIL}</p>
          <p className="text-xs text-primary">({PHONE.slice(0,3)}) {PHONE.slice(3,6)}-{PHONE.slice(6)}</p>
        </div>
      </div>
    </div>
  );
}
