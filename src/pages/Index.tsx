import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MapView from "@/components/MapView";
import BottomSheet from "@/components/BottomSheet";
import TopBar from "@/components/TopBar";
import HamburgerMenu from "@/components/HamburgerMenu";
import { useRide } from "@/contexts/RideContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { status, setWalletBalance } = useRide();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const showDriver = ["driver_accepted", "driver_arriving", "ride_started"].includes(status);

  // Handle return from Stripe card payment
  useEffect(() => {
    const ridePayment = searchParams.get("ride_payment");
    const rideId      = searchParams.get("ride_id");
    const amount      = searchParams.get("amount");

    if (ridePayment === "success" && rideId && amount && user) {
      supabase
        .from("rides")
        .update({ payment_status: "paid", final_fare: Number(amount) })
        .eq("id", rideId)
        .then(() => {
          // Record transaction
          supabase.from("wallet_transactions").insert({
            user_id:     user.id,
            type:        "card_payment",
            amount:      Number(amount),
            description: "Ride payment via card",
            status:      "completed",
            ride_id:     rideId,
          });
          toast.success(`Payment of $${Number(amount).toFixed(2)} received`);
        });

      // Clear params
      setSearchParams({});
    }
  }, [searchParams, user]);

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
