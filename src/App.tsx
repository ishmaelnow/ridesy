import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
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

// Single RideProvider wraps ALL rider routes so state (activeRideId, etc.)
// persists across navigation instead of being reset on every route change.
function RiderLayout() {
  return (
    <ProtectedRoute redirectTo="/auth?role=rider">
      <RideProvider>
        <Outlet />
      </RideProvider>
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

            {/* Rider — all share ONE RideProvider instance */}
            <Route element={<RiderLayout />}>
              <Route path="/rider"         element={<Index />}         />
              <Route path="/profile"       element={<Profile />}       />
              <Route path="/wallet"        element={<Wallet />}        />
              <Route path="/rides"         element={<RideHistory />}   />
              <Route path="/settings"      element={<Settings />}      />
              <Route path="/chat"          element={<Chat />}          />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/saved-places"  element={<SavedPlaces />}   />
              <Route path="/about"         element={<About />}         />
              <Route path="/support"       element={<Support />}       />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
