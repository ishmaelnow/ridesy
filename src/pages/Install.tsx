import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Share, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="safe-top px-4 pt-3 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Install RideApp</h1>
        </div>
      </div>

      <div className="p-6 flex flex-col items-center text-center gap-6 mt-8">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Smartphone className="w-10 h-10 text-primary" />
        </div>

        {isInstalled ? (
          <>
            <h2 className="text-xl font-bold text-foreground">Already Installed!</h2>
            <p className="text-sm text-muted-foreground">RideApp is on your home screen. Open it from there for the best experience.</p>
          </>
        ) : isIOS ? (
          <>
            <h2 className="text-xl font-bold text-foreground">Install on iPhone</h2>
            <div className="space-y-4 text-left w-full max-w-sm">
              {[
                { step: "1", text: "Tap the Share button", icon: Share },
                { step: "2", text: "Scroll down and tap \"Add to Home Screen\"", icon: Download },
                { step: "3", text: "Tap \"Add\" to confirm", icon: Smartphone },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-4 p-4 bg-secondary/40 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {s.step}
                  </div>
                  <p className="text-sm text-foreground flex-1">{s.text}</p>
                  <s.icon className="w-5 h-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </>
        ) : deferredPrompt ? (
          <>
            <h2 className="text-xl font-bold text-foreground">Install RideApp</h2>
            <p className="text-sm text-muted-foreground">Add RideApp to your home screen for quick access and an app-like experience.</p>
            <button
              onClick={handleInstall}
              className="w-full max-w-sm py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Download className="w-4 h-4" />
              Install App
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-foreground">Install RideApp</h2>
            <p className="text-sm text-muted-foreground">
              Open this page in Chrome or Safari on your phone, then use your browser's menu to "Add to Home Screen."
            </p>
          </>
        )}
      </div>
    </div>
  );
}
