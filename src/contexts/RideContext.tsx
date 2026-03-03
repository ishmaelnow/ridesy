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
  rating: number | "New";
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

export interface SavedPlace {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
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
  markNotificationsRead: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
  userLocation: { lat: number; lng: number; address: string } | null;
  driverLocation: { lat: number; lng: number } | null;
  activeRideId: string | null;
  savedPlaces: SavedPlace[];
  loadSavedPlaces: () => void;
  paymentError: string | null;
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
function dbStatusToUi(dbStatus: string): RideStatus {
  switch (dbStatus) {
    case "requested":      return "searching";
    case "accepted":       return "driver_accepted";
    case "driver_arriving":return "driver_arriving";
    case "in_progress":    return "ride_started";
    case "completed":      return "ride_completed";
    case "cancelled":      return "idle";
    default:               return "idle";
  }
}

export function RideProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<RideStatus>("idle");
  const [ride, setRide] = useState<RideInfo>(defaultRide);
  const [walletBalance, setWalletBalance] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeRideId, setActiveRideId] = useState<string | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const prevStatusRef = useRef<RideStatus>("idle");
  const paymentRef = useRef<(() => void) | null>(null);

  // ─── Persist sound preference ─────────────────────────────────────────────
  const setSoundEnabled = useCallback(async (v: boolean) => {
    setSoundEnabledState(v);
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ sound_enabled: v, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
  }, [user]);

  // ─── Persist notifications preference ────────────────────────────────────
  const setNotificationsEnabled = useCallback(async (v: boolean) => {
    setNotificationsEnabledState(v);
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ notifications_enabled: v, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
  }, [user]);

  // ─── Load preferences + notifications from DB on mount ───────────────────
  useEffect(() => {
    if (!user) return;

    // Load profile prefs
    supabase
      .from("profiles")
      .select("sound_enabled, notifications_enabled")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          if (data.sound_enabled !== null) setSoundEnabledState(data.sound_enabled ?? true);
          if (data.notifications_enabled !== null) setNotificationsEnabledState(data.notifications_enabled ?? true);
        }
      });

    // Load recent notifications
    supabase
      .from("notifications")
      .select("*")
      .eq("rider_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) {
          setNotifications(
            data.map((n) => ({
              id: n.id,
              title: n.title,
              message: n.body,
              time: new Date(n.created_at),
              read: n.read_at !== null,
            }))
          );
        }
      });
  }, [user]);

  // ─── Load saved places ────────────────────────────────────────────────────
  const loadSavedPlaces = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("saved_places")
      .select("*")
      .eq("rider_id", user.id)
      .order("created_at", { ascending: true });
    if (data) setSavedPlaces(data);
  }, [user]);

  useEffect(() => {
    loadSavedPlaces();
  }, [loadSavedPlaces]);

  // ─── Continuous rider location via watchPosition ───────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const address = await reverseGeocode(lat, lng);
        const shortAddress = address.split(",").slice(0, 2).join(",").trim();
        setUserLocation({ lat, lng, address: shortAddress });
      },
      () => { /* permission denied — no fallback */ },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // ─── Wallet balance ────────────────────────────────────────────────────────
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

  // ─── Restore active ride on mount ─────────────────────────────────────────
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
            pickup:  { lat: r.pickup_lat,  lng: r.pickup_lng,  address: r.pickup_address  },
            dropoff: { lat: r.dropoff_lat, lng: r.dropoff_lng, address: r.dropoff_address },
            fare:     Number(r.fare) || 0,
            distance: r.distance || "",
            duration: r.duration || "",
            driver:   null,
          });
          const uiStatus = dbStatusToUi(r.status);
          setStatus(uiStatus);
          prevStatusRef.current = uiStatus;

          if (r.driver_lat && r.driver_lng) {
            setDriverLocation({ lat: r.driver_lat, lng: r.driver_lng });
          }
          if (r.driver_id) loadDriverInfo(r.driver_id);
        }
      });
  }, [user]);

  const loadDriverInfo = async (driverId: string) => {
    const { data: app } = await supabase
      .from("driver_applications")
      .select("full_name, vehicle_make, vehicle_model, vehicle_plate, vehicle_year")
      .eq("user_id", driverId)
      .eq("status", "approved")
      .single();

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", driverId)
      .single();

    // Compute real average rating from rides table
    const { data: ratingData } = await supabase
      .from("rides")
      .select("rating_by_rider")
      .eq("driver_id", driverId)
      .not("rating_by_rider", "is", null);

    let driverRating: number | "New" = "New";
    if (ratingData && ratingData.length > 0) {
      const sum = ratingData.reduce((acc, r) => acc + (r.rating_by_rider ?? 0), 0);
      driverRating = Math.round((sum / ratingData.length) * 10) / 10;
    }

    setRide((prev) => ({
      ...prev,
      driver: {
        id:     driverId,
        name:   app?.full_name || profile?.full_name || "Driver",
        photo:  "",
        rating: driverRating,
        car:    app
          ? `${app.vehicle_year || ""} ${app.vehicle_make || ""} ${app.vehicle_model || ""}`.trim()
          : "Vehicle",
        plate:  app?.vehicle_plate || "---",
        eta:    4,
      },
    }));
  };

  // ─── Audible notification ──────────────────────────────────────────────────
  const playSound = useCallback((frequency = 880) => {
    if (!soundEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch { /* AudioContext not available */ }
  }, [soundEnabled]);

  // ─── Notifications helper — persists to DB ────────────────────────────────
  const addNotification = useCallback((n: Omit<Notification, "id" | "time">) => {
    const newNotif: Notification = { ...n, id: crypto.randomUUID(), time: new Date() };
    setNotifications((prev) => [newNotif, ...prev]);

    if (user) {
      supabase.from("notifications").insert({
        rider_id: user.id,
        type:     "ride",
        title:    n.title,
        body:     n.message,
      }).then(() => {/* fire and forget */});
    }
  }, [user]);

  // ─── Mark all notifications read ─────────────────────────────────────────
  const markNotificationsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("rider_id", user.id)
      .is("read_at", null);
  }, [user]);

  // ─── Fire sound + visual notification on status change ────────────────────
  useEffect(() => {
    if (status === prevStatusRef.current) return;
    prevStatusRef.current = status;

    switch (status) {
      case "driver_accepted":
        playSound(880);
        addNotification({
          title:   "Driver Found!",
          message: `${ride.driver?.name || "Your driver"} is on the way — ${ride.driver?.eta ?? 4} min away`,
          read:    false,
        });
        break;
      case "driver_arriving":
        playSound(1050);
        addNotification({
          title:   "Driver Arriving",
          message: "Your driver is almost at your pickup location",
          read:    false,
        });
        break;
      case "ride_started":
        playSound(660);
        addNotification({
          title:   "Ride Started",
          message: `En route to ${ride.dropoff?.address || "your destination"}`,
          read:    false,
        });
        break;
      case "ride_completed":
        playSound(520);
        paymentRef.current?.();
        addNotification({
          title:   "Ride Complete",
          message: `Your fare of $${ride.fare.toFixed(2)} has been deducted from your wallet`,
          read:    false,
        });
        break;
      default:
        break;
    }
  }, [status]);   // intentionally omit playSound/addNotification/ride to avoid loop

  // ─── Payment on ride completion ────────────────────────────────────────────
  // Keep a ref so the status-change effect can call the latest version
  const handlePaymentOnCompletion = useCallback(async () => {
    if (!user || !activeRideId || !ride.fare) return;

    const { data: bal } = await supabase
      .from("wallet_balances")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (!bal) return;

    if (bal.balance < ride.fare) {
      setPaymentError(`Insufficient balance. Fare: $${ride.fare.toFixed(2)}, Balance: $${bal.balance.toFixed(2)}`);
      return;
    }

    const newBalance = bal.balance - ride.fare;

    await Promise.all([
      supabase.from("wallet_transactions").insert({
        user_id:     user.id,
        type:        "ride_payment",
        amount:      ride.fare,
        description: `Ride to ${ride.dropoff?.address || "destination"}`,
        status:      "completed",
        ride_id:     activeRideId,
      }),
      supabase
        .from("wallet_balances")
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq("user_id", user.id),
      supabase
        .from("rides")
        .update({ payment_status: "paid", final_fare: ride.fare })
        .eq("id", activeRideId),
    ]);

    setWalletBalance(newBalance);
  }, [user, activeRideId, ride.fare, ride.dropoff]);

  useEffect(() => { paymentRef.current = handlePaymentOnCompletion; }, [handlePaymentOnCompletion]);

  // ─── Realtime ride subscription ────────────────────────────────────────────
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
          event:  "UPDATE",
          schema: "public",
          table:  "rides",
          filter: `id=eq.${activeRideId}`,
        },
        (payload) => {
          const r = payload.new as any;
          const newStatus = dbStatusToUi(r.status);
          setStatus(newStatus);

          setRide((prev) => ({
            ...prev,
            fare:     Number(r.fare) || prev.fare,
            distance: r.distance   || prev.distance,
            duration: r.duration   || prev.duration,
          }));

          // Update real driver location from DB
          if (r.driver_lat && r.driver_lng) {
            setDriverLocation({ lat: r.driver_lat, lng: r.driver_lng });
          }

          if (r.driver_id) {
            setRide((prev) => {
              if (!prev.driver || prev.driver.id !== r.driver_id) {
                loadDriverInfo(r.driver_id);
              }
              return prev;
            });
          }

          if (r.status === "cancelled") {
            setDriverLocation(null);
            setActiveRideId(null);
            setStatus("idle");
            setRide(defaultRide);
          }

          if (r.status === "completed") {
            setDriverLocation(null);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, [activeRideId]);

  // ─── Request ride ──────────────────────────────────────────────────────────
  const requestRide = useCallback(async () => {
    if (!user || !ride.pickup || !ride.dropoff) return;
    setStatus("searching");

    const { data, error } = await supabase
      .from("rides")
      .insert({
        rider_id:        user.id,
        pickup_lat:      ride.pickup.lat,
        pickup_lng:      ride.pickup.lng,
        pickup_address:  ride.pickup.address,
        dropoff_lat:     ride.dropoff.lat,
        dropoff_lng:     ride.dropoff.lng,
        dropoff_address: ride.dropoff.address,
        fare:            ride.fare,
        distance:        ride.distance,
        duration:        ride.duration,
        status:          "requested",
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create ride:", error);
      setStatus("fare_estimate");
      return;
    }

    setActiveRideId(data.id);
    addNotification({
      title:   "Ride Requested",
      message: "Looking for nearby drivers…",
      read:    false,
    });
  }, [user, ride.pickup, ride.dropoff, ride.fare, ride.distance, ride.duration, addNotification]);

  // ─── Cancel ride ───────────────────────────────────────────────────────────
  const cancelRide = useCallback(async () => {
    if (activeRideId) {
      await supabase
        .from("rides")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", activeRideId);
    }
    setDriverLocation(null);
    setActiveRideId(null);
    setStatus("idle");
    setRide(defaultRide);
    setPaymentError(null);
  }, [activeRideId]);

  return (
    <RideContext.Provider
      value={{
        status, setStatus, ride, setRide,
        requestRide, cancelRide,
        walletBalance, setWalletBalance,
        notifications, addNotification, markNotificationsRead,
        soundEnabled, setSoundEnabled,
        notificationsEnabled, setNotificationsEnabled,
        userLocation, driverLocation,
        activeRideId,
        savedPlaces, loadSavedPlaces,
        paymentError,
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
