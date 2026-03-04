import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DriverProvider } from "@/contexts/DriverContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleSelect from "./pages/RoleSelect";
import Auth from "./pages/Auth";
import DriverChat from "./pages/driver/DriverChat";
import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverEarnings from "./pages/driver/DriverEarnings";
import DriverHistory from "./pages/driver/DriverHistory";
import DriverRatings from "./pages/driver/DriverRatings";
import DriverSettings from "./pages/driver/DriverSettings";
import DriverApplication from "./pages/driver/DriverApplication";
import ApplicationStatus from "./pages/driver/ApplicationStatus";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function DriverRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute redirectTo="/auth?role=driver">
      <DriverProvider>
        <div className="theme-driver contents">{children}</div>
      </DriverProvider>
    </ProtectedRoute>
  );
}

const AppDriver = () => (
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

            {/* Driver */}
            <Route path="/driver"                    element={<DriverRoute><DriverDashboard /></DriverRoute>} />
            <Route path="/driver/earnings"           element={<DriverRoute><DriverEarnings /></DriverRoute>} />
            <Route path="/driver/history"            element={<DriverRoute><DriverHistory /></DriverRoute>}  />
            <Route path="/driver/ratings"            element={<DriverRoute><DriverRatings /></DriverRoute>}  />
            <Route path="/driver/settings"           element={<DriverRoute><DriverSettings /></DriverRoute>} />
            <Route path="/driver/chat"               element={<DriverRoute><DriverChat /></DriverRoute>}     />
            <Route path="/driver/apply"              element={<ProtectedRoute redirectTo="/auth?role=driver"><DriverApplication /></ProtectedRoute>} />
            <Route path="/driver/application-status" element={<ProtectedRoute redirectTo="/auth?role=driver"><ApplicationStatus /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default AppDriver;
