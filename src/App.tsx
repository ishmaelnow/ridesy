import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RideProvider } from "@/contexts/RideContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleSelect from "./pages/RoleSelect";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import RideHistory from "./pages/RideHistory";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import SavedPlaces from "./pages/SavedPlaces";
import About from "./pages/About";
import Support from "./pages/Support";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RiderRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute redirectTo="/auth?role=rider">
      <RideProvider>{children}</RideProvider>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/"        element={<RoleSelect />} />
            <Route path="/auth"    element={<Auth />}       />
            <Route path="/install" element={<Install />}    />

            {/* Rider */}
            <Route path="/rider"         element={<RiderRoute><Index />        </RiderRoute>} />
            <Route path="/profile"       element={<RiderRoute><Profile />      </RiderRoute>} />
            <Route path="/wallet"        element={<RiderRoute><Wallet />       </RiderRoute>} />
            <Route path="/rides"         element={<RiderRoute><RideHistory />  </RiderRoute>} />
            <Route path="/settings"      element={<RiderRoute><Settings />     </RiderRoute>} />
            <Route path="/chat"          element={<RiderRoute><Chat />         </RiderRoute>} />
            <Route path="/notifications" element={<RiderRoute><Notifications /></RiderRoute>} />
            <Route path="/saved-places"  element={<RiderRoute><SavedPlaces />  </RiderRoute>} />
            <Route path="/about"         element={<RiderRoute><About />        </RiderRoute>} />
            <Route path="/support"       element={<RiderRoute><Support />      </RiderRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
