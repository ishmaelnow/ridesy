import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDriver } from "@/contexts/DriverContext";
import {
  X, LayoutDashboard, DollarSign, Clock, Star, Settings, Car,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/driver" },
  { icon: DollarSign, label: "Earnings", path: "/driver/earnings" },
  { icon: Clock, label: "Trip History", path: "/driver/history" },
  { icon: Star, label: "Ratings", path: "/driver/ratings" },
  { icon: Settings, label: "Settings", path: "/driver/settings" },
  
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DriverMenu({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { rating, earnings } = useDriver();

  const handleClick = (item: (typeof menuItems)[0]) => {
    navigate(item.path);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-card z-50 shadow-2xl flex flex-col"
          >
            <div className="safe-top px-5 pt-4 pb-5 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold text-primary">DRIVER</span>
                </div>
                <button onClick={onClose}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                  A
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Ahmed Hassan</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-warning fill-warning" />
                    <span className="text-xs text-muted-foreground">{rating} rating</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 py-2">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleClick(item)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/60 transition-colors"
                >
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-border">
              <div className="bg-secondary rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Today's Earnings</p>
                <p className="text-xl font-bold text-primary">${earnings.today.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
