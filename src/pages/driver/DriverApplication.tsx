import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  User,
  FileText,
  Car,
  Shield,
  CheckCircle2,
  Upload,
  Camera,
} from "lucide-react";

type VehicleType = "standard" | "comfort" | "premium";

interface ApplicationData {
  fullName: string;
  phone: string;
  email: string;
  nationalId: string;
  idFrontUploaded: boolean;
  idBackUploaded: boolean;
  licenseNumber: string;
  licenseUploaded: boolean;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiry: string;
  insuranceUploaded: boolean;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehiclePlate: string;
  vehicleColor: string;
  vehicleType: VehicleType;
  vehiclePhotoUploaded: boolean;
}

const STEPS = [
  { icon: User, label: "Personal Info" },
  { icon: FileText, label: "Documents" },
  { icon: Shield, label: "Insurance" },
  { icon: Car, label: "Vehicle" },
  { icon: CheckCircle2, label: "Review" },
];

const vehicleTypes: { value: VehicleType; label: string; desc: string; icon: string }[] = [
  { value: "standard", label: "Standard", desc: "Sedan or hatchback, 4+ seats", icon: "🚗" },
  { value: "comfort", label: "Comfort", desc: "Spacious sedan, leather seats", icon: "🚙" },
  { value: "premium", label: "Premium", desc: "Luxury vehicle, top-tier experience", icon: "🏎️" },
];

