import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type DriverStatus = "offline" | "online" | "ride_offered" | "heading_to_pickup" | "at_pickup" | "ride_in_progress" | "ride_complete";

export interface RideRequest {
  id: string;
  rider: { name: string; rating: number };
  pickup: { address: string; lat: number; lng: number };
  dropoff: { address: string; lat: number; lng: number };
  fare: number;
  distance: string;
  duration: string;
  createdAt: Date;
}

export interface EarningsData {
  today: number;
  week: number;
  month: number;
  trips: number;
}

interface DriverContextType {
  driverStatus: DriverStatus;
  setDriverStatus: (s: DriverStatus) => void;
  currentRequest: RideRequest | null;
  setCurrentRequest: React.Dispatch<React.SetStateAction<RideRequest | null>>;
  acceptRide: () => void;
  declineRide: () => void;
  startRide: () => void;
  completeRide: () => void;
  goOnline: () => void;
  goOffline: () => void;
  earnings: EarningsData;
  rating: number;
  completedTrips: RideRequest[];
  activeRideId: string | null;
}

const DriverContext = createContext<DriverContextType | null>(null);

function dbStatusToDriver(dbStatus: string): DriverStatus {
  switch (dbStatus) {
    case "accepted": return "heading_to_pickup";
    case "driver_arriving": return "at_pickup";
    case "in_progress": return "ride_in_progress";
    case "completed": return "ride_complete";
    case "cancelled": return "online";
    default: return "online";
  }
}

