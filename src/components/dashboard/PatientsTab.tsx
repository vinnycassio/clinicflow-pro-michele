import { useMemo, useState } from "react";
import { format, parseISO, subDays, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Users,
  UserPlus,
  UserCheck,
  Clock,
  TrendingUp,
  Search,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Patient } from "@/types/database";
import type { AppointmentWithDetails } from "@/types/database";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

interface PatientsTabProps {
  patients: Patient[];
  appointments: AppointmentWithDetails[];
  loading: boolean;
}

export const PatientsTab = ({ patients, appointments, loading }: PatientsTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    const sixtyDaysAgo = subDays(today, 60);

    // New patients in last 30 days
    const newPatients = patients.filter(p => {
      if (!p.created_at) return false;
      return parseISO(p.created_at) >= thirtyDaysAgo;
    });

    // New patients 30-60 days ago for comparison
    const previousNewPatients = patients.filter(p => {
      if (!p.created_at) return false;
      const created = parseISO(p.created_at);
      return created >= sixtyDaysAgo && created < thirtyDaysAgo;
    });

    // Patients with appointments in last 30 days
    const activePatientIds = new Set(
      appointments
        .filter(a => parseISO(a.appointment_date) >= thirtyDaysAgo)
        .map(a => a.patient_id)
    );

    // Calculate growth percentage
    const growth = previousNewPatients.length > 0 
      ? ((newPatients.length - previousNewPatients.length) / previousNewPatients.length) * 100 
      : newPatients.length > 0 ? 100 : 0;

    return {
      total: patients.length,
      newThisMonth: newPatients.length,
      activeThisMonth: activePatientIds.size,
      growth: Math.round(growth),
    };
  }, [patients, appointments]);

  // Gender distribution
  const genderData = useMemo(() => {
    const counts: { [key: string]: number } = { Feminino: 0, Masculino: 0, Outro: 0 };
    patients.forEach(p => {
      if (p.gender === "feminino" || p.gender === "F") counts.Feminino++;
      else if (p.gender === "masculino" || p.gender === "M") counts.Masculino++;
      else counts.Outro++;
    });
    return Object.entries(counts)
      .filter(([_, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [patients]);

  // Age distribution
  const ageData = useMemo(() => {
    const ranges = [
      { label: "0-18", min: 0, max: 18, count: 0 },
      { label: "19-30", min: 19, max: 30, count: 0 },
      { label: "31-45", min: 31, max: 45, count: 0 },
      { label: "46-60", min: 46, max: 60, count: 0 },
      { label: "60+", min: 61, max: 150, count: 0 },
    ];

    const today = new Date();
    patients.forEach(p => {
      if (!p.birth_date) return;
      const birthDate = parseISO(p.birth_date);
      const age = Math.floor(differenceInDays(today, birthDate) / 365);
      const range = ranges.find(r => age >= r.min && age <= r.max);
      if (range) range.count++;
    });

    return ranges.map(r => ({ age: r.label, count: r.count }));
  }, [patients]);

  // New patients over time (last 6 months)
  const newPatientsOverTime = useMemo(() => {
    const months: { [key: string]: number } = {};
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = subDays(today, i * 30);
      const key = format(date, "MMM", { locale: ptBR });
      months[key] = 0;
    }

    patients.forEach(p => {
      if (!p.created_at) return;
      const created = parseISO(p.created_at);
      const monthsDiff = Math.floor(differenceInDays(today, created) / 30);
      if (monthsDiff >= 0 && monthsDiff < 6) {
        const key = format(subDays(today, monthsDiff * 30), "MMM", { locale: ptBR });
        if (months[key] !== undefined) months[key]++;
      }
    });

    return Object.entries(months).map(([month, count]) => ({ month, count }));
  }, [patients]);

  // Source distribution
  const sourceData = useMemo(() => {
    const sources: { [key: string]: number } = {};
    patients.forEach(p => {
      const source = p.source || "Não informado";
      sources[source] = (sources[source] || 0) + 1;
    });
    return Object.entries(sources)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [patients]);

  // Recent patients
  const recentPatients = useMemo(() => {
    return [...patients]
      .filter(p => p.created_at)
      .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
      .slice(0, 8);
  }, [patients]);

  // Filter patients
  const filteredPatients = useMemo(() => {
    if (!searchTerm) return recentPatients;
    const term = searchTerm.toLowerCase();
    return patients
      .filter(p => 
        p.full_name.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term) ||
        p.phone_main?.includes(term)
      )
      .slice(0, 8);
  }, [patients, searchTerm, recentPatients]);

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--success))",
    "hsl(var(--warning))",
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Total de Pacientes", 
            value: stats.total, 
            icon: Users, 
            color: "text-primary",
            bg: "bg-primary/10"
          },
          { 
            label: "Novos (30 dias)", 
            value: stats.newThisMonth, 
            icon: UserPlus, 
            color: "text-success",
            bg: "bg-success/10",
            change: stats.growth 
          },
          { 
            label: "Ativos (30 dias)", 
            value: stats.activeThisMonth, 
            icon: UserCheck, 
            color: "text-secondary",
            bg: "bg-secondary/10"
          },
          { 
            label: "Taxa de Retorno", 
            value: `${stats.total > 0 ? Math.round((stats.activeThisMonth / stats.total) * 100) : 0}%`, 
            icon: TrendingUp, 
            color: "text-warning",
            bg: "bg-warning/10"
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={cn("p-2 rounded-lg", stat.bg)}>
                    <Icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                  {stat.change !== undefined && (
                    <span className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      stat.change >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {stat.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {Math.abs(stat.change)}%
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Patients Over Time */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Evolução de Novos Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={newPatientsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
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
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    name="Novos Pacientes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Distribuição por Gênero
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {genderData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {genderData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: COLORS[i % COLORS.length] }} 
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Age Distribution */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Distribuição por Idade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis 
                    dataKey="age" 
                    type="category" 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                    width={40}
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
                    fill="hsl(var(--secondary))" 
                    radius={[0, 4, 4, 0]}
                    name="Pacientes"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Pacientes Recentes
              </CardTitle>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[220px]">
              <div className="space-y-2">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.patient_id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={patient.photo_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {patient.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{patient.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {patient.phone_main || patient.email || "Sem contato"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        {patient.created_at 
                          ? format(parseISO(patient.created_at), "dd/MM/yy")
                          : "—"
                        }
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
