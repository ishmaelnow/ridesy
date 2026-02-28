import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RideProvider } from "@/contexts/RideContext";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import RideHistory from "./pages/RideHistory";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import SavedPlaces from "./pages/SavedPlaces";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RideProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/rides" element={<RideHistory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/saved-places" element={<SavedPlaces />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RideProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
