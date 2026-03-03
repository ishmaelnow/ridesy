import { ArrowLeft, Home, Briefcase, Star, MapPin, Plus, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRide } from "@/contexts/RideContext";
import { toast } from "sonner";

interface SavedPlace {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
}

const LABEL_PRESETS = ["Home", "Work", "Gym", "Other"];

const labelIcon = (label: string) => {
  switch (label.toLowerCase()) {
    case "home":  return Home;
    case "work":  return Briefcase;
    case "gym":   return Star;
    default:      return MapPin;
  }
};

interface PlaceFormProps {
  initial?: SavedPlace;
  onSave: (data: { label: string; address: string; lat: number; lng: number }) => Promise<void>;
  onClose: () => void;
}

function PlaceForm({ initial, onSave, onClose }: PlaceFormProps) {
  const [label, setLabel]     = useState(initial?.label || "Home");
  const [address, setAddress] = useState(initial?.address || "");
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    if (!label.trim() || !address.trim()) return;
    setSaving(true);
    // Use placeholder coords since we don't have a geocoder on this page
    await onSave({ label: label.trim(), address: address.trim(), lat: 0, lng: 0 });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="w-full max-w-md bg-background rounded-t-3xl p-5 space-y-4 safe-bottom">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            {initial ? "Edit Place" : "Add Place"}
          </h2>
          <button onClick={onClose} className="p-1">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Label presets */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Label</p>
          <div className="flex gap-2 flex-wrap">
            {LABEL_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setLabel(preset)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  label === preset
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Custom label"
            className="mt-2 w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Address */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Address</p>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 742 Evergreen Terrace, Springfield"
            className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!label.trim() || !address.trim() || saving}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {saving ? "Saving…" : "Save Place"}
        </button>
      </div>
    </div>
  );
}

export default function SavedPlaces() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loadSavedPlaces } = useRide();
  const [places, setPlaces]       = useState<SavedPlace[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<SavedPlace | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const fetchPlaces = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("saved_places")
      .select("*")
      .eq("rider_id", user.id)
      .order("created_at", { ascending: true });
    setPlaces(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPlaces(); }, [user]);

  const handleAdd = async (data: { label: string; address: string; lat: number; lng: number }) => {
    if (!user) return;
    const { error } = await supabase.from("saved_places").insert({
      rider_id: user.id,
      label:    data.label,
      address:  data.address,
      lat:      data.lat,
      lng:      data.lng,
    });
    if (error) {
      toast.error("Failed to save place");
      return;
    }
    toast.success("Place saved");
    setShowForm(false);
    fetchPlaces();
    loadSavedPlaces();
  };

  const handleEdit = async (data: { label: string; address: string; lat: number; lng: number }) => {
    if (!editing) return;
    const { error } = await supabase
      .from("saved_places")
      .update({ label: data.label, address: data.address })
      .eq("id", editing.id);
    if (error) {
      toast.error("Failed to update place");
      return;
    }
    toast.success("Place updated");
    setEditing(null);
    fetchPlaces();
    loadSavedPlaces();
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase.from("saved_places").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete place");
    } else {
      toast.success("Place removed");
      fetchPlaces();
      loadSavedPlaces();
    }
    setDeleting(null);
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/rider")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Saved Places</h1>
      </div>

      <div className="p-5 space-y-2">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : places.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <MapPin className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No saved places yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add Home, Work or your favourite spots</p>
          </div>
        ) : (
          places.map((place) => {
            const Icon = labelIcon(place.label);
            return (
              <div key={place.id} className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-secondary">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{place.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{place.address}</p>
                </div>
                <button
                  onClick={() => setEditing(place)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(place.id)}
                  disabled={deleting === place.id}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                >
                  {deleting === place.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            );
          })
        )}

        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:bg-secondary/40 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add new place
        </button>
      </div>

      {showForm && (
        <PlaceForm onSave={handleAdd} onClose={() => setShowForm(false)} />
      )}
      {editing && (
        <PlaceForm initial={editing} onSave={handleEdit} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
