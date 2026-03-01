import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RideProvider } from "@/contexts/RideContext";
import { DriverProvider } from "@/contexts/DriverContext";
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
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RideProvider>
          <DriverProvider>
            <Routes>
              {/* Rider routes */}
              <Route path="/" element={<Index />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/rides" element={<RideHistory />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/saved-places" element={<SavedPlaces />} />
              {/* Driver routes */}
              <Route path="/driver" element={<DriverDashboard />} />
              <Route path="/driver/earnings" element={<DriverEarnings />} />
              <Route path="/driver/history" element={<DriverHistory />} />
              <Route path="/driver/ratings" element={<DriverRatings />} />
              <Route path="/driver/settings" element={<DriverSettings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DriverProvider>
        </RideProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
