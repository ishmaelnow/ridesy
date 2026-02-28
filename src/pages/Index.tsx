import { useState } from "react";
import MapView from "@/components/MapView";
import BottomSheet from "@/components/BottomSheet";
import TopBar from "@/components/TopBar";
import HamburgerMenu from "@/components/HamburgerMenu";
import { useRide } from "@/contexts/RideContext";

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { status } = useRide();
  const showDriver = ["driver_accepted", "driver_arriving", "ride_started"].includes(status);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      <MapView showDriver={showDriver} />
      <TopBar onMenuOpen={() => setMenuOpen(true)} />
      <BottomSheet />
      <HamburgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
};

export default Index;
