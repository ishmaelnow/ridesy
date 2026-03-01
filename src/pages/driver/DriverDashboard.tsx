import { useState } from "react";
import { useDriver } from "@/contexts/DriverContext";
import DriverMap from "@/components/driver/DriverMap";
import DriverBottomPanel from "@/components/driver/DriverBottomPanel";
import DriverTopBar from "@/components/driver/DriverTopBar";
import DriverMenu from "@/components/driver/DriverMenu";

export default function DriverDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { driverStatus } = useDriver();
  const showRoute = ["heading_to_pickup", "at_pickup", "ride_in_progress"].includes(driverStatus);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "100dvh", width: "100vw" }}>
      <DriverMap showRoute={showRoute} />
      <DriverTopBar onMenuOpen={() => setMenuOpen(true)} />
      <DriverBottomPanel />
      <DriverMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
