import { useEffect, useState, useCallback } from "react";
import { Users, Calendar, CheckCircle2, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePatients } from "@/hooks/usePatients";
import { useAppointments } from "@/hooks/useAppointments";
import { useFinancial } from "@/hooks/useFinancial";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { AgendaTab } from "@/components/dashboard/AgendaTab";
import { PatientsTab } from "@/components/dashboard/PatientsTab";
import { FinancialTab } from "@/components/dashboard/FinancialTab";

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [activeTab, setActiveTab] = useState("overview");

  const { patients, loading: patientsLoading, fetchPatients } = usePatients();
  const { appointments, loading: appointmentsLoading, fetchAppointments } = useAppointments();
  const { budgets, sales, payments, loading: financialLoading, fetchBudgets, fetchSales, fetchPayments } = useFinancial();

  const loading = patientsLoading || appointmentsLoading || financialLoading;

  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchPatients(), fetchAppointments(), fetchBudgets(), fetchSales(), fetchPayments()]);
  }, [fetchPatients, fetchAppointments, fetchBudgets, fetchSales, fetchPayments]);

  // Calculate quick stats
  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter(a => a.appointment_date === today);
  const completedToday = todayAppointments.filter(a => a.status === "completed").length;
  const monthlyRevenue = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);

  const overviewStats = [
    {
      title: "Total de Pacientes",
      value: patients.length,
      subtitle: "pacientes ativos",
      icon: Users,
      color: "primary" as const,
    },
    {
      title: "Agendados Hoje",
      value: todayAppointments.length,
      subtitle: `${completedToday} concluídos`,
      icon: Calendar,
      color: "secondary" as const,
    },
    {
      title: "Atendidos Hoje",
      value: completedToday,
      subtitle: "consultas realizadas",
      icon: CheckCircle2,
      color: "success" as const,
    },
    {
      title: "Receita do Mês",
      value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(monthlyRevenue),
      subtitle: `${sales.length} vendas`,
      icon: DollarSign,
      color: "warning" as const,
    },
  ];

  if (loading && patients.length === 0) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-16 bg-muted rounded-xl w-1/3" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
          <div className="h-96 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <DashboardHeader
        onRefresh={handleRefresh}
        isLoading={loading}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />

      {/* Quick Stats */}
      <StatsGrid stats={overviewStats} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-background">
            <Calendar className="h-4 w-4" />
            Agenda
          </TabsTrigger>
          <TabsTrigger value="patients" className="gap-2 data-[state=active]:bg-background">
            <Users className="h-4 w-4" />
            Pacientes
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-2 data-[state=active]:bg-background">
            <DollarSign className="h-4 w-4" />
            Financeiro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <AgendaTab appointments={appointments} loading={appointmentsLoading} />
        </TabsContent>

        <TabsContent value="patients" className="mt-6">
          <PatientsTab patients={patients} appointments={appointments} loading={patientsLoading} />
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          <FinancialTab budgets={budgets} sales={sales} payments={payments} loading={financialLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
