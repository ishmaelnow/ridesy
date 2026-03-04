import { ArrowLeft, Car, Zap, Users, Wallet, CreditCard, AlertTriangle, Lock } from "lucide-react";
import { useRide } from "@/contexts/RideContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const rideTypes = [
  { id: "standard", label: "Standard", icon: Car, multiplier: 1, eta: "4 min", desc: "Affordable rides" },
  { id: "premium", label: "Premium", icon: Zap, multiplier: 1.8, eta: "2 min", desc: "Luxury vehicles" },
  { id: "shared", label: "Shared", icon: Users, multiplier: 0.7, eta: "7 min", desc: "Share & save" },
];

function formatCardNumber(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
}

export default function FareEstimate() {
  const { setStatus, ride, requestRide, walletBalance, paymentMethod, setPaymentMethod } = useRide();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("standard");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardError, setCardError] = useState("");

  const selectedType = rideTypes.find((r) => r.id === selected)!;
  const fare = ride.fare * selectedType.multiplier;
  const fareStr = fare.toFixed(2);
  const insufficient = paymentMethod === "wallet" && walletBalance < fare;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setStatus("selecting_destination")} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">To</p>
          <p className="text-sm font-medium text-foreground truncate">{ride.dropoff?.address}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{ride.distance}</p>
          <p className="text-xs text-muted-foreground">{ride.duration}</p>
        </div>
      </div>

      {/* Ride Types */}
      <div className="space-y-2">
        {rideTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelected(type.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              selected === type.id
                ? "bg-primary/10 border border-primary/30"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              selected === type.id ? "bg-primary/20" : "bg-muted"
            }`}>
              <type.icon className={`w-5 h-5 ${selected === type.id ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">{type.label}</p>
              <p className="text-xs text-muted-foreground">{type.desc}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                ${(ride.fare * type.multiplier).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">{type.eta}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Payment method selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setPaymentMethod("wallet")}
          className={`flex-1 flex items-center gap-2 px-3 py-3 rounded-xl transition-all ${
            paymentMethod === "wallet"
              ? "bg-primary/10 border border-primary/30"
              : "bg-secondary"
          }`}
        >
          <Wallet className={`w-4 h-4 shrink-0 ${paymentMethod === "wallet" ? "text-primary" : "text-muted-foreground"}`} />
          <div className="text-left">
            <p className="text-xs font-medium text-foreground">Wallet</p>
            <p className={`text-xs ${insufficient ? "text-destructive" : "text-muted-foreground"}`}>
              ${walletBalance.toFixed(2)}
            </p>
          </div>
          {insufficient && <AlertTriangle className="w-3.5 h-3.5 text-destructive ml-auto" />}
        </button>
        <button
          onClick={() => setPaymentMethod("card")}
          className={`flex-1 flex items-center gap-2 px-3 py-3 rounded-xl transition-all ${
            paymentMethod === "card"
              ? "bg-primary/10 border border-primary/30"
              : "bg-secondary"
          }`}
        >
          <CreditCard className={`w-4 h-4 shrink-0 ${paymentMethod === "card" ? "text-primary" : "text-muted-foreground"}`} />
          <div className="text-left">
            <p className="text-xs font-medium text-foreground">Card</p>
            <p className="text-xs text-muted-foreground">Pay before ride</p>
          </div>
        </button>
      </div>

      {paymentMethod === "wallet" && insufficient && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-destructive">
            Need ${(fare - walletBalance).toFixed(2)} more
          </p>
          <button
            onClick={() => navigate("/wallet")}
            className="text-xs text-primary font-medium px-3 py-1.5 rounded-lg bg-primary/10"
          >
            Top Up
          </button>
        </div>
      )}

      {/* Card input form */}
      {paymentMethod === "card" && (
        <div className="space-y-2.5 rounded-xl bg-secondary/60 border border-border p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-medium">Card Details</p>
          </div>
          <input
            className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Name on card"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
          />
          <input
            className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 tracking-widest"
            placeholder="Card number"
            inputMode="numeric"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          />
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="MM/YY"
              inputMode="numeric"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            />
            <input
              className="w-24 px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="CVV"
              inputMode="numeric"
              maxLength={4}
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
            />
          </div>
          {cardError && <p className="text-xs text-destructive">{cardError}</p>}
        </div>
      )}

      {paymentMethod === "wallet" ? (
        <button
          onClick={requestRide}
          disabled={insufficient}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Request {selectedType.label} · ${fareStr}
        </button>
      ) : (
        <button
          onClick={() => {
            const rawNum = cardNumber.replace(/\s/g, "");
            if (!cardName.trim() || rawNum.length < 16 || expiry.length < 5 || cvv.length < 3) {
              setCardError("Please fill in all card details correctly.");
              return;
            }
            setCardError("");
            requestRide();
          }}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          Pay & Request · ${fareStr}
        </button>
      )}
    </div>
  );
}
