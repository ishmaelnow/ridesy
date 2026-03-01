import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { reverseGeocode } from "@/lib/geocode";

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
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

const defaultRide: RideInfo = {
  pickup: null,
  dropoff: null,
  fare: 0,
  distance: "",
  duration: "",
  driver: null,
};

const mockDriver: Driver = {
  id: "d1",
  name: "Ahmed Hassan",
  photo: "",
  rating: 4.9,
  car: "Toyota Camry 2023",
  plate: "ABC 1234",
  eta: 4,
};

const RideContext = createContext<RideContextType | null>(null);

export function RideProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<RideStatus>("idle");
  const [ride, setRide] = useState<RideInfo>(defaultRide);
  const [walletBalance, setWalletBalance] = useState(250.0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

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
        // No fallback — keep null so user sees real location prompt
      }
    );
  }, []);

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

  const requestRide = useCallback(() => {
    setStatus("searching");

    // Simulate driver search
    setTimeout(() => {
      setRide((prev) => ({ ...prev, driver: mockDriver }));
      setStatus("driver_accepted");
      addNotification({ title: "Driver Found!", message: `${mockDriver.name} accepted your ride`, read: false });
      playSound();

      // Simulate driver arriving
      setTimeout(() => {
        setStatus("driver_arriving");
        addNotification({ title: "Driver Arriving", message: "Your driver is nearby", read: false });
        playSound();

        // Simulate ride start
        setTimeout(() => {
          setStatus("ride_started");
          addNotification({ title: "Ride Started", message: "Enjoy your ride!", read: false });
          playSound();

          // Simulate ride complete
          setTimeout(() => {
            setStatus("ride_completed");
            setWalletBalance((prev) => prev - (ride.fare || 12.5));
            addNotification({ title: "Ride Completed", message: `Fare: $${ride.fare || 12.5}`, read: false });
            playSound();
          }, 8000);
        }, 5000);
      }, 5000);
    }, 3000);
  }, [ride.fare, addNotification, playSound]);

  const cancelRide = useCallback(() => {
    setStatus("idle");
    setRide(defaultRide);
  }, []);

  return (
    <RideContext.Provider
      value={{
        status, setStatus, ride, setRide,
        requestRide, cancelRide,
        walletBalance, setWalletBalance,
        notifications, addNotification,
        soundEnabled, setSoundEnabled,
        userLocation,
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
