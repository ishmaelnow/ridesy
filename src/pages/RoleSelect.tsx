import { useNavigate } from "react-router-dom";
import { Car, User } from "lucide-react";
import { motion } from "framer-motion";

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Welcome to RideApp</h1>
          <p className="text-sm text-muted-foreground mt-2">Choose how you'd like to use the app</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/rider")}
            className="w-full flex items-center gap-4 p-5 rounded-2xl bg-card border-2 border-border hover:border-primary transition-colors active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-base font-semibold text-foreground">Rider</p>
              <p className="text-sm text-muted-foreground">Book rides & get around</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/driver")}
            className="w-full flex items-center gap-4 p-5 rounded-2xl bg-card border-2 border-border hover:border-primary transition-colors active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Car className="w-7 h-7 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-base font-semibold text-foreground">Driver</p>
              <p className="text-sm text-muted-foreground">Earn money driving</p>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
