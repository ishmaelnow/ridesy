import { ArrowLeft, DollarSign, TrendingUp, Clock, Calendar, Banknote, Loader2, ExternalLink, CheckCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDriver } from "@/contexts/DriverContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export default function DriverEarnings() {
  const navigate = useNavigate();
  const { earnings } = useDriver();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [connectLoading, setConnectLoading] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [stripeAccount, setStripeAccount] = useState<{ stripe_account_id: string; onboarding_complete: boolean } | null>(null);
  const [connectSuccess, setConnectSuccess] = useState(false);
  const [completionRate, setCompletionRate] = useState<number | null>(null);

  useEffect(() => {
    if (searchParams.get("connect") === "complete") {
      setConnectSuccess(true);
      // Update onboarding status
      if (user) {
        supabase.from("driver_stripe_accounts")
          .update({ onboarding_complete: true, updated_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .then(() => fetchStripeAccount());
      }
      window.history.replaceState({}, "", "/driver/earnings");
      setTimeout(() => setConnectSuccess(false), 3000);
    }
  }, [searchParams]);

  const fetchStripeAccount = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("driver_stripe_accounts")
      .select("stripe_account_id, onboarding_complete")
      .eq("user_id", user.id)
      .single();
    setStripeAccount(data);
  };

  useEffect(() => { fetchStripeAccount(); }, [user]);

  // Calculate completion rate from real ride data
  useEffect(() => {
    if (!user) return;
    supabase
      .from("rides")
      .select("status")
      .eq("driver_id", user.id)
      .in("status", ["completed", "cancelled"])
      .then(({ data }) => {
        if (!data || data.length === 0) { setCompletionRate(null); return; }
        const completed = data.filter((r) => r.status === "completed").length;
        setCompletionRate(Math.round((completed / data.length) * 100));
      });
  }, [user]);

  const handleConnectOnboarding = async () => {
    setConnectLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-connect-account");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to start onboarding", variant: "destructive" });
    } finally {
      setConnectLoading(false);
    }
  };

  const handlePayout = async () => {
    setPayoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-driver-payout", {
        body: { amount: earnings.today },
      });
      if (error) throw error;
      toast({ title: "Payout sent!", description: `$${earnings.today.toFixed(2)} transferred to your bank` });
    } catch (err: any) {
      toast({ title: "Payout failed", description: err.message || "Try again later", variant: "destructive" });
    } finally {
      setPayoutLoading(false);
    }
  };

  const periods = [
    { label: "Today", value: earnings.today, icon: Clock },
    { label: "This Week", value: earnings.week, icon: Calendar },
    { label: "This Month", value: earnings.month, icon: TrendingUp },
  ];

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/driver")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Earnings</h1>
      </div>

      {connectSuccess && (
        <div className="mx-5 mt-4 flex items-center gap-2 bg-primary/15 text-primary rounded-xl px-4 py-3 text-sm font-medium animate-in fade-in">
          <CheckCircle className="w-5 h-5" />
          Stripe account connected!
        </div>
      )}

      <div className="p-5 space-y-5">
        <div className="bg-primary rounded-2xl p-6 text-center">
          <DollarSign className="w-8 h-8 text-primary-foreground mx-auto mb-2" />
          <p className="text-3xl font-bold text-primary-foreground">${earnings.month.toFixed(2)}</p>
          <p className="text-sm text-primary-foreground/70 mt-1">Total this month</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {periods.map((p) => (
            <div key={p.label} className="bg-card rounded-xl p-4 text-center border border-border">
              <p.icon className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
              <p className="text-lg font-bold text-foreground">${p.value.toFixed(0)}</p>
              <p className="text-[10px] text-muted-foreground">{p.label}</p>
            </div>
          ))}
        </div>

        {/* Stripe Connect & Payouts */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Payouts</p>
          {!stripeAccount ? (
            <button
              onClick={handleConnectOnboarding}
              disabled={connectLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.97] transition-transform disabled:opacity-50"
            >
              {connectLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Connect Bank Account
            </button>
          ) : !stripeAccount.onboarding_complete ? (
            <button
              onClick={handleConnectOnboarding}
              disabled={connectLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm active:scale-[0.97] transition-transform disabled:opacity-50"
            >
              {connectLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Complete Onboarding
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-primary/10 rounded-xl px-4 py-3">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">Bank account connected</span>
              </div>
              <button
                onClick={handlePayout}
                disabled={payoutLoading || earnings.today <= 0}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.97] transition-transform disabled:opacity-50"
              >
                {payoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
                Withdraw ${earnings.today.toFixed(2)}
              </button>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Stats</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-card rounded-xl px-4 py-3 border border-border">
              <span className="text-sm text-muted-foreground">Total Trips</span>
              <span className="text-sm font-semibold text-foreground">{earnings.trips}</span>
            </div>
            <div className="flex items-center justify-between bg-card rounded-xl px-4 py-3 border border-border">
              <span className="text-sm text-muted-foreground">Avg. per Trip</span>
              <span className="text-sm font-semibold text-foreground">${earnings.trips > 0 ? (earnings.month / earnings.trips).toFixed(2) : "0.00"}</span>
            </div>
            <div className="flex items-center justify-between bg-card rounded-xl px-4 py-3 border border-border">
              <span className="text-sm text-muted-foreground">Completion Rate</span>
              <span className="text-sm font-semibold text-foreground">{completionRate !== null ? `${completionRate}%` : "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
