import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Method = "email" | "phone";
type Step = "form" | "otp";
type Mode = "login" | "signup";

export default function Auth() {
  const [method, setMethod] = useState<Method>("email");
  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<Step>("form");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { signIn, signUp, sendOtp, verifyOtp } = useAuth();

  const inputClass =
    "w-full px-4 py-3 pl-11 rounded-xl bg-secondary/60 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors";

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (mode === "signup") {
      const { error } = await signUp(email, password, fullName);
      if (error) toast.error(error);
      else { toast.success("Account created! Check your email to verify, then sign in."); setMode("login"); }
    } else {
      const { error } = await signIn(email, password);
      if (error) toast.error(error);
      else navigate("/rider");
    }
    setSubmitting(false);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) { toast.error("Enter a phone number"); return; }
    setSubmitting(true);
    const { error } = await sendOtp(phone.trim());
    if (error) toast.error(error);
    else { toast.success("OTP sent!"); setStep("otp"); }
    setSubmitting(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await verifyOtp(phone.trim(), otp.trim());
    if (error) toast.error(error);
    else navigate("/rider");
    setSubmitting(false);
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <div className="safe-top px-4 pt-3 pb-2">
        <button onClick={() => step === "otp" ? setStep("form") : navigate("/")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {step === "otp" ? "Enter OTP" : mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === "otp" ? `Code sent to ${phone}` : mode === "login" ? "Sign in to continue" : "Get started today"}
            </p>
          </div>

          {/* Method toggle */}
          {step === "form" && (
            <div className="flex rounded-xl bg-secondary p-1">
              {(["email", "phone"] as Method[]).map(m => (
                <button key={m} type="button" onClick={() => setMethod(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${method === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
                  {m === "email" ? "Email" : "Phone"}
                </button>
              ))}
            </div>
          )}

          {/* Email form */}
          {method === "email" && step === "form" && (
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {mode === "signup" && (
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input className={inputClass} placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input className={inputClass} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input className={inputClass} placeholder="Password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
              <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 active:scale-[0.98] transition-transform">
                {submitting ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>
          )}

          {/* Phone form */}
          {method === "phone" && step === "form" && (
            <form onSubmit={handleSendOtp} className="space-y-3">
              {mode === "signup" && (
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input className={inputClass} placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>
              )}
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input className={inputClass} placeholder="+1 234 567 8900" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
              <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 active:scale-[0.98] transition-transform">
                {submitting ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {/* OTP verification */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div className="relative">
                <input
                  className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border text-sm text-foreground text-center tracking-[0.5em] text-lg font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="000000" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} required />
              </div>
              <button type="submit" disabled={submitting || otp.length < 6} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 active:scale-[0.98] transition-transform">
                {submitting ? "Verifying..." : "Verify & Sign In"}
              </button>
              <button type="button" onClick={() => sendOtp(phone)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1">
                Resend OTP
              </button>
            </form>
          )}

          {/* Toggle login/signup */}
          {step === "form" && (
            <p className="text-center text-sm text-muted-foreground">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-primary font-medium">
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
