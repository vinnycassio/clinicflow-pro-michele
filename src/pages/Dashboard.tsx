import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    completedToday: 0,
    waiting: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Total de pacientes
      const { count: patientsCount } = await supabase
        .from("vl_clinic_core_patients")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Agendamentos de hoje
      const today = new Date().toISOString().split("T")[0];
      const { count: todayCount } = await supabase
        .from("vl_clinic_core_appointments")
        .select("*", { count: "exact", head: true })
        .eq("appointment_date", today);

      // Atendidos hoje
      const { count: completedCount } = await supabase
        .from("vl_clinic_core_appointments")
        .select("*", { count: "exact", head: true })
        .eq("appointment_date", today)
        .eq("status", "completed");

      // Aguardando
      const { count: waitingCount } = await supabase
        .from("vl_clinic_core_appointments")
        .select("*", { count: "exact", head: true })
        .eq("appointment_date", today)
        .in("status", ["scheduled", "confirmed"]);

      setStats({
        totalPatients: patientsCount || 0,
        todayAppointments: todayCount || 0,
        completedToday: completedCount || 0,
        waiting: waitingCount || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total de Pacientes",
      value: stats.totalPatients,
      icon: Users,
      description: "+12% este mês",
      trend: "12%",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Agendados Hoje",
      value: stats.todayAppointments,
      icon: Calendar,
      description: "+3 que ontem",
      trend: "+3",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Atendidos Hoje",
      value: stats.completedToday,
      icon: CheckCircle2,
      description: "80% da meta",
      trend: "80%",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Aguardando",
      value: stats.waiting,
      icon: Clock,
      description: "15min tempo médio",
      trend: "15min",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bom dia, Dr. Rafael! 👋
        </h1>
        <p className="text-gray-500">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Stats Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Visão de Hoje</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                    <Icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                    <span className={cn("font-semibold", stat.color)}>
                      {stat.trend}
                    </span>
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Próximos Atendimentos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Próximos Atendimentos
          </h2>
          
            href="/agenda"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            Ver agenda completa
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-gray-500">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-medium">Nenhum agendamento para hoje</p>
              <p className="text-sm mt-1">
                Sua agenda está livre no momento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
