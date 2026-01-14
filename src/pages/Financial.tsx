import { useFinancial } from "@/hooks/useFinancial";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewBudgetModal } from "@/components/financial/NewBudgetModal";
import { NewSaleModal } from "@/components/financial/Newsalemodal";
import {
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShoppingCart,
  CreditCard,
  Calendar,
  User,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const Financial = () => {
  const { budgets, sales, payments, loading, error, markPaymentAsPaid } = useFinancial();
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewBudgetModal, setShowNewBudgetModal] = useState(false);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);

  // Calcular estatísticas
  const stats = {
    // Faturamento total (vendas pagas e parciais)
    totalRevenue: sales
      .filter((s) => s.payment_status !== "cancelled")
      .reduce((sum, s) => sum + Number(s.total_amount || 0), 0),
    
    // Recebido (pagamentos pagos)
    totalReceived: payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0),
    
    // A receber (pagamentos pendentes)
    totalPending: payments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0),
    
    // Atrasados (pagamentos vencidos)
    totalOverdue: payments
      .filter((p) => p.status === "overdue")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0),
    
    // Orçamentos
    budgetStats: {
      total: budgets.length,
      approved: budgets.filter((b) => b.status === "approved").length,
      sent: budgets.filter((b) => b.status === "sent").length,
      draft: budgets.filter((b) => b.status === "draft").length,
    },
    
    // Vendas
    salesStats: {
      total: sales.length,
      paid: sales.filter((s) => s.payment_status === "paid").length,
      partial: sales.filter((s) => s.payment_status === "partial").length,
      pending: sales.filter((s) => s.payment_status === "pending").length,
    },
  };

  // Status badges
  const getBudgetStatusBadge = (status: string) => {
    const configs: Record<string, { variant: any; label: string }> = {
      draft: { variant: "secondary", label: "Rascunho" },
      sent: { variant: "default", label: "Enviado" },
      approved: { variant: "outline", label: "Aprovado" },
      expired: { variant: "destructive", label: "Expirado" },
      rejected: { variant: "destructive", label: "Rejeitado" },
    };
    const config = configs[status] || configs.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSaleStatusBadge = (status: string) => {
    const configs: Record<string, { variant: any; label: string; color: string }> = {
      pending: { variant: "secondary", label: "Pendente", color: "text-gray-600" },
      partial: { variant: "default", label: "Parcial", color: "text-blue-600" },
      paid: { variant: "outline", label: "Pago", color: "text-green-600" },
      overdue: { variant: "destructive", label: "Atrasado", color: "text-red-600" },
      cancelled: { variant: "destructive", label: "Cancelado", color: "text-red-600" },
    };
    const config = configs[status] || configs.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const configs: Record<string, { variant: any; label: string }> = {
      pending: { variant: "secondary", label: "Pendente" },
      paid: { variant: "outline", label: "Pago" },
      overdue: { variant: "destructive", label: "Vencido" },
      cancelled: { variant: "destructive", label: "Cancelado" },
      refunded: { variant: "destructive", label: "Estornado" },
    };
    const config = configs[status] || configs.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      pix: "Pix",
      cash: "Dinheiro",
      debit: "Débito",
      credit: "Crédito",
      boleto: "Boleto",
      transfer: "Transferência",
    };
    return methods[method] || method;
  };

  // Marcar como pago
  const handleMarkAsPaid = async (paymentId: string) => {
    const success = await markPaymentAsPaid(paymentId);
    if (success) {
      toast.success("Pagamento registrado com sucesso!");
    } else {
      toast.error("Erro ao registrar pagamento");
    }
  };

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-6">
            <p className="text-destructive font-medium">Erro ao carregar dados financeiros</p>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Financeiro</h1>
            <p className="text-muted-foreground text-sm md:text-base mt-1">
              Gestão completa de orçamentos, vendas e pagamentos
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="gap-2 flex-1 sm:flex-none"
              onClick={() => setShowNewBudgetModal(true)}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Novo</span> Orçamento
            </Button>
            <Button 
              className="gap-2 flex-1 sm:flex-none"
              onClick={() => setShowNewSaleModal(true)}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova</span> Venda
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardHeader className="pb-2 p-3 md:p-6 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Faturamento Total</span>
                <span className="sm:hidden">Faturamento</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-lg md:text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.salesStats.total} vendas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 p-3 md:p-6 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Recebido
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-lg md:text-2xl font-bold text-blue-600">
                {formatCurrency(stats.totalReceived)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {payments.filter((p) => p.status === "paid").length} pagamentos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 p-3 md:p-6 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                A Receber
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-lg md:text-2xl font-bold text-orange-600">
                {formatCurrency(stats.totalPending)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {payments.filter((p) => p.status === "pending").length} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 p-3 md:p-6 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Atrasados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-lg md:text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalOverdue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {payments.filter((p) => p.status === "overdue").length} vencidos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full md:w-auto overflow-x-auto flex-nowrap">
            <TabsTrigger value="overview" className="text-xs md:text-sm">Visão Geral</TabsTrigger>
            <TabsTrigger value="budgets" className="text-xs md:text-sm">
              Orçamentos <span className="hidden sm:inline">({stats.budgetStats.total})</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="text-xs md:text-sm">
              Vendas <span className="hidden sm:inline">({stats.salesStats.total})</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="text-xs md:text-sm">
              Pagamentos <span className="hidden sm:inline">({payments.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Últimas Vendas */}
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <ShoppingCart className="w-5 h-5" />
                    Últimas Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                  {sales.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhuma venda ainda</p>
                  ) : (
                    <div className="space-y-3">
                      {sales.slice(0, 5).map((sale) => (
                        <div
                          key={sale.sale_id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/50 rounded-lg gap-2"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm truncate">{sale.sale_number}</span>
                              {getSaleStatusBadge(sale.payment_status)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {sale.patient?.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(sale.sale_date), "dd/MM/yyyy")}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="font-bold text-green-600">
                              {formatCurrency(Number(sale.total_amount || 0))}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Pago: {formatCurrency(Number(sale.amount_paid || 0))}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pagamentos Pendentes */}
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <CreditCard className="w-5 h-5" />
                    Pagamentos Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                  {payments.filter((p) => p.status === "pending" || p.status === "overdue")
                    .length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum pagamento pendente
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {payments
                        .filter((p) => p.status === "pending" || p.status === "overdue")
                        .slice(0, 5)
                        .map((payment) => (
                          <div
                            key={payment.payment_id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/50 rounded-lg gap-2"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm truncate">
                                  {payment.sale?.sale_number}
                                </span>
                                {getPaymentStatusBadge(payment.status)}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 truncate">
                                {payment.sale?.patient?.full_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Venc: {format(new Date(payment.due_date), "dd/MM/yyyy")}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 justify-between sm:justify-end">
                              <div className="text-left sm:text-right">
                                <p className="font-bold">
                                  {formatCurrency(Number(payment.amount || 0))}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {getPaymentMethodLabel(payment.payment_method)}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleMarkAsPaid(payment.payment_id)}
                              >
                                Pagar
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Budgets Tab */}
          <TabsContent value="budgets" className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
              <Card>
                <CardContent className="p-3 md:p-4">
                  <p className="text-xs md:text-sm text-muted-foreground">Total</p>
                  <p className="text-xl md:text-2xl font-bold">{stats.budgetStats.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 md:p-4">
                  <p className="text-xs md:text-sm text-muted-foreground">Aprovados</p>
                  <p className="text-xl md:text-2xl font-bold text-green-600">
                    {stats.budgetStats.approved}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 md:p-4">
                  <p className="text-xs md:text-sm text-muted-foreground">Enviados</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-600">
                    {stats.budgetStats.sent}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 md:p-4">
                  <p className="text-xs md:text-sm text-muted-foreground">Rascunhos</p>
                  <p className="text-xl md:text-2xl font-bold text-muted-foreground">
                    {stats.budgetStats.draft}
                  </p>
                </CardContent>
              </Card>
            </div>

            {budgets.length === 0 ? (
              <Card>
                <CardContent className="p-8 md:p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">Nenhum orçamento criado</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {budgets.map((budget) => (
                  <Card key={budget.budget_id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-semibold text-base md:text-lg">{budget.budget_number}</h3>
                            {getBudgetStatusBadge(budget.status)}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <User className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{budget.patient?.full_name}</span>
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              <span className="text-xs md:text-sm">
                                Emissão: {format(new Date(budget.issue_date), "dd/MM/yyyy")} • 
                                Validade: {format(new Date(budget.validity_date), "dd/MM/yyyy")}
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {Array.isArray(budget.items) ? budget.items.length : 0} {(Array.isArray(budget.items) ? budget.items.length : 0) === 1 ? "item" : "itens"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2">
                          <div className="text-left md:text-right">
                            <p className="text-xl md:text-2xl font-bold text-green-600">
                              {formatCurrency(Number(budget.total_amount || 0))}
                            </p>
                            {Number(budget.discount_total || 0) > 0 && (
                              <p className="text-xs md:text-sm text-muted-foreground">
                                Desconto: {formatCurrency(Number(budget.discount_total || 0))}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Ver
                            </Button>
                            {budget.status === "approved" && (
                              <Button size="sm" className="hidden sm:inline-flex">Converter em Venda</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
              <Card>
                <CardContent className="p-3 md:p-4">
                  <p className="text-xs md:text-sm text-muted-foreground">Total</p>
                  <p className="text-xl md:text-2xl font-bold">{stats.salesStats.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 md:p-4">
                  <p className="text-xs md:text-sm text-muted-foreground">Pagas</p>
                  <p className="text-xl md:text-2xl font-bold text-green-600">
                    {stats.salesStats.paid}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 md:p-4">
                  <p className="text-xs md:text-sm text-muted-foreground">Parciais</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-600">
                    {stats.salesStats.partial}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 md:p-4">
                  <p className="text-xs md:text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-xl md:text-2xl font-bold text-orange-600">
                    {stats.salesStats.pending}
                  </p>
                </CardContent>
              </Card>
            </div>

            {sales.length === 0 ? (
              <Card>
                <CardContent className="p-8 md:p-12 text-center">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">Nenhuma venda registrada</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {sales.map((sale) => (
                  <Card key={sale.sale_id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-semibold text-base md:text-lg">{sale.sale_number}</h3>
                            {getSaleStatusBadge(sale.payment_status)}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <User className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{sale.patient?.full_name}</span>
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              {format(new Date(sale.sale_date), "dd/MM/yyyy")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {Array.isArray(sale.items) ? sale.items.length : 0} {(Array.isArray(sale.items) ? sale.items.length : 0) === 1 ? "item" : "itens"}
                            </p>
                            {sale.budget && (
                              <p className="text-xs text-muted-foreground">
                                Orçamento: {sale.budget.budget_number}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2">
                          <div className="text-left md:text-right">
                            <p className="text-xl md:text-2xl font-bold text-green-600">
                              {formatCurrency(Number(sale.total_amount || 0))}
                            </p>
                            <div className="text-xs md:text-sm text-muted-foreground mt-1">
                              <p>Pago: {formatCurrency(Number(sale.amount_paid || 0))}</p>
                              <p>Pendente: {formatCurrency(Number(sale.amount_pending || 0))}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Ver
                            </Button>
                            {sale.payment_status !== "paid" && (
                              <Button size="sm" className="hidden sm:inline-flex">Receber</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            {payments.length === 0 ? (
              <Card>
                <CardContent className="p-8 md:p-12 text-center">
                  <CreditCard className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">Nenhum pagamento registrado</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <Card
                    key={payment.payment_id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-semibold text-sm md:text-base">
                              {payment.sale?.sale_number}
                              {payment.installment_number && (
                                <span className="text-xs md:text-sm text-muted-foreground ml-2">
                                  ({payment.installment_number}/{payment.total_installments})
                                </span>
                              )}
                            </h3>
                            {getPaymentStatusBadge(payment.status)}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground truncate">
                              {payment.sale?.patient?.full_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Vencimento: {format(new Date(payment.due_date), "dd/MM/yyyy")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {getPaymentMethodLabel(payment.payment_method)}
                            </p>
                            {payment.paid_at && (
                              <p className="text-xs text-green-600">
                                Pago em: {format(new Date(payment.paid_at), "dd/MM/yyyy 'às' HH:mm")}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2">
                          <p className="text-xl md:text-2xl font-bold">
                            {formatCurrency(Number(payment.amount || 0))}
                          </p>
                          {(payment.status === "pending" || payment.status === "overdue") && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsPaid(payment.payment_id)}
                            >
                              Marcar como Pago
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modais - FORA de tudo */}
      <NewBudgetModal
        open={showNewBudgetModal}
        onOpenChange={setShowNewBudgetModal}
      />
      <NewSaleModal
        open={showNewSaleModal}
        onOpenChange={setShowNewSaleModal}
      />
    </>
  );
};

export default Financial;
