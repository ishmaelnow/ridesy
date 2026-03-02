import { ArrowLeft, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, Loader2, CheckCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const QUICK_AMOUNTS = [10, 25, 50, 100];
const MIN_AMOUNT = 5;
const MAX_AMOUNT = 500;

export default function WalletPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  // Handle return from Stripe checkout
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      const amount = searchParams.get("amount");
      if (amount) {
        supabase.functions.invoke("verify-wallet-payment", {
          body: { amount: Number(amount) },
        }).then(() => {
          setShowSuccess(true);
          fetchData();
          setTimeout(() => setShowSuccess(false), 3000);
        });
      }
      window.history.replaceState({}, "", "/wallet");
    }
  }, [searchParams]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const [balanceRes, txRes] = await Promise.all([
      supabase.from("wallet_balances").select("balance").eq("user_id", user.id).single(),
      supabase.from("wallet_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);

    setBalance(balanceRes.data?.balance ?? 0);
    setTransactions(txRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleTopUp = async (amount: number) => {
    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      toast({ title: "Invalid amount", description: `Enter between $${MIN_AMOUNT} and $${MAX_AMOUNT}`, variant: "destructive" });
      return;
    }
    setTopUpLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-wallet-checkout", {
        body: { amount },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create checkout", variant: "destructive" });
    } finally {
      setTopUpLoading(false);
    }
  };

  const handleCustomTopUp = () => {
    const num = parseFloat(customAmount);
    if (!Number.isFinite(num) || num < MIN_AMOUNT || num > MAX_AMOUNT) {
      toast({ title: "Invalid amount", description: `Enter between $${MIN_AMOUNT} and $${MAX_AMOUNT}`, variant: "destructive" });
      return;
    }
    handleTopUp(Math.round(num * 100) / 100);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return "Today";
    if (diff < 172800000) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/rider")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Wallet</h1>
      </div>

      {showSuccess && (
        <div className="mx-5 mt-4 flex items-center gap-2 bg-primary/15 text-primary rounded-xl px-4 py-3 text-sm font-medium animate-in fade-in">
          <CheckCircle className="w-5 h-5" />
          Wallet topped up successfully!
        </div>
      )}

      <div className="p-5 space-y-6">
        {/* Balance Card */}
        <div className="bg-primary rounded-2xl p-5 text-primary-foreground">
          <p className="text-sm opacity-80">Available Balance</p>
          <p className="text-3xl font-bold mt-1">
            {loading ? "..." : `$${Number(balance).toFixed(2)}`}
          </p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowTopUp(!showTopUp)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-foreground/20 text-sm font-medium active:scale-[0.97] transition-transform"
            >
              <Plus className="w-4 h-4" />
              Top Up
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-foreground/20 text-sm font-medium">
              <CreditCard className="w-4 h-4" />
              Cards
            </button>
          </div>
        </div>

        {/* Top-up section */}
        {showTopUp && (
          <div className="animate-in slide-in-from-top-2 fade-in space-y-4">
            {/* Custom amount input */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Enter amount</p>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">$</span>
                  <input
                    type="number"
                    min={MIN_AMOUNT}
                    max={MAX_AMOUNT}
                    step="0.01"
                    placeholder={`${MIN_AMOUNT} – ${MAX_AMOUNT}`}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-3 rounded-xl bg-secondary text-foreground text-sm font-semibold border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <button
                  disabled={topUpLoading || !customAmount}
                  onClick={handleCustomTopUp}
                  className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.97] transition-transform disabled:opacity-50"
                >
                  {topUpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                </button>
              </div>
            </div>

            {/* Quick amounts */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Quick add</p>
              <div className="flex gap-2">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    disabled={topUpLoading}
                    onClick={() => {
                      setCustomAmount(String(amt));
                      handleTopUp(amt);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-secondary text-foreground font-medium text-sm active:scale-[0.97] transition-all disabled:opacity-50"
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Powered by Stripe · Apple Pay & Google Pay supported
            </p>
          </div>
        )}

        {/* Payment Methods */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">Payment Methods</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">Stripe Checkout</p>
                <p className="text-xs text-muted-foreground">Apple Pay, Google Pay, Cards</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">Transaction History</p>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-1">
              {transactions.map((tx) => {
                const isCredit = tx.type === "top_up" || tx.type === "refund";
                return (
                  <div key={tx.id} className="flex items-center gap-3 px-3 py-3 rounded-xl">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      isCredit ? "bg-primary/15" : "bg-secondary"
                    }`}>
                      {isCredit ? (
                        <ArrowDownLeft className="w-4 h-4 text-primary" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{tx.description || tx.type}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
                    </div>
                    <p className={`text-sm font-medium ${isCredit ? "text-primary" : "text-foreground"}`}>
                      {isCredit ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
