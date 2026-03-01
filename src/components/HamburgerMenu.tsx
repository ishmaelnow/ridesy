import { motion, AnimatePresence } from "framer-motion";
import {
  User, Bell, Wallet, ClipboardList, MapPin, Settings,
  Info, MessageSquare, Share2, LogOut, X, Car
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRide } from "@/contexts/RideContext";

const menuItems = [
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Wallet, label: "Wallet", path: "/wallet" },
  { icon: ClipboardList, label: "My Rides", path: "/rides" },
  { icon: MapPin, label: "Saved Places", path: "/saved-places" },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: Car, label: "Switch to Driver", path: "/driver" },
  { icon: Info, label: "About", path: "/about" },
  { icon: MessageSquare, label: "Support", path: "/support" },
  { icon: Share2, label: "Share App", path: null },
  { icon: LogOut, label: "Logout", path: null },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function HamburgerMenu({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { walletBalance } = useRide();

  const handleClick = (item: typeof menuItems[0]) => {
    if (item.path) {
      navigate(item.path);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-card z-50 flex flex-col safe-top"
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <button onClick={onClose} className="p-1">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <p className="text-base font-semibold text-foreground">Rider</p>
              <p className="text-sm text-muted-foreground">rider@example.com</p>
              <div className="mt-3 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">${walletBalance.toFixed(2)}</span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-2">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleClick(item)}
                  className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-secondary/60 transition-colors ${
                    item.label === "Logout" ? "text-destructive" : "text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-border">
              <p className="text-xs text-muted-foreground">RideApp v1.0.0</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
