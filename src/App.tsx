import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TenantProvider } from "./contexts/TenantContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Professionals from "./pages/Professionals";
import Appointments from "./pages/Appointments";
import MedicalRecords from "./pages/MedicalRecords";
import Treatments from "./pages/Treatments";
import Financial from "./pages/Financial";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  console.log("🚀 VLTRA Clinic iniciando...");

  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Protected routes */}
                <Route element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/pacientes" element={<Patients />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/profissionais" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <Professionals />
                    </ProtectedRoute>
                  } />
                  <Route path="/professionals" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <Professionals />
                    </ProtectedRoute>
                  } />
                  <Route path="/agenda" element={<Appointments />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/prontuarios" element={
                    <ProtectedRoute requiredRoles={['admin',  'owner', 'professional']}>
                      <MedicalRecords />
                    </ProtectedRoute>
                  } />
                  <Route path="/medical-records" element={
                    <ProtectedRoute requiredRoles={['admin', 'owner', 'professional']}>
                      <MedicalRecords />
                    </ProtectedRoute>
                  } />
                  <Route path="/tratamentos" element={<Treatments />} />
                  <Route path="/treatments" element={<Treatments />} />
                  <Route path="/financeiro" element={<Financial />} />
                  <Route path="/financial" element={<Financial />} />
                  <Route path="/configuracoes" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </TenantProvider>
    </QueryClientProvider>
  );
};

export default App;
