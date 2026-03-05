import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function RoleSelect() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Welcome to RideApp</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {user ? `Signed in as ${user.email}` : "Sign in to book a ride"}
          </p>
        </div>

        <button
          onClick={() => navigate(user ? "/rider" : "/auth?role=rider")}
          className="w-full flex items-center gap-4 p-5 rounded-2xl bg-card border-2 border-border hover:border-primary transition-colors active:scale-[0.98]"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-base font-semibold text-foreground">Get a Ride</p>
            <p className="text-sm text-muted-foreground">Book rides & get around</p>
          </div>
        </button>

        {user && (
          <button
            onClick={async () => {
              const { supabase } = await import("@/integrations/supabase/client");
              await supabase.auth.signOut();
              window.location.reload();
            }}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Sign Out
          </button>
        )}
      </motion.div>
    </div>
  );
}
