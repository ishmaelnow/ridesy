import { motion, AnimatePresence } from "framer-motion";
import { useDriver } from "@/contexts/DriverContext";
import { supabase } from "@/integrations/supabase/client";
import { Power, MapPin, Navigation, User, Star, Clock, DollarSign, CheckCircle, X, Phone } from "lucide-react";

export default function DriverBottomPanel() {
  const { driverStatus, setDriverStatus, goOnline, goOffline, currentRequest, acceptRide, declineRide, startRide, completeRide, earnings } = useDriver();

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      <AnimatePresence mode="wait">
        {driverStatus === "offline" && (
          <motion.div
            key="offline"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="bg-card rounded-t-3xl shadow-2xl p-6 safe-bottom"
          >
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-6" />
            <div className="text-center mb-6">
              <p className="text-lg font-semibold text-foreground">You're offline</p>
              <p className="text-sm text-muted-foreground mt-1">Go online to start receiving ride requests</p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-secondary rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-foreground">${earnings.today.toFixed(0)}</p>
                <p className="text-[10px] text-muted-foreground">Today</p>
              </div>
              <div className="bg-secondary rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-foreground">{earnings.trips}</p>
                <p className="text-[10px] text-muted-foreground">Trips</p>
              </div>
              <div className="bg-secondary rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-foreground">${earnings.week.toFixed(0)}</p>
                <p className="text-[10px] text-muted-foreground">This week</p>
              </div>
            </div>
            <button
              onClick={goOnline}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Power className="w-5 h-5" />
              Go Online
            </button>
          </motion.div>
        )}

        {driverStatus === "online" && (
          <motion.div
            key="online"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="bg-card rounded-t-3xl shadow-2xl p-6 safe-bottom"
          >
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-6" />
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
              </div>
              <p className="text-base font-semibold text-foreground">Searching for rides…</p>
              <p className="text-sm text-muted-foreground mt-1">Stay in a busy area for faster matches</p>
            </div>
            <button
              onClick={goOffline}
              className="w-full py-3 rounded-2xl bg-secondary text-foreground font-medium text-sm active:scale-[0.98] transition-transform"
            >
              Go Offline
            </button>
          </motion.div>
        )}

        {driverStatus === "ride_offered" && currentRequest && (
          <motion.div
            key="offered"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="bg-card rounded-t-3xl shadow-2xl p-6 safe-bottom"
          >
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-foreground">
                  {currentRequest.rider.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{currentRequest.rider.name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-warning fill-warning" />
                    <span className="text-xs text-muted-foreground">{currentRequest.rider.rating}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">${currentRequest.fare.toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground">{currentRequest.distance} · {currentRequest.duration}</p>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                  <MapPin className="w-3 h-3 text-primary" />
                </div>
                <p className="text-sm text-foreground">{currentRequest.pickup.address}</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center mt-0.5">
                  <Navigation className="w-3 h-3 text-destructive" />
                </div>
                <p className="text-sm text-foreground">{currentRequest.dropoff.address}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={declineRide}
                className="flex-1 py-3.5 rounded-2xl bg-secondary text-foreground font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <X className="w-4 h-4" />
                Decline
              </button>
              <button
                onClick={acceptRide}
                className="flex-[2] py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <CheckCircle className="w-4 h-4" />
                Accept Ride
              </button>
            </div>
          </motion.div>
        )}

        {(driverStatus === "heading_to_pickup" || driverStatus === "at_pickup") && currentRequest && (
          <motion.div
            key="pickup"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="bg-card rounded-t-3xl shadow-2xl p-6 safe-bottom"
          >
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-sm font-medium text-foreground">
                {driverStatus === "heading_to_pickup" ? "Heading to pickup" : "Waiting for rider"}
              </p>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-foreground">
                {currentRequest.rider.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{currentRequest.rider.name}</p>
                <p className="text-xs text-muted-foreground">{currentRequest.pickup.address}</p>
              </div>
              <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Phone className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
            <div className="bg-secondary rounded-xl px-4 py-3 text-center mb-4">
              <p className="text-xs text-muted-foreground">Estimated fare</p>
              <p className="text-lg font-bold text-foreground">${currentRequest.fare.toFixed(2)}</p>
            </div>
            {driverStatus === "heading_to_pickup" && (
              <button
                onClick={async () => {
                  await supabase.from("rides").update({ status: "driver_arriving" }).eq("id", currentRequest.id);
                  setDriverStatus("at_pickup");
                }}
                className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <MapPin className="w-4 h-4" />
                I've Arrived
              </button>
            )}
            {driverStatus === "at_pickup" && (
              <button
                onClick={startRide}
                className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Navigation className="w-4 h-4" />
                Start Ride
              </button>
            )}
          </motion.div>
        )}

        {driverStatus === "ride_in_progress" && currentRequest && (
          <motion.div
            key="progress"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="bg-card rounded-t-3xl shadow-2xl p-6 safe-bottom"
          >
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-sm font-medium text-foreground">Ride in progress</p>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Dropping off at</p>
                <p className="text-sm font-medium text-foreground">{currentRequest.dropoff.address}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Fare</p>
                <p className="text-lg font-bold text-primary">${currentRequest.fare.toFixed(2)}</p>
              </div>
            </div>
            <button
              onClick={completeRide}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <CheckCircle className="w-5 h-5" />
              Complete Ride
            </button>
          </motion.div>
        )}

        {driverStatus === "ride_complete" && (
          <motion.div
            key="complete"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="bg-card rounded-t-3xl shadow-2xl p-6 safe-bottom"
          >
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-6" />
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-semibold text-foreground">Ride Complete!</p>
              <p className="text-sm text-muted-foreground mt-1">Looking for next ride…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
