import { useState, useMemo } from "react";
import { format, parseISO, isToday, isTomorrow, addDays, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar, 
  Clock, 
  User, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  CalendarDays
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AppointmentWithDetails } from "@/types/database";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface AgendaTabProps {
  appointments: AppointmentWithDetails[];
  loading: boolean;
}

const statusConfig = {
  scheduled: { label: "Agendado", color: "bg-primary/10 text-primary border-primary/20", icon: Calendar },
  confirmed: { label: "Confirmado", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  completed: { label: "Concluído", color: "bg-muted text-muted-foreground border-muted", icon: CheckCircle2 },
  cancelled: { label: "Cancelado", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  no_show: { label: "Não Compareceu", color: "bg-warning/10 text-warning border-warning/20", icon: AlertCircle },
};

export const AgendaTab = ({ appointments, loading }: AgendaTabProps) => {
  const [viewMode, setViewMode] = useState<"today" | "week">("today");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  // Appointments for today
  const todayAppointments = useMemo(() => 
    appointments.filter(apt => apt.appointment_date === todayStr),
    [appointments, todayStr]
  );

  // Appointments for the week
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 });

  const weekAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const aptDate = parseISO(apt.appointment_date);
      return aptDate >= weekStart && aptDate <= weekEnd;
    });
  }, [appointments, weekStart, weekEnd]);

  // Stats
  const stats = useMemo(() => {
    const source = viewMode === "today" ? todayAppointments : weekAppointments;
    return {
      total: source.length,
      confirmed: source.filter(a => a.status === "confirmed").length,
      completed: source.filter(a => a.status === "completed").length,
      pending: source.filter(a => a.status === "scheduled").length,
      cancelled: source.filter(a => a.status === "cancelled").length,
    };
  }, [viewMode, todayAppointments, weekAppointments]);

  // Chart data - appointments by hour
  const hourlyData = useMemo(() => {
    const hours: { [key: string]: number } = {};
    for (let i = 8; i <= 20; i++) {
      hours[`${i}h`] = 0;
    }
    
    todayAppointments.forEach(apt => {
      const hour = parseInt(apt.appointment_start_time.split(":")[0]);
      const key = `${hour}h`;
      if (hours[key] !== undefined) {
        hours[key]++;
      }
    });

    return Object.entries(hours).map(([hour, count]) => ({ hour, count }));
  }, [todayAppointments]);

  // Week distribution chart
  const weeklyData = useMemo(() => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const data = days.map((day, index) => {
      const targetDate = addDays(weekStart, index);
      const dateStr = format(targetDate, "yyyy-MM-dd");
      const count = appointments.filter(a => a.appointment_date === dateStr).length;
      return { day, count, isToday: format(today, "yyyy-MM-dd") === dateStr };
    });
    return data;
  }, [appointments, weekStart, today]);

  // Filter appointments
  const displayedAppointments = useMemo(() => {
    let source = viewMode === "today" ? todayAppointments : weekAppointments;
    if (statusFilter !== "all") {
      source = source.filter(a => a.status === statusFilter);
    }
    return source.sort((a, b) => {
      if (a.appointment_date !== b.appointment_date) {
        return a.appointment_date.localeCompare(b.appointment_date);
      }
      return a.appointment_start_time.localeCompare(b.appointment_start_time);
    });
  }, [viewMode, todayAppointments, weekAppointments, statusFilter]);

  // Group by date for week view
  const groupedByDate = useMemo(() => {
    if (viewMode === "today") return null;
    const groups: { [key: string]: AppointmentWithDetails[] } = {};
    displayedAppointments.forEach(apt => {
      if (!groups[apt.appointment_date]) {
        groups[apt.appointment_date] = [];
      }
      groups[apt.appointment_date].push(apt);
    });
    return groups;
  }, [displayedAppointments, viewMode]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Confirmados", value: stats.confirmed, color: "text-success" },
          { label: "Concluídos", value: stats.completed, color: "text-muted-foreground" },
          { label: "Pendentes", value: stats.pending, color: "text-primary" },
          { label: "Cancelados", value: stats.cancelled, color: "text-destructive" },
        ].map((stat, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "today" | "week")}>
          <TabsList>
            <TabsTrigger value="today" className="gap-2">
              <Calendar className="h-4 w-4" />
              Hoje
            </TabsTrigger>
            <TabsTrigger value="week" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Semana
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="scheduled">Agendados</SelectItem>
            <SelectItem value="confirmed">Confirmados</SelectItem>
            <SelectItem value="completed">Concluídos</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments List */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {viewMode === "today" ? "Agenda de Hoje" : "Agenda da Semana"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {displayedAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mb-3 opacity-30" />
                  <p className="font-medium">Nenhum agendamento</p>
                  <p className="text-sm">A agenda está livre para o período selecionado</p>
                </div>
              ) : viewMode === "today" ? (
                <div className="space-y-3">
                  {displayedAppointments.map((apt) => (
                    <AppointmentCard key={apt.appointment_id} appointment={apt} />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedByDate && Object.entries(groupedByDate).map(([date, apts]) => (
                    <div key={date}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          date === todayStr ? "bg-primary" : "bg-muted-foreground"
                        )} />
                        <h4 className="font-medium text-sm">
                          {format(parseISO(date), "EEEE, d 'de' MMMM", { locale: ptBR })}
                          {date === todayStr && (
                            <Badge variant="secondary" className="ml-2 text-xs">Hoje</Badge>
                          )}
                        </h4>
                      </div>
                      <div className="space-y-2 pl-4 border-l-2 border-border">
                        {apts.map((apt) => (
                          <AppointmentCard key={apt.appointment_id} appointment={apt} compact />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="space-y-6">
          {/* Hourly Distribution */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Distribuição por Horário (Hoje)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fontSize: 10 }} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorCount)" 
                      name="Atendimentos"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Distribution */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Distribuição Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 10 }} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      name="Atendimentos"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Appointment Card Component
const AppointmentCard = ({ 
  appointment, 
  compact = false 
}: { 
  appointment: AppointmentWithDetails; 
  compact?: boolean;
}) => {
  const status = statusConfig[appointment.status as keyof typeof statusConfig] || statusConfig.scheduled;
  const StatusIcon = status.icon;

  return (
    <div className={cn(
      "group flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:shadow-md transition-all cursor-pointer",
      compact && "p-3"
    )}>
      {/* Time */}
      <div className={cn(
        "text-center shrink-0",
        compact ? "w-14" : "w-16"
      )}>
        <p className={cn(
          "font-bold text-foreground",
          compact ? "text-base" : "text-lg"
        )}>
          {appointment.appointment_start_time.slice(0, 5)}
        </p>
        <p className="text-xs text-muted-foreground">
          {appointment.appointment_end_time.slice(0, 5)}
        </p>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-border" />

      {/* Patient Info */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium text-foreground truncate",
          compact ? "text-sm" : "text-base"
        )}>
          {appointment.patient?.full_name || "Paciente não identificado"}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span className="truncate">{appointment.professional?.short_name || appointment.professional?.full_name}</span>
          {appointment.service_type && (
            <>
              <span>•</span>
              <span className="truncate">{appointment.service_type}</span>
            </>
          )}
        </div>
      </div>

      {/* Status */}
      <Badge variant="outline" className={cn("shrink-0 gap-1", status.color)}>
        <StatusIcon className="h-3 w-3" />
        {!compact && status.label}
      </Badge>

      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
