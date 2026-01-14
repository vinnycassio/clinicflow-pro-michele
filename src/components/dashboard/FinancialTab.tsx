import { useMemo, useState } from "react";
import { format, parseISO, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Budget, Sale, Payment } from "@/hooks/useFinancial";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface FinancialTabProps {
  budgets: Budget[];
  sales: Sale[];
  payments: Payment[];
  loading: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const FinancialTab = ({ budgets, sales, payments, loading }: FinancialTabProps) => {
  const today = new Date();

  // Calculate main stats
  const stats = useMemo(() => {
    const thirtyDaysAgo = subDays(today, 30);
    const sixtyDaysAgo = subDays(today, 60);

    // Total sales this month
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    
    const thisMonthSales = sales.filter(s => {
      const saleDate = parseISO(s.sale_date || s.created_at || "");
      return saleDate >= monthStart && saleDate <= monthEnd;
    });

    const previousMonthStart = startOfMonth(subDays(monthStart, 1));
    const previousMonthEnd = endOfMonth(subDays(monthStart, 1));

    const lastMonthSales = sales.filter(s => {
      const saleDate = parseISO(s.sale_date || s.created_at || "");
      return saleDate >= previousMonthStart && saleDate <= previousMonthEnd;
    });

    const thisMonthRevenue = thisMonthSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const lastMonthRevenue = lastMonthSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);

    // Paid vs pending
    const totalPaid = payments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalPending = payments
      .filter(p => p.status === "pending" || p.status === "overdue")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const overdue = payments
      .filter(p => p.status === "overdue")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Revenue growth
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : thisMonthRevenue > 0 ? 100 : 0;

    // Budgets
    const pendingBudgets = budgets.filter(b => b.status === "sent" || b.status === "draft");
    const approvedBudgets = budgets.filter(b => b.status === "approved");
    const budgetsValue = pendingBudgets.reduce((sum, b) => sum + (b.total_amount || 0), 0);

    return {
      monthlyRevenue: thisMonthRevenue,
      revenueGrowth: Math.round(revenueGrowth),
      totalPaid,
      totalPending,
      overdue,
      pendingBudgets: pendingBudgets.length,
      budgetsValue,
      conversionRate: budgets.length > 0 
        ? Math.round((approvedBudgets.length / budgets.length) * 100) 
        : 0,
    };
  }, [budgets, sales, payments, today]);

  // Revenue over time
  const revenueOverTime = useMemo(() => {
    const last30Days: { [key: string]: number } = {};
    
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const key = format(date, "dd/MM");
      last30Days[key] = 0;
    }

    sales.forEach(s => {
      if (!s.sale_date && !s.created_at) return;
      const saleDate = parseISO(s.sale_date || s.created_at || "");
      const daysDiff = Math.floor((today.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < 30) {
        const key = format(saleDate, "dd/MM");
        if (last30Days[key] !== undefined) {
          last30Days[key] += s.total_amount || 0;
        }
      }
    });

    return Object.entries(last30Days).map(([date, value]) => ({ date, value }));
  }, [sales, today]);

  // Payment methods distribution
  const paymentMethodsData = useMemo(() => {
    const methods: { [key: string]: number } = {};
    
    payments
      .filter(p => p.status === "paid")
      .forEach(p => {
        const method = p.payment_method || "outro";
        const label = {
          pix: "PIX",
          credit: "Crédito",
          debit: "Débito",
          cash: "Dinheiro",
          boleto: "Boleto",
          transfer: "Transferência",
        }[method] || "Outro";
        methods[label] = (methods[label] || 0) + (p.amount || 0);
      });

    return Object.entries(methods)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [payments]);

  // Payment status distribution
  const paymentStatusData = useMemo(() => {
    const paidValue = payments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const pendingValue = payments
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const overdueValue = payments
      .filter(p => p.status === "overdue")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return [
      { name: "Pago", value: paidValue, color: "hsl(var(--success))" },
      { name: "Pendente", value: pendingValue, color: "hsl(var(--warning))" },
      { name: "Vencido", value: overdueValue, color: "hsl(var(--destructive))" },
    ].filter(d => d.value > 0);
  }, [payments]);

  // Upcoming payments
  const upcomingPayments = useMemo(() => {
    return payments
      .filter(p => p.status === "pending" || p.status === "overdue")
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 6);
  }, [payments]);

  // Recent budgets
  const recentBudgets = useMemo(() => {
    return [...budgets]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [budgets]);

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--success))",
    "hsl(var(--warning))",
    "hsl(var(--accent))",
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
      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Receita do Mês",
            value: formatCurrency(stats.monthlyRevenue),
            icon: DollarSign,
            color: "text-success",
            bg: "bg-success/10",
            change: stats.revenueGrowth,
          },
          {
            label: "Total Recebido",
            value: formatCurrency(stats.totalPaid),
            icon: CheckCircle2,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "A Receber",
            value: formatCurrency(stats.totalPending),
            icon: Clock,
            color: "text-warning",
            bg: "bg-warning/10",
            subtitle: stats.overdue > 0 ? `${formatCurrency(stats.overdue)} vencido` : undefined,
          },
          {
            label: "Orçamentos Pendentes",
            value: stats.pendingBudgets,
            icon: FileText,
            color: "text-secondary",
            bg: "bg-secondary/10",
            subtitle: formatCurrency(stats.budgetsValue),
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
                <p className="text-xl font-bold truncate">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                {stat.subtitle && (
                  <p className="text-xs text-warning mt-1">{stat.subtitle}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Receita (Últimos 30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueOverTime}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                    interval={4}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `R$${v/1000}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--success))" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    name="Receita"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status dos Pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
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
              {paymentStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Formas de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentMethodsData} layout="vertical">
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `R$${v/1000}k`}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                    name="Valor"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Próximos Vencimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {upcomingPayments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum pagamento pendente</p>
                  </div>
                ) : (
                  upcomingPayments.map((payment) => {
                    const isOverdue = payment.status === "overdue";
                    return (
                      <div
                        key={payment.payment_id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-1.5 rounded-lg",
                            isOverdue ? "bg-destructive/10" : "bg-warning/10"
                          )}>
                            {isOverdue 
                              ? <AlertCircle className="h-4 w-4 text-destructive" />
                              : <Clock className="h-4 w-4 text-warning" />
                            }
                          </div>
                          <div>
                            <p className="text-sm font-medium truncate max-w-[120px]">
                              {payment.sale?.patient?.full_name || "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(payment.due_date), "dd/MM/yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{formatCurrency(payment.amount)}</p>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs",
                              isOverdue 
                                ? "bg-destructive/10 text-destructive border-destructive/20" 
                                : "bg-warning/10 text-warning border-warning/20"
                            )}
                          >
                            {isOverdue ? "Vencido" : "Pendente"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Budgets */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Orçamentos Recentes
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {stats.conversionRate}% conversão
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {recentBudgets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum orçamento encontrado</p>
                  </div>
                ) : (
                  recentBudgets.map((budget) => {
                    const statusColors = {
                      draft: "bg-muted text-muted-foreground",
                      sent: "bg-primary/10 text-primary",
                      approved: "bg-success/10 text-success",
                      expired: "bg-destructive/10 text-destructive",
                      rejected: "bg-destructive/10 text-destructive",
                    };
                    const statusLabels = {
                      draft: "Rascunho",
                      sent: "Enviado",
                      approved: "Aprovado",
                      expired: "Expirado",
                      rejected: "Rejeitado",
                    };

                    return (
                      <div
                        key={budget.budget_id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div>
                          <p className="text-sm font-medium truncate max-w-[140px]">
                            {budget.patient?.full_name || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {budget.budget_number}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{formatCurrency(budget.total_amount)}</p>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", statusColors[budget.status as keyof typeof statusColors])}
                          >
                            {statusLabels[budget.status as keyof typeof statusLabels] || budget.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