export function DriverProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [driverStatus, setDriverStatus] = useState<DriverStatus>("offline");
  const [currentRequest, setCurrentRequest] = useState<RideRequest | null>(null);
  const [earnings, setEarnings] = useState<EarningsData>({ today: 0, week: 0, month: 0, trips: 0 });
  const [completedTrips, setCompletedTrips] = useState<RideRequest[]>([]);
  const [activeRideId, setActiveRideId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const activeRideIdRef = useRef<string | null>(null);

  // Load real average rating from completed rides
  useEffect(() => {
    if (!user) return;
    supabase
      .from("rides")
      .select("rating_by_rider")
      .eq("driver_id", user.id)
      .not("rating_by_rider", "is", null)
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const avg = data.reduce((sum, r) => sum + (r.rating_by_rider ?? 0), 0) / data.length;
        setRating(Math.round(avg * 100) / 100);
      });
  }, [user]);

  // Load earnings from completed rides
  useEffect(() => {
    if (!user) return;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();

    supabase
      .from("rides")
      .select("fare, completed_at")
      .eq("driver_id", user.id)
      .eq("status", "completed")
      .then(({ data }) => {
        if (!data) return;
        let today = 0, week = 0, month = 0;
        data.forEach((r) => {
          const fare = Number(r.fare) || 0;
          month += fare;
          if (r.completed_at && r.completed_at >= startOfWeek) week += fare;
          if (r.completed_at && r.completed_at >= startOfDay) today += fare;
        });
        setEarnings({ today, week, month, trips: data.length });
      });
  }, [user]);

  // Check for active ride on mount
  useEffect(() => {
    if (!user) return;
    supabase
      .from("rides")
      .select("*")
      .eq("driver_id", user.id)
      .in("status", ["accepted", "driver_arriving", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(1)
      .then(async ({ data }) => {
        if (data && data.length > 0) {
          const r = data[0];
          setActiveRideId(r.id);
          const riderProfile = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", r.rider_id)
            .single();
          setCurrentRequest({
            id: r.id,
            rider: { name: riderProfile.data?.full_name || "Rider", rating: 4.8 },
            pickup: { address: r.pickup_address, lat: r.pickup_lat, lng: r.pickup_lng },
            dropoff: { address: r.dropoff_address, lat: r.dropoff_lat, lng: r.dropoff_lng },
            fare: Number(r.fare) || 0,
            distance: r.distance || "",
            duration: r.duration || "",
            createdAt: new Date(r.created_at),
          });
          setDriverStatus(dbStatusToDriver(r.status));
        }
      });
  }, [user]);

  // Poll for new ride requests when online
  useEffect(() => {
    if (driverStatus !== "online" || !user) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    const checkForRides = async () => {
      const { data } = await supabase
        .from("rides")
        .select("*")
        .eq("status", "requested")
        .is("driver_id", null)
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0 && driverStatus === "online") {
        const r = data[0];
        // Load rider info
        const riderProfile = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", r.rider_id)
          .single();

        setCurrentRequest({
          id: r.id,
          rider: { name: riderProfile.data?.full_name || "Rider", rating: 4.8 },
          pickup: { address: r.pickup_address, lat: r.pickup_lat, lng: r.pickup_lng },
          dropoff: { address: r.dropoff_address, lat: r.dropoff_lat, lng: r.dropoff_lng },
          fare: Number(r.fare) || 0,
          distance: r.distance || "",
          duration: r.duration || "",
          createdAt: new Date(r.created_at),
        });
        setDriverStatus("ride_offered");
      }
    };

    // Check immediately
    checkForRides();
    // Then poll every 5 seconds
    pollingRef.current = setInterval(checkForRides, 5000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [driverStatus, user]);

  // Subscribe to active ride updates
  useEffect(() => {
    if (!activeRideId) {
      channelRef.current?.unsubscribe();
      channelRef.current = null;
      return;
    }

    const channel = supabase
      .channel(`driver-ride-${activeRideId}`)
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
          if (r.status === "cancelled") {
            setDriverStatus("online");
            setCurrentRequest(null);
            setActiveRideId(null);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      channel.unsubscribe();
    };
  }, [activeRideId]);

  // Keep activeRideIdRef in sync so the watchPosition callback always has the latest value
  useEffect(() => {
    activeRideIdRef.current = activeRideId;
  }, [activeRideId]);

  // ─── Continuous GPS → writes driver_lat/driver_lng to active ride ──────────
  useEffect(() => {
    const activeStatuses: DriverStatus[] = ["heading_to_pickup", "at_pickup", "ride_in_progress"];
    if (!activeStatuses.includes(driverStatus) || !navigator.geolocation) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const rideId = activeRideIdRef.current;
        if (!rideId) return;
        await supabase
          .from("rides")
          .update({ driver_lat: pos.coords.latitude, driver_lng: pos.coords.longitude })
          .eq("id", rideId);
      },
      () => { /* permission denied */ },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [driverStatus]);

  const goOnline = useCallback(() => {
    setDriverStatus("online");
  }, []);

  const goOffline = useCallback(() => {
    setDriverStatus("offline");
    setCurrentRequest(null);
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const acceptRide = useCallback(async () => {
    if (!currentRequest || !user) return;
    
    const { error } = await supabase
      .from("rides")
      .update({ driver_id: user.id, status: "accepted" })
      .eq("id", currentRequest.id)
      .eq("status", "requested"); // Only accept if still requested

    if (error) {
      console.error("Failed to accept ride:", error);
      setCurrentRequest(null);
      setDriverStatus("online");
      return;
    }

    setActiveRideId(currentRequest.id);
    setDriverStatus("heading_to_pickup");
  }, [currentRequest, user]);

  const declineRide = useCallback(() => {
    setCurrentRequest(null);
    setDriverStatus("online");
  }, []);

  // Driver arrived at pickup — update status
  const startRide = useCallback(async () => {
    if (!activeRideId) return;
    await supabase
      .from("rides")
      .update({ status: "in_progress", started_at: new Date().toISOString() })
      .eq("id", activeRideId);
    setDriverStatus("ride_in_progress");
  }, [activeRideId]);

  const completeRide = useCallback(async () => {
    if (!activeRideId || !currentRequest) return;

    await supabase
      .from("rides")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", activeRideId);

    setCompletedTrips((prev) => [...prev, currentRequest]);
    setEarnings((prev) => ({
      ...prev,
      today: prev.today + currentRequest.fare,
      week: prev.week + currentRequest.fare,
      month: prev.month + currentRequest.fare,
      trips: prev.trips + 1,
    }));

    setDriverStatus("ride_complete");
    setTimeout(() => {
      setCurrentRequest(null);
      setActiveRideId(null);
      setDriverStatus("online");
    }, 3000);
  }, [activeRideId, currentRequest]);

  return (
    <DriverContext.Provider
      value={{
        driverStatus, setDriverStatus,
        currentRequest, setCurrentRequest,
        acceptRide, declineRide, startRide, completeRide,
        goOnline, goOffline,
        earnings, rating, completedTrips,
        activeRideId,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
}

export function useDriver() {
  const ctx = useContext(DriverContext);
  if (!ctx) throw new Error("useDriver must be used within DriverProvider");
  return ctx;
}
