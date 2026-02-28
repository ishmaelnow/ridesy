import { motion, AnimatePresence } from "framer-motion";
import { Home, Briefcase, Star, MapPin, Search, Clock, ChevronRight } from "lucide-react";
import { useRide } from "@/contexts/RideContext";
import DestinationSearch from "./ride/DestinationSearch";
import FareEstimate from "./ride/FareEstimate";
import SearchingDriver from "./ride/SearchingDriver";
import DriverCard from "./ride/DriverCard";
import RideActive from "./ride/RideActive";
import RideComplete from "./ride/RideComplete";

const savedPlaces = [
  { icon: Home, label: "Home", address: "742 Evergreen Terrace" },
  { icon: Briefcase, label: "Work", address: "123 Business Ave" },
];

const recentPlaces = [
  { address: "Central Park, New York", time: "Yesterday" },
  { address: "JFK Airport, Terminal 4", time: "3 days ago" },
];

function IdlePanel() {
  const { setStatus } = useRide();

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-4"
    >
      {/* Search Bar */}
      <button
        onClick={() => setStatus("selecting_destination")}
        className="w-full flex items-center gap-3 bg-secondary rounded-xl px-4 py-3.5 text-left"
      >
        <Search className="w-5 h-5 text-muted-foreground" />
        <span className="text-muted-foreground text-sm">Where to?</span>
        <div className="ml-auto flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Now</span>
        </div>
      </button>

      {/* Saved Places */}
      <div className="space-y-1">
        {savedPlaces.map((place) => (
          <button
            key={place.label}
            onClick={() => setStatus("selecting_destination")}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/60 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <place.icon className="w-4 h-4 text-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">{place.label}</p>
              <p className="text-xs text-muted-foreground">{place.address}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Recent */}
      <div className="border-t border-border pt-3">
        <p className="text-xs text-muted-foreground px-3 mb-2">Recent</p>
        {recentPlaces.map((place) => (
          <button
            key={place.address}
            onClick={() => setStatus("selecting_destination")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm text-foreground">{place.address}</p>
              <p className="text-xs text-muted-foreground">{place.time}</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export default function BottomSheet() {
  const { status } = useRide();

  const renderContent = () => {
    switch (status) {
      case "idle":
        return <IdlePanel />;
      case "selecting_destination":
        return <DestinationSearch />;
      case "fare_estimate":
        return <FareEstimate />;
      case "searching":
        return <SearchingDriver />;
      case "driver_accepted":
      case "driver_arriving":
        return <DriverCard />;
      case "ride_started":
        return <RideActive />;
      case "ride_completed":
        return <RideComplete />;
      default:
        return <IdlePanel />;
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30">
      <div className="glass-strong rounded-t-3xl border-t border-border/50 px-5 pt-3 pb-2 safe-bottom">
        {/* Handle */}
        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
