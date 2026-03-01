import { ArrowLeft, Home, Briefcase, Star, Plus, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const places = [
  { icon: Home, label: "Home", address: "742 Evergreen Terrace, Springfield" },
  { icon: Briefcase, label: "Work", address: "123 Business Ave, Manhattan" },
  { icon: Star, label: "Gym", address: "456 Fitness Blvd, Brooklyn" },
  { icon: MapPin, label: "Mom's House", address: "789 Family St, Queens" },
];

export default function SavedPlaces() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/rider")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Saved Places</h1>
      </div>

      <div className="p-5 space-y-2">
        {places.map((place) => (
          <div key={place.label} className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-secondary">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <place.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{place.label}</p>
              <p className="text-xs text-muted-foreground">{place.address}</p>
            </div>
          </div>
        ))}

        <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-dashed border-border text-sm text-muted-foreground">
          <Plus className="w-5 h-5" />
          Add new place
        </button>
      </div>
    </div>
  );
}
