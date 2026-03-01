import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function ApplicationStatus() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("driver_applications")
        .select("status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setStatus(data?.status ?? null);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const config: Record<string, { icon: React.ReactNode; title: string; desc: string; color: string }> = {
    pending: {
      icon: <Clock className="w-12 h-12 text-yellow-500" />,
      title: "Application Under Review",
      desc: "We're reviewing your application. This usually takes 24-48 hours. You'll be notified once it's approved.",
      color: "text-yellow-500",
    },
    approved: {
      icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
      title: "You're Approved! 🎉",
      desc: "Your driver application has been approved. You can start accepting rides now.",
      color: "text-green-500",
    },
    rejected: {
      icon: <XCircle className="w-12 h-12 text-destructive" />,
      title: "Application Not Approved",
      desc: "Unfortunately your application wasn't approved. You can re-apply with updated documents.",
      color: "text-destructive",
    },
  };

  const current = status ? config[status] : null;

  return (
    <div className="min-h-[100dvh] bg-background theme-driver flex flex-col">
      <div className="safe-top px-4 pt-3 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Application Status</h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        {loading ? (
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        ) : !current ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">No application found</p>
            <button onClick={() => navigate("/driver/apply")} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
              Apply Now
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 max-w-xs">
            {current.icon}
            <h2 className="text-xl font-bold text-foreground">{current.title}</h2>
            <p className="text-sm text-muted-foreground">{current.desc}</p>
            {status === "approved" && (
              <button onClick={() => navigate("/driver")} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm mt-4">
                Start Driving
              </button>
            )}
            {status === "rejected" && (
              <button onClick={() => navigate("/driver/apply")} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm mt-4">
                Re-Apply
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
