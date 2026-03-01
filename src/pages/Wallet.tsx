import { ArrowLeft, Plus, ArrowUpRight, ArrowDownLeft, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRide } from "@/contexts/RideContext";

const transactions = [
  { id: "1", type: "debit", label: "Ride to Times Square", amount: -12.5, date: "Today, 2:30 PM" },
  { id: "2", type: "credit", label: "Wallet Top Up", amount: 50.0, date: "Yesterday" },
  { id: "3", type: "debit", label: "Ride to JFK Airport", amount: -35.0, date: "Feb 25" },
  { id: "4", type: "credit", label: "Refund - Cancelled Ride", amount: 8.0, date: "Feb 24" },
  { id: "5", type: "debit", label: "Ride to Brooklyn Bridge", amount: -15.75, date: "Feb 23" },
];

export default function WalletPage() {
  const navigate = useNavigate();
  const { walletBalance } = useRide();

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/rider")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Wallet</h1>
      </div>

      <div className="p-5 space-y-6">
        {/* Balance Card */}
        <div className="bg-primary rounded-2xl p-5 text-primary-foreground">
          <p className="text-sm opacity-80">Available Balance</p>
          <p className="text-3xl font-bold mt-1">${walletBalance.toFixed(2)}</p>
          <div className="flex gap-3 mt-4">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-foreground/20 text-sm font-medium">
              <Plus className="w-4 h-4" />
              Top Up
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-foreground/20 text-sm font-medium">
              <CreditCard className="w-4 h-4" />
              Cards
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">Payment Methods</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">Visa •••• 4242</p>
                <p className="text-xs text-muted-foreground">Default</p>
              </div>
            </div>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground">
              <Plus className="w-4 h-4" />
              Add payment method
            </button>
          </div>
        </div>

        {/* Transactions */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">Transaction History</p>
          <div className="space-y-1">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 px-3 py-3 rounded-xl">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  tx.type === "credit" ? "bg-primary/15" : "bg-secondary"
                }`}>
                  {tx.type === "credit" ? (
                    <ArrowDownLeft className="w-4 h-4 text-primary" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{tx.label}</p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
                <p className={`text-sm font-medium ${
                  tx.type === "credit" ? "text-primary" : "text-foreground"
                }`}>
                  {tx.type === "credit" ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
