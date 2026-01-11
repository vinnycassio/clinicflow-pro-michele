import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Professionals from "./pages/Professionals"; 
import Appointments from "./pages/Appointments";
import MedicalRecords from "./pages/MedicalRecords";
import Treatments from "./pages/Treatments";
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
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pacientes" element={<Patients />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/profissionais" element={<Professionals />} />
              <Route path="/professionals" element={<Professionals />} />
              <Route path="/agenda" element={<Appointments />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/prontuarios" element={<MedicalRecords />} />
              <Route path="/medical-records" element={<MedicalRecords />} />
              <Route path="/tratamentos" element={<Treatments />} />
              <Route path="/treatments" element={<Treatments />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
