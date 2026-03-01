import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RideProvider } from "@/contexts/RideContext";
import { DriverProvider } from "@/contexts/DriverContext";
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
import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverEarnings from "./pages/driver/DriverEarnings";
import DriverHistory from "./pages/driver/DriverHistory";
import DriverRatings from "./pages/driver/DriverRatings";
import DriverSettings from "./pages/driver/DriverSettings";
import DriverApplication from "./pages/driver/DriverApplication";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ApplicationStatus from "./pages/driver/ApplicationStatus";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<RoleSelect />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/install" element={<Install />} />

            {/* Rider routes */}
            <Route path="/rider" element={<ProtectedRoute redirectTo="/auth?role=rider"><RideProvider><Index /></RideProvider></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute redirectTo="/auth?role=rider"><RideProvider><Profile /></RideProvider></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute redirectTo="/auth?role=rider"><RideProvider><Wallet /></RideProvider></ProtectedRoute>} />
            <Route path="/rides" element={<ProtectedRoute redirectTo="/auth?role=rider"><RideProvider><RideHistory /></RideProvider></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute redirectTo="/auth?role=rider"><RideProvider><Settings /></RideProvider></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute redirectTo="/auth?role=rider"><RideProvider><Chat /></RideProvider></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute redirectTo="/auth?role=rider"><RideProvider><Notifications /></RideProvider></ProtectedRoute>} />
            <Route path="/saved-places" element={<ProtectedRoute redirectTo="/auth?role=rider"><RideProvider><SavedPlaces /></RideProvider></ProtectedRoute>} />

            {/* Driver routes */}
            <Route path="/driver" element={
              <ProtectedRoute redirectTo="/auth?role=driver">
                <DriverProvider><div className="theme-driver contents"><DriverDashboard /></div></DriverProvider>
              </ProtectedRoute>
            } />
            <Route path="/driver/earnings" element={<ProtectedRoute redirectTo="/auth?role=driver"><DriverProvider><div className="theme-driver contents"><DriverEarnings /></div></DriverProvider></ProtectedRoute>} />
            <Route path="/driver/history" element={<ProtectedRoute redirectTo="/auth?role=driver"><DriverProvider><div className="theme-driver contents"><DriverHistory /></div></DriverProvider></ProtectedRoute>} />
            <Route path="/driver/ratings" element={<ProtectedRoute redirectTo="/auth?role=driver"><DriverProvider><div className="theme-driver contents"><DriverRatings /></div></DriverProvider></ProtectedRoute>} />
            <Route path="/driver/settings" element={<ProtectedRoute redirectTo="/auth?role=driver"><DriverProvider><div className="theme-driver contents"><DriverSettings /></div></DriverProvider></ProtectedRoute>} />
            <Route path="/driver/apply" element={<ProtectedRoute redirectTo="/auth?role=driver"><DriverApplication /></ProtectedRoute>} />
            <Route path="/driver/application-status" element={<ProtectedRoute redirectTo="/auth?role=driver"><ApplicationStatus /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute redirectTo="/auth"><AdminDashboard /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