export default function DriverApplication() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ApplicationData>({
    fullName: "",
    phone: "",
    email: "",
    nationalId: "",
    idFrontUploaded: false,
    idBackUploaded: false,
    licenseNumber: "",
    licenseUploaded: false,
    insuranceProvider: "",
    insurancePolicyNumber: "",
    insuranceExpiry: "",
    insuranceUploaded: false,
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    vehiclePlate: "",
    vehicleColor: "",
    vehicleType: "standard",
    vehiclePhotoUploaded: false,
  });

  const update = (fields: Partial<ApplicationData>) => setData((prev) => ({ ...prev, ...fields }));

  const canProceed = () => {
    switch (step) {
      case 0: return data.fullName && data.phone && data.email && data.nationalId;
      case 1: return data.licenseNumber && data.idFrontUploaded;
      case 2: return data.insuranceProvider && data.insurancePolicyNumber && data.insuranceExpiry;
      case 3: return data.vehicleMake && data.vehicleModel && data.vehicleYear && data.vehiclePlate && data.vehicleType;
      default: return true;
    }
  };

  const handleSubmit = () => {
    // In production, this would POST to backend
    navigate("/driver");
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors";

  const uploadBtnClass = (uploaded: boolean) =>
    `flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed transition-colors text-sm ${
      uploaded
        ? "border-primary bg-primary/5 text-primary"
        : "border-border text-muted-foreground hover:border-primary/40"
    }`;

  return (
    <div className="min-h-[100dvh] bg-background theme-driver">
      {/* Header */}
      <div className="safe-top px-4 pt-3 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (step > 0 ? setStep(step - 1) : navigate("/"))}
            className="p-2 -ml-2"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">Driver Application</h1>
            <p className="text-xs text-muted-foreground">
              Step {step + 1} of {STEPS.length} — {STEPS[step].label}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mt-3">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 0: Personal Info */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">Personal Information</p>
                    <p className="text-xs text-muted-foreground">Tell us about yourself</p>
                  </div>
                </div>
                <input className={inputClass} placeholder="Full Name" value={data.fullName} onChange={(e) => update({ fullName: e.target.value })} />
                <input className={inputClass} placeholder="Phone Number" type="tel" value={data.phone} onChange={(e) => update({ phone: e.target.value })} />
                <input className={inputClass} placeholder="Email Address" type="email" value={data.email} onChange={(e) => update({ email: e.target.value })} />
                <input className={inputClass} placeholder="National ID Number" value={data.nationalId} onChange={(e) => update({ nationalId: e.target.value })} />
              </div>
            )}

            {/* Step 1: Documents */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">Documents</p>
                    <p className="text-xs text-muted-foreground">Upload your ID & license</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">National ID</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={uploadBtnClass(data.idFrontUploaded)}>
                      <Camera className="w-4 h-4" />
                      {data.idFrontUploaded ? "Front ✓" : "Front Side"}
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={() => update({ idFrontUploaded: true })} />
                    </label>
                    <label className={uploadBtnClass(data.idBackUploaded)}>
                      <Camera className="w-4 h-4" />
                      {data.idBackUploaded ? "Back ✓" : "Back Side"}
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={() => update({ idBackUploaded: true })} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Driver's License</label>
                  <input className={inputClass} placeholder="License Number" value={data.licenseNumber} onChange={(e) => update({ licenseNumber: e.target.value })} />
                  <label className={`${uploadBtnClass(data.licenseUploaded)} mt-3 w-full justify-center cursor-pointer`}>
                    <Camera className="w-4 h-4" />
                    {data.licenseUploaded ? "License Uploaded ✓" : "Take License Photo"}
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={() => update({ licenseUploaded: true })} />
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Insurance */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">Insurance</p>
                    <p className="text-xs text-muted-foreground">Vehicle insurance details</p>
                  </div>
                </div>
                <input className={inputClass} placeholder="Insurance Provider" value={data.insuranceProvider} onChange={(e) => update({ insuranceProvider: e.target.value })} />
                <input className={inputClass} placeholder="Policy Number" value={data.insurancePolicyNumber} onChange={(e) => update({ insurancePolicyNumber: e.target.value })} />
                <input className={inputClass} placeholder="Expiry Date" type="date" value={data.insuranceExpiry} onChange={(e) => update({ insuranceExpiry: e.target.value })} />
                <label className={`${uploadBtnClass(data.insuranceUploaded)} w-full justify-center cursor-pointer`}>
                  <Camera className="w-4 h-4" />
                  {data.insuranceUploaded ? "Insurance Doc Uploaded ✓" : "Capture Insurance Document"}
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={() => update({ insuranceUploaded: true })} />
                </label>
              </div>
            )}

            {/* Step 3: Vehicle */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">Vehicle Details</p>
                    <p className="text-xs text-muted-foreground">Tell us about your vehicle</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input className={inputClass} placeholder="Make (e.g. Toyota)" value={data.vehicleMake} onChange={(e) => update({ vehicleMake: e.target.value })} />
                  <input className={inputClass} placeholder="Model (e.g. Camry)" value={data.vehicleModel} onChange={(e) => update({ vehicleModel: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputClass} placeholder="Year" type="number" value={data.vehicleYear} onChange={(e) => update({ vehicleYear: e.target.value })} />
                  <input className={inputClass} placeholder="Color" value={data.vehicleColor} onChange={(e) => update({ vehicleColor: e.target.value })} />
                </div>
                <input className={inputClass} placeholder="License Plate Number" value={data.vehiclePlate} onChange={(e) => update({ vehiclePlate: e.target.value })} />

                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Vehicle Category</label>
                  <div className="space-y-2">
                    {vehicleTypes.map((vt) => (
                      <button
                        key={vt.value}
                        onClick={() => update({ vehicleType: vt.value })}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          data.vehicleType === vt.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <span className="text-2xl">{vt.icon}</span>
                        <div className="text-left flex-1">
                          <p className={`text-sm font-semibold ${data.vehicleType === vt.value ? "text-primary" : "text-foreground"}`}>
                            {vt.label}
                          </p>
                          <p className="text-xs text-muted-foreground">{vt.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          data.vehicleType === vt.value ? "border-primary" : "border-border"
                        }`}>
                          {data.vehicleType === vt.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <label className={`${uploadBtnClass(data.vehiclePhotoUploaded)} w-full justify-center cursor-pointer`}>
                  <Camera className="w-4 h-4" />
                  {data.vehiclePhotoUploaded ? "Vehicle Photo Uploaded ✓" : "Take Vehicle Photo"}
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={() => update({ vehiclePhotoUploaded: true })} />
                </label>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">Review Application</p>
                    <p className="text-xs text-muted-foreground">Confirm your details</p>
                  </div>
                </div>

                {[
                  { title: "Personal", items: [data.fullName, data.phone, data.email, `ID: ${data.nationalId}`] },
                  { title: "License", items: [`#${data.licenseNumber}`, data.idFrontUploaded ? "ID uploaded ✓" : "ID missing", data.licenseUploaded ? "License uploaded ✓" : "License missing"] },
                  { title: "Insurance", items: [data.insuranceProvider, `Policy: ${data.insurancePolicyNumber}`, `Expires: ${data.insuranceExpiry}`] },
                  { title: "Vehicle", items: [`${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}`, `Plate: ${data.vehiclePlate}`, `Category: ${data.vehicleType.charAt(0).toUpperCase() + data.vehicleType.slice(1)}`, `Color: ${data.vehicleColor}`] },
                ].map((section) => (
                  <div key={section.title} className="bg-secondary/40 rounded-xl p-4">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">{section.title}</p>
                    {section.items.map((item, i) => (
                      <p key={i} className="text-sm text-foreground">{item}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-background/80 backdrop-blur-md border-t border-border safe-bottom">
        <button
          onClick={() => (step < STEPS.length - 1 ? setStep(step + 1) : handleSubmit())}
          disabled={!canProceed()}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          {step < STEPS.length - 1 ? (
            <>
              Continue <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            "Submit Application"
          )}
        </button>
      </div>
    </div>
  );
}
