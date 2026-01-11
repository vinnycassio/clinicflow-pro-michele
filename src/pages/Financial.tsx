import { useFinancial } from "@/hooks/useFinancial";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewBudgetModal } from "@/components/financial/NewBudgetModal";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
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
  const [showNewBudgetModal, setShowNewBudgetModal] = useState(false);
  const { budgets, sales, payments, loading, error, markPaymentAsPaid } = useFinancial();
  const [activeTab, setActiveTab] = useState("overview");

  // Calcular estatísticas
  const stats = {
    // Faturamento total (vendas pagas e parciais)
    totalRevenue: sales
      .filter((s) => s.payment_status !== "cancelled")
      .reduce((sum, s) => sum + Number(s.total_amount), 0),
    
    // Recebido (pagamentos pagos)
    totalReceived: payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + Number(p.amount), 0),
    
    // A receber (pagamentos pendentes)
    totalPending: payments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + Number(p.amount), 0),
    
    // Atrasados (pagamentos vencidos)
    totalOverdue: payments
      .filter((p) => p.status === "overdue")
      .reduce((sum, p) => sum + Number(p.amount), 0),
    
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
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600 font-medium">Erro ao carregar dados financeiros</p>
            <p className="text-sm text-red-500 mt-1">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-gray-500 mt-1">Gestão completa de orçamentos, vendas e pagamentos</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setShowNewBudgetModal(true)}
          >
            <FileText className="w-4 h-4" />
            Novo Orçamento
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Venda
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Faturamento Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.salesStats.total} vendas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Recebido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.totalReceived)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {payments.filter((p) => p.status === "paid").length} pagamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              A Receber
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.totalPending)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {payments.filter((p) => p.status === "pending").length} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Atrasados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalOverdue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {payments.filter((p) => p.status === "overdue").length} vencidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="budgets">
            Orçamentos ({stats.budgetStats.total})
          </TabsTrigger>
          <TabsTrigger value="sales">Vendas ({stats.salesStats.total})</TabsTrigger>
          <TabsTrigger value="payments">
            Pagamentos ({payments.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Últimas Vendas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Últimas Vendas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sales.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhuma venda ainda</p>
                ) : (
                  <div className="space-y-3">
                    {sales.slice(0, 5).map((sale) => (
                      <div
                        key={sale.sale_id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{sale.sale_number}</span>
                            {getSaleStatusBadge(sale.payment_status)}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {sale.patient?.full_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(sale.sale_date), "dd/MM/yyyy")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {formatCurrency(Number(sale.total_amount))}
                          </p>
                          <p className="text-xs text-gray-500">
                            Pago: {formatCurrency(Number(sale.amount_paid))}
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Pagamentos Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {payments.filter((p) => p.status === "pending" || p.status === "overdue")
                  .length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
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
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {payment.sale?.sale_number}
                              </span>
                              {getPaymentStatusBadge(payment.status)}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {payment.sale?.patient?.full_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Venc: {format(new Date(payment.due_date), "dd/MM/yyyy")}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="font-bold">
                                {formatCurrency(Number(payment.amount))}
                              </p>
                              <p className="text-xs text-gray-500">
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
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.budgetStats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Aprovados</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.budgetStats.approved}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Enviados</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.budgetStats.sent}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Rascunhos</p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.budgetStats.draft}
                </p>
              </CardContent>
            </Card>
          </div>

          {budgets.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Nenhum orçamento criado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {budgets.map((budget) => (
                <Card key={budget.budget_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{budget.budget_number}</h3>
                          {getBudgetStatusBadge(budget.status)}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {budget.patient?.full_name}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Emissão: {format(new Date(budget.issue_date), "dd/MM/yyyy")} • 
                            Validade: {format(new Date(budget.validity_date), "dd/MM/yyyy")}
                          </p>
                          <p className="text-sm text-gray-500">
                            {budget.items.length} {budget.items.length === 1 ? "item" : "itens"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(Number(budget.total_amount))}
                        </p>
                        {Number(budget.discount_total) > 0 && (
                          <p className="text-sm text-gray-500">
                            Desconto: {formatCurrency(Number(budget.discount_total))}
                          </p>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm">
                            Ver
                          </Button>
                          {budget.status === "approved" && (
                            <Button size="sm">Converter em Venda</Button>
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
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.salesStats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Pagas</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.salesStats.paid}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Parciais</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.salesStats.partial}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.salesStats.pending}
                </p>
              </CardContent>
            </Card>
          </div>

          {sales.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Nenhuma venda registrada</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sales.map((sale) => (
                <Card key={sale.sale_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{sale.sale_number}</h3>
                          {getSaleStatusBadge(sale.payment_status)}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {sale.patient?.full_name}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(sale.sale_date), "dd/MM/yyyy")}
                          </p>
                          <p className="text-sm text-gray-500">
                            {sale.items.length} {sale.items.length === 1 ? "item" : "itens"}
                          </p>
                          {sale.budget && (
                            <p className="text-xs text-gray-400">
                              Orçamento: {sale.budget.budget_number}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(Number(sale.total_amount))}
                        </p>
                        <div className="text-sm text-gray-600 mt-1">
                          <p>Pago: {formatCurrency(Number(sale.amount_paid))}</p>
                          <p>Pendente: {formatCurrency(Number(sale.amount_pending))}</p>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                          {sale.payment_status !== "paid" && (
                            <Button size="sm">Receber</Button>
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
              <CardContent className="p-12 text-center">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Nenhum pagamento registrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <Card
                  key={payment.payment_id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">
                            {payment.sale?.sale_number}
                            {payment.installment_number && (
                              <span className="text-sm text-gray-500 ml-2">
                                ({payment.installment_number}/{payment.total_installments})
                              </span>
                            )}
                          </h3>
                          {getPaymentStatusBadge(payment.status)}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            {payment.sale?.patient?.full_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Vencimento: {format(new Date(payment.due_date), "dd/MM/yyyy")}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getPaymentMethodLabel(payment.payment_method)}
                          </p>
                          {payment.paid_at && (
                            <p className="text-xs text-green-600">
                              Pago em: {format(new Date(payment.paid_at), "dd/MM/yyyy 'às' HH:mm")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {formatCurrency(Number(payment.amount))}
                        </p>
                        {(payment.status === "pending" || payment.status === "overdue") && (
                          <Button
                            size="sm"
                            className="mt-3"
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
            <NewBudgetModal
              open={showNewBudgetModal}
              onOpenChange={setShowNewBudgetModal}
            />
           </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financial;
