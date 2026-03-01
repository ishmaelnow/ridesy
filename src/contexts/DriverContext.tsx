import React, { createContext, useContext, useState, useCallback } from "react";

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
  completeRide: () => void;
  goOnline: () => void;
  goOffline: () => void;
  earnings: EarningsData;
  rating: number;
  completedTrips: RideRequest[];
}

const DriverContext = createContext<DriverContextType | null>(null);

const mockRequests: RideRequest[] = [
  {
    id: "r1",
    rider: { name: "Sarah Miller", rating: 4.8 },
    pickup: { address: "123 Main St", lat: 40.7128, lng: -74.006 },
    dropoff: { address: "456 Broadway", lat: 40.72, lng: -74.0 },
    fare: 14.5,
    distance: "2.3 mi",
    duration: "8 min",
    createdAt: new Date(),
  },
  {
    id: "r2",
    rider: { name: "James Wilson", rating: 4.6 },
    pickup: { address: "789 Park Ave", lat: 40.715, lng: -74.003 },
    dropoff: { address: "321 5th Ave", lat: 40.725, lng: -73.995 },
    fare: 22.0,
    distance: "4.1 mi",
    duration: "14 min",
    createdAt: new Date(),
  },
];

export function DriverProvider({ children }: { children: React.ReactNode }) {
  const [driverStatus, setDriverStatus] = useState<DriverStatus>("offline");
  const [currentRequest, setCurrentRequest] = useState<RideRequest | null>(null);
  const [earnings, setEarnings] = useState<EarningsData>({ today: 87.5, week: 432.0, month: 1845.0, trips: 12 });
  const [completedTrips, setCompletedTrips] = useState<RideRequest[]>([]);
  const rating = 4.92;

  const goOnline = useCallback(() => {
    setDriverStatus("online");
    // Simulate incoming ride request after going online
    setTimeout(() => {
      setCurrentRequest(mockRequests[Math.floor(Math.random() * mockRequests.length)]);
      setDriverStatus("ride_offered");
    }, 4000);
  }, []);

  const goOffline = useCallback(() => {
    setDriverStatus("offline");
    setCurrentRequest(null);
  }, []);

  const acceptRide = useCallback(() => {
    setDriverStatus("heading_to_pickup");
    // Simulate arriving at pickup
    setTimeout(() => {
      setDriverStatus("at_pickup");
      // Simulate rider getting in
      setTimeout(() => {
        setDriverStatus("ride_in_progress");
      }, 5000);
    }, 6000);
  }, []);

  const declineRide = useCallback(() => {
    setCurrentRequest(null);
    setDriverStatus("online");
    // Simulate another request
    setTimeout(() => {
      setCurrentRequest(mockRequests[Math.floor(Math.random() * mockRequests.length)]);
      setDriverStatus("ride_offered");
    }, 5000);
  }, []);

  const completeRide = useCallback(() => {
    if (currentRequest) {
      setCompletedTrips((prev) => [...prev, currentRequest]);
      setEarnings((prev) => ({
        ...prev,
        today: prev.today + currentRequest.fare,
        week: prev.week + currentRequest.fare,
        month: prev.month + currentRequest.fare,
        trips: prev.trips + 1,
      }));
    }
    setDriverStatus("ride_complete");
    setTimeout(() => {
      setCurrentRequest(null);
      setDriverStatus("online");
      // Next request
      setTimeout(() => {
        setCurrentRequest(mockRequests[Math.floor(Math.random() * mockRequests.length)]);
        setDriverStatus("ride_offered");
      }, 6000);
    }, 3000);
  }, [currentRequest]);

  return (
    <DriverContext.Provider
      value={{
        driverStatus, setDriverStatus,
        currentRequest, setCurrentRequest,
        acceptRide, declineRide, completeRide,
        goOnline, goOffline,
        earnings, rating, completedTrips,
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
