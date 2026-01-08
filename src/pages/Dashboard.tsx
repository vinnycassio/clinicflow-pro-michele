import { Users, Calendar, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { NextAppointments } from "@/components/dashboard/NextAppointments";
import { Reminders } from "@/components/dashboard/Reminders";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function getFormattedDate() {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default function Dashboard() {
  const greeting = getGreeting();
  const formattedDate = getFormattedDate();

  return (
    <AppLayout>
      <PageHeader
        title={`${greeting}, Dr. Rafael! 👋`}
        subtitle={formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
      />

      <div className="px-6 lg:px-8 py-6">
        {/* KPI Cards */}
        <section className="mb-8">
          <h2 className="text-heading-4 text-foreground mb-4">Visão de Hoje</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total de Pacientes"
              value="127"
              subtitle="+12% este mês"
              icon={Users}
              iconColor="primary"
              trend={{ value: "12%", positive: true }}
              delay={0}
            />
            <KPICard
              title="Agendados Hoje"
              value="18"
              subtitle="+3 que ontem"
              icon={Calendar}
              iconColor="secondary"
              trend={{ value: "3", positive: true }}
              delay={100}
            />
            <KPICard
              title="Atendidos Hoje"
              value="8"
              subtitle="80% da meta"
              icon={CheckCircle}
              iconColor="success"
              delay={200}
            />
            <KPICard
              title="Aguardando"
              value="3"
              subtitle="15min tempo médio"
              icon={Clock}
              iconColor="warning"
              delay={300}
            />
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Next Appointments - Takes 2 columns */}
          <div className="lg:col-span-2">
            <NextAppointments />
          </div>

          {/* Reminders - Takes 1 column */}
          <div>
            <Reminders />
          </div>
        </div>

        {/* Revenue Preview */}
        <section className="mt-8">
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-display-2 text-foreground">
                  Receita do Mês
                </h3>
                <p className="text-caption text-muted-foreground mt-1">
                  Janeiro 2025
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                +18% vs mês anterior
              </div>
            </div>

            <div className="flex items-end gap-8">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-4xl font-bold text-foreground mt-1">
                  R$ 47.580
                  <span className="text-lg font-normal text-muted-foreground">,00</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Meta</p>
                <p className="text-xl font-semibold text-foreground mt-1">
                  R$ 60.000,00
                </p>
              </div>
              <div className="flex-1 max-w-xs">
                <p className="text-sm text-muted-foreground mb-2">Progresso</p>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
                    style={{ width: "79%" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">79% da meta</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
