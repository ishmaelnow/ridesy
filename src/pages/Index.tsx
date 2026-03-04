import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MapView from "@/components/MapView";
import BottomSheet from "@/components/BottomSheet";
import TopBar from "@/components/TopBar";
import HamburgerMenu from "@/components/HamburgerMenu";
import { useRide } from "@/contexts/RideContext";

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { status, requestPrepaidRide } = useRide();
  const [searchParams, setSearchParams] = useSearchParams();
  const showDriver = ["driver_accepted", "driver_arriving", "ride_started"].includes(status);

  // Handle return from Stripe card pre-payment — create the ride
  useEffect(() => {
    const cardBooking = searchParams.get("card_booking");
    const amount      = searchParams.get("amount");

    if (cardBooking === "success" && amount) {
      setSearchParams({});
      requestPrepaidRide(Number(amount));
    }
  }, [searchParams]);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "100dvh", width: "100vw" }}>
      <MapView showDriver={showDriver} />
      <TopBar onMenuOpen={() => setMenuOpen(true)} />
      <BottomSheet />
      <HamburgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
};

export default Index;
