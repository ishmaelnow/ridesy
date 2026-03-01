import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { reverseGeocode } from "@/lib/geocode";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type RideStatus =
  | "idle"
  | "selecting_destination"
  | "fare_estimate"
  | "searching"
  | "driver_accepted"
  | "driver_arriving"
  | "ride_started"
  | "ride_completed";

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Driver {
  id: string;
  name: string;
  photo: string;
  rating: number;
  car: string;
  plate: string;
  eta: number;
}

export interface RideInfo {
  pickup: Location | null;
  dropoff: Location | null;
  fare: number;
  distance: string;
  duration: string;
  driver: Driver | null;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

interface RideContextType {
  status: RideStatus;
  setStatus: (s: RideStatus) => void;
  ride: RideInfo;
  setRide: React.Dispatch<React.SetStateAction<RideInfo>>;
  requestRide: () => void;
  cancelRide: () => void;
  walletBalance: number;
  setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
  notifications: Notification[];
  addNotification: (n: Omit<Notification, "id" | "time">) => void;
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  userLocation: { lat: number; lng: number; address: string } | null;
  activeRideId: string | null;
}

const defaultRide: RideInfo = {
  pickup: null,
  dropoff: null,
  fare: 0,
  distance: "",
  duration: "",
  driver: null,
};

const RideContext = createContext<RideContextType | null>(null);

// Map DB ride_status to our UI status
function dbStatusToUi(dbStatus: string, hasDriver: boolean): RideStatus {
  switch (dbStatus) {
    case "requested": return "searching";
    case "accepted": return "driver_accepted";
    case "driver_arriving": return "driver_arriving";
    case "in_progress": return "ride_started";
    case "completed": return "ride_completed";
    case "cancelled": return "idle";
    default: return "idle";
  }
}

export function RideProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<RideStatus>("idle");
  const [ride, setRide] = useState<RideInfo>(defaultRide);
  const [walletBalance, setWalletBalance] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [activeRideId, setActiveRideId] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Get real user location + reverse geocode
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const address = await reverseGeocode(lat, lng);
        const shortAddress = address.split(",").slice(0, 2).join(",").trim();
        setUserLocation({ lat, lng, address: shortAddress });
      },
      () => {
        // No fallback
      }
    );
  }, []);

  // Fetch wallet balance from DB
  useEffect(() => {
    if (!user) return;
    supabase
      .from("wallet_balances")
      .select("balance")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setWalletBalance(data.balance);
      });
  }, [user]);

  // Check for active ride on mount
  useEffect(() => {
    if (!user) return;
    supabase
      .from("rides")
      .select("*")
      .eq("rider_id", user.id)
      .in("status", ["requested", "accepted", "driver_arriving", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const r = data[0];
          setActiveRideId(r.id);
          setRide({
            pickup: { lat: r.pickup_lat, lng: r.pickup_lng, address: r.pickup_address },
            dropoff: { lat: r.dropoff_lat, lng: r.dropoff_lng, address: r.dropoff_address },
            fare: Number(r.fare) || 0,
            distance: r.distance || "",
            duration: r.duration || "",
            driver: null,
          });
          setStatus(dbStatusToUi(r.status, !!r.driver_id));
          // Load driver profile if assigned
          if (r.driver_id) {
            loadDriverInfo(r.driver_id);
          }
        }
      });
  }, [user]);

  const loadDriverInfo = async (driverId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", driverId)
      .single();
    if (data) {
      setRide((prev) => ({
        ...prev,
        driver: {
          id: driverId,
          name: data.full_name || "Driver",
          photo: "",
          rating: 4.9,
          car: "Vehicle",
          plate: "---",
          eta: 4,
        },
      }));
    }
  };

  // Subscribe to ride changes
  useEffect(() => {
    if (!activeRideId) {
      channelRef.current?.unsubscribe();
      channelRef.current = null;
      return;
    }

    const channel = supabase
      .channel(`ride-${activeRideId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rides",
          filter: `id=eq.${activeRideId}`,
        },
        (payload) => {
          const r = payload.new as any;
          const newStatus = dbStatusToUi(r.status, !!r.driver_id);
          setStatus(newStatus);
          setRide((prev) => ({
            ...prev,
            fare: Number(r.fare) || prev.fare,
            distance: r.distance || prev.distance,
            duration: r.duration || prev.duration,
          }));

          if (r.driver_id && !ride.driver) {
            loadDriverInfo(r.driver_id);
          }

          if (r.status === "completed" || r.status === "cancelled") {
            // Clean up after a delay
            if (r.status === "cancelled") {
              setActiveRideId(null);
              setStatus("idle");
              setRide(defaultRide);
            }
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      channel.unsubscribe();
    };
  }, [activeRideId]);

  const addNotification = useCallback((n: Omit<Notification, "id" | "time">) => {
    setNotifications((prev) => [
      { ...n, id: crypto.randomUUID(), time: new Date() },
      ...prev,
    ]);
  }, []);

  const playSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  }, [soundEnabled]);

  // Request ride — insert into DB
  const requestRide = useCallback(async () => {
    if (!user || !ride.pickup || !ride.dropoff) return;
    setStatus("searching");

    const { data, error } = await supabase
      .from("rides")
      .insert({
        rider_id: user.id,
        pickup_lat: ride.pickup.lat,
        pickup_lng: ride.pickup.lng,
        pickup_address: ride.pickup.address,
        dropoff_lat: ride.dropoff.lat,
        dropoff_lng: ride.dropoff.lng,
        dropoff_address: ride.dropoff.address,
        fare: ride.fare,
        distance: ride.distance,
        duration: ride.duration,
        status: "requested",
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create ride:", error);
      setStatus("fare_estimate");
      return;
    }

    setActiveRideId(data.id);
    addNotification({ title: "Ride Requested", message: "Looking for nearby drivers...", read: false });
  }, [user, ride.pickup, ride.dropoff, ride.fare, ride.distance, ride.duration, addNotification]);

  // Cancel ride
  const cancelRide = useCallback(async () => {
    if (activeRideId) {
      await supabase
        .from("rides")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", activeRideId);
    }
    setActiveRideId(null);
    setStatus("idle");
    setRide(defaultRide);
  }, [activeRideId]);

  return (
    <RideContext.Provider
      value={{
        status, setStatus, ride, setRide,
        requestRide, cancelRide,
        walletBalance, setWalletBalance,
        notifications, addNotification,
        soundEnabled, setSoundEnabled,
        userLocation,
        activeRideId,
      }}
    >
      {children}
    </RideContext.Provider>
  );
}

export function useRide() {
  const ctx = useContext(RideContext);
  if (!ctx) throw new Error("useRide must be used within RideProvider");
  return ctx;
}
