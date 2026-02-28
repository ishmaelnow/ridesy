import { Menu, Bell } from "lucide-react";
import { useRide } from "@/contexts/RideContext";

interface Props {
  onMenuOpen: () => void;
}

export default function TopBar({ onMenuOpen }: Props) {
  const { notifications } = useRide();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="absolute top-0 left-0 right-0 z-20 safe-top px-4 pt-3">
      <div className="flex items-center justify-between">
        <button
          onClick={onMenuOpen}
          className="w-11 h-11 rounded-full glass flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        <button className="w-11 h-11 rounded-full glass flex items-center justify-center shadow-lg relative active:scale-95 transition-transform">
          <Bell className="w-5 h-5 text-foreground" />
          {unread > 0 && (
            <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary-foreground">{unread}</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
