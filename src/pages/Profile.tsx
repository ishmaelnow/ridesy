import { ArrowLeft, User, Mail, Phone, CreditCard, MapPin, Camera, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileData {
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile]   = useState<ProfileData | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone, avatar_url")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setProfile(data ?? { full_name: "", phone: null, avatar_url: null });
        setLoading(false);
      });
  }, [user]);

  const fields = [
    { icon: User,        label: "Full Name", value: profile?.full_name || "—"           },
    { icon: Mail,        label: "Email",     value: user?.email          || "—"           },
    { icon: Phone,       label: "Phone",     value: profile?.phone       || "Not set"     },
    { icon: CreditCard,  label: "Payment",   value: "Wallet / Stripe"                    },
    { icon: MapPin,      label: "Home",      value: "Set in Saved Places"                },
  ];

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/rider")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Profile</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="p-5 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Camera className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
            <p className="text-lg font-semibold text-foreground mt-3">
              {profile?.full_name || user?.email?.split("@")[0] || "Rider"}
            </p>
            <p className="text-sm text-muted-foreground">
              Member since {new Date(user?.created_at ?? Date.now()).getFullYear()}
            </p>
          </div>

          {/* Fields */}
          <div className="space-y-1">
            {fields.map((field) => (
              <button
                key={field.label}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-secondary/60 transition-colors"
              >
                <field.icon className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1 text-left">
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  <p className="text-sm text-foreground">{field.value}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
