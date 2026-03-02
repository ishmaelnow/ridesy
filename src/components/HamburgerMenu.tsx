import { motion, AnimatePresence } from "framer-motion";
import {
  User, Bell, Wallet, ClipboardList, MapPin, Settings,
  Info, MessageSquare, Share2, LogOut, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRide } from "@/contexts/RideContext";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: User,          label: "Profile",        path: "/profile"       },
  { icon: Bell,          label: "Notifications",  path: "/notifications" },
  { icon: Wallet,        label: "Wallet",         path: "/wallet"        },
  { icon: ClipboardList, label: "My Rides",       path: "/rides"         },
  { icon: MapPin,        label: "Saved Places",   path: "/saved-places"  },
  { icon: Settings,      label: "Settings",       path: "/settings"      },
  { icon: Info,          label: "About",          path: "/about"         },
  { icon: MessageSquare, label: "Support",        path: "/support"       },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function HamburgerMenu({ open, onClose }: Props) {
  const navigate  = useNavigate();
  const { walletBalance } = useRide();
  const { user, signOut } = useAuth();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "RideApp", url: window.location.origin }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.origin);
    }
    onClose();
  };

  const handleLogout = async () => {
    onClose();
    await signOut();
    navigate("/");
  };

  const displayName = user?.user_metadata?.full_name || "Rider";
  const displayEmail = user?.email || "";

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
              <p className="text-base font-semibold text-foreground truncate">{displayName}</p>
              <p className="text-sm text-muted-foreground truncate">{displayEmail}</p>
              <div className="mt-3 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">${walletBalance.toFixed(2)}</span>
              </div>
            </div>

            {/* Nav items */}
            <div className="flex-1 overflow-y-auto py-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNav(item.path)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-secondary/60 transition-colors text-foreground"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}

              {/* Share App */}
              <button
                onClick={handleShare}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-secondary/60 transition-colors text-foreground"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm">Share App</span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-secondary/60 transition-colors text-destructive"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
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
