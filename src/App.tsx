import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RideProvider } from "@/contexts/RideContext";
import { DriverProvider } from "@/contexts/DriverContext";
import RoleSelect from "./pages/RoleSelect";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import RideHistory from "./pages/RideHistory";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import SavedPlaces from "./pages/SavedPlaces";
import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverEarnings from "./pages/driver/DriverEarnings";
import DriverHistory from "./pages/driver/DriverHistory";
import DriverRatings from "./pages/driver/DriverRatings";
import DriverSettings from "./pages/driver/DriverSettings";
import DriverApplication from "./pages/driver/DriverApplication";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Role selection */}
          <Route path="/" element={<RoleSelect />} />

          {/* Rider routes — wrapped in RideProvider, blue theme */}
          <Route
            path="/rider"
            element={
              <RideProvider>
                <Index />
              </RideProvider>
            }
          />
          <Route path="/profile" element={<RideProvider><Profile /></RideProvider>} />
          <Route path="/wallet" element={<RideProvider><Wallet /></RideProvider>} />
          <Route path="/rides" element={<RideProvider><RideHistory /></RideProvider>} />
          <Route path="/settings" element={<RideProvider><Settings /></RideProvider>} />
          <Route path="/chat" element={<RideProvider><Chat /></RideProvider>} />
          <Route path="/notifications" element={<RideProvider><Notifications /></RideProvider>} />
          <Route path="/saved-places" element={<RideProvider><SavedPlaces /></RideProvider>} />

          {/* Driver routes — wrapped in DriverProvider, green theme */}
          <Route
            path="/driver"
            element={
              <DriverProvider>
                <div className="theme-driver contents">
                  <DriverDashboard />
                </div>
              </DriverProvider>
            }
          />
          <Route path="/driver/earnings" element={<DriverProvider><div className="theme-driver contents"><DriverEarnings /></div></DriverProvider>} />
          <Route path="/driver/history" element={<DriverProvider><div className="theme-driver contents"><DriverHistory /></div></DriverProvider>} />
          <Route path="/driver/ratings" element={<DriverProvider><div className="theme-driver contents"><DriverRatings /></div></DriverProvider>} />
          <Route path="/driver/settings" element={<DriverProvider><div className="theme-driver contents"><DriverSettings /></div></DriverProvider>} />
          <Route path="/driver/apply" element={<DriverApplication />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
