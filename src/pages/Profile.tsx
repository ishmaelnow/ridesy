import { ArrowLeft, User, Mail, Phone, CreditCard, MapPin, Camera, Loader2, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProfileData {
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
}

function EditableField({
  label,
  icon: Icon,
  value,
  placeholder,
  onSave,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  placeholder: string;
  onSave: (v: string) => Promise<void>;
}) {
  const [editing, setEditing]   = useState(false);
  const [draft, setDraft]       = useState(value);
  const [saving, setSaving]     = useState(false);

  const handleSave = async () => {
    if (draft === value) { setEditing(false); return; }
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-secondary/60 transition-colors">
      <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
            className="w-full bg-transparent text-sm text-foreground outline-none border-b border-primary pb-0.5"
            placeholder={placeholder}
          />
        ) : (
          <p className="text-sm text-foreground">{value || placeholder}</p>
        )}
      </div>
      {editing ? (
        <div className="flex gap-1">
          <button onClick={handleSave} disabled={saving} className="p-1.5 rounded-lg bg-primary/10 text-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          </button>
          <button onClick={() => { setEditing(false); setDraft(value); }} className="p-1.5 rounded-lg bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => { setDraft(value); setEditing(true); }}
          className="text-xs text-primary px-2 py-1 rounded-lg bg-primary/10"
        >
          Edit
        </button>
      )}
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile]       = useState<ProfileData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const saveName = async (full_name: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ full_name, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    if (error) { toast.error("Failed to save name"); return; }
    setProfile((p) => p ? { ...p, full_name } : p);
    toast.success("Name updated");
  };

  const savePhone = async (phone: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ phone, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    if (error) { toast.error("Failed to save phone"); return; }
    setProfile((p) => p ? { ...p, phone } : p);
    toast.success("Phone updated");
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);

    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Failed to upload avatar");
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatar_url = urlData.publicUrl;

    await supabase
      .from("profiles")
      .update({ avatar_url, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    setProfile((p) => p ? { ...p, avatar_url } : p);
    toast.success("Avatar updated");
    setUploadingAvatar(false);
  };

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
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
              >
                <Camera className="w-4 h-4 text-primary-foreground" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <p className="text-lg font-semibold text-foreground mt-3">
              {profile?.full_name || user?.email?.split("@")[0] || "Rider"}
            </p>
            <p className="text-sm text-muted-foreground">
              Member since {new Date(user?.created_at ?? Date.now()).getFullYear()}
            </p>
          </div>

          {/* Editable Fields */}
          <div className="space-y-1">
            <EditableField
              label="Full Name"
              icon={User}
              value={profile?.full_name || ""}
              placeholder="Enter your name"
              onSave={saveName}
            />
            {/* Email — read-only */}
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl">
              <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm text-foreground">{user?.email || "—"}</p>
              </div>
            </div>
            <EditableField
              label="Phone"
              icon={Phone}
              value={profile?.phone || ""}
              placeholder="Enter phone number"
              onSave={savePhone}
            />
            {/* Static info rows */}
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl">
              <CreditCard className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Payment</p>
                <p className="text-sm text-foreground">Wallet / Stripe</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl">
              <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Home</p>
                <p className="text-sm text-foreground">Set in Saved Places</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
