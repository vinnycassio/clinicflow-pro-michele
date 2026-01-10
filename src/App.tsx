import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import NotFound from "./pages/NotFound";

// Importar outras páginas quando existirem
// import Appointments from "./pages/Appointments";
// import Professionals from "./pages/Professionals";
// import PatientProfile from "./pages/PatientProfile";

const queryClient = new QueryClient();

const App = () => (
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
            {/* Descomentar quando criar as páginas */}
            {/* <Route path="/agenda" element={<Appointments />} /> */}
            {/* <Route path="/profissionais" element={<Professionals />} /> */}
            {/* <Route path="/professionals" element={<Professionals />} /> */}
            {/* <Route path="/pacientes/:id" element={<PatientProfile />} /> */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
