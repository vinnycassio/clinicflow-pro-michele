import { useFinancial } from "@/hooks/useFinancial";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShoppingCart,
  CreditCard,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { NewBudgetModal } from "@/components/financial/NewBudgetModal";
import { NewSaleModal } from "@/components/financial/NewSaleModal";

const Financial = () => {
  const { budgets, sales, payments, loading, error, markPaymentAsPaid } = useFinancial();
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewBudgetModal, setShowNewBudgetModal] = useState(false);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);

  // Proteção contra undefined
  const safeBudgets = budgets || [];
  const safeSales = sales || [];
  const safePayments = payments || [];

  // Calcular estatísticas
  const stats = {
    totalRevenue: safeSales
      .filter((s) => s.payment_status !== "cancelled")
      .reduce((sum, s) => sum + Number(s.total_amount || 0), 0),
    
    totalReceived: safePayments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0),
    
    totalPending: safePayments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0),
    
    totalOverdue: safePayments
      .filter((p) => p.status === "overdue")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0),
    
    budgetStats: {
      total: safeBudgets.length,
      approved: safeBudgets.filter((b) => b.status === "approved").length,
      sent: safeBudgets.filter((b) => b.status === "sent").length,
      draft: safeBudgets.filter((b) => b.status === "draft").length,
    },
    
    salesStats: {
      total: safeSales.length,
      paid: safeSales.filter((s) => s.payment_status === "paid").length,
      partial: safeSales.filter((s) => s.payment_status === "partial").length,
      pending: safeSales.filter((s) => s.payment_status === "pending").length,
    },
  };

  const getSaleStatusBadge = (status: string) => {
    const configs: Record<string, { variant: any; label: string }> = {
      pending: { variant: "secondary", label: "Pendente" },
      partial: { variant: "default", label: "Parcial" },
      paid: { variant: "outline", label: "Pago" },
      overdue: { variant: "destructive", label: "Atrasado" },
      cancelled: { variant: "destructive", label: "Cancelado" },
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

  const handleMarkAsPaid = async (paymentId: string) => {
    const success = await markPaymentAsPaid(paymentId);
    if (success) {
      toast.success("Pagamento registrado com sucesso!");
    } else {
      toast.error("Erro ao registrar pagamento");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="p-4 md:p-8">
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
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Financeiro</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Gestão completa de orçamentos, vendas e pagamentos
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="gap-2 w-full sm:w-auto"
            onClick={() => setShowNewBudgetModal(true)}
          >
            <FileText className="w-4 h-4" />
            Novo Orçamento
          </Button>
          <Button 
            className="gap-2 w-full sm:w-auto"
            onClick={() => setShowNewSaleModal(true)}
          >
            <Plus className="w-4 h-4" />
            Nova Venda
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2 px-3 pt-3 md:px-6 md:pt-6">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-1 md:gap-2">
              <DollarSign className="w-3 h-3 md:w-4 md:h-4" />
              <span className="truncate">Faturamento</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 md:px-6 md:pb-6">
            <div className="text-base md:text-xl lg:text-2xl font-bold text-green-600 truncate">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.salesStats.total} vendas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-3 pt-3 md:px-6 md:pt-6">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-1 md:gap-2">
              <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />
              <span className="truncate">Recebido</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 md:px-6 md:pb-6">
            <div className="text-base md:text-xl lg:text-2xl font-bold text-blue-600 truncate">
              {formatCurrency(stats.totalReceived)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {safePayments.filter((p) => p.status === "paid").length} pagos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-3 pt-3 md:px-6 md:pt-6">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-1 md:gap-2">
              <Clock className="w-3 h-3 md:w-4 md:h-4" />
              <span className="truncate">A Receber</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 md:px-6 md:pb-6">
            <div className="text-base md:text-xl lg:text-2xl font-bold text-orange-600 truncate">
              {formatCurrency(stats.totalPending)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {safePayments.filter((p) => p.status === "pending").length} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-3 pt-3 md:px-6 md:pt-6">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-1 md:gap-2">
              <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
              <span className="truncate">Atrasados</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 md:px-6 md:pb-6">
            <div className="text-base md:text-xl lg:text-2xl font-bold text-red-600 truncate">
              {formatCurrency(stats.totalOverdue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {safePayments.filter((p) => p.status === "overdue").length} vencidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2 lg:grid-cols-4 h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs md:text-sm px-2 py-2">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="budgets" className="text-xs md:text-sm px-2 py-2">
            Orçamentos ({stats.budgetStats.total})
          </TabsTrigger>
          <TabsTrigger value="sales" className="text-xs md:text-sm px-2 py-2">
            Vendas ({stats.salesStats.total})
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-xs md:text-sm px-2 py-2">
            Pagamentos ({safePayments.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Últimas Vendas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                  Últimas Vendas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {safeSales.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 text-sm">
                    Nenhuma venda ainda
                  </p>
                ) : (
                  <div className="space-y-3">
                    {safeSales.slice(0, 5).map((sale) => (
                      <div
                        key={sale.sale_id}
                        className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{sale.sale_number}</span>
                              {getSaleStatusBadge(sale.payment_status)}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 truncate">
                              {sale.patient?.full_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(sale.sale_date), "dd/MM/yyyy")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600 text-sm md:text-base whitespace-nowrap">
                              {formatCurrency(Number(sale.total_amount))}
                            </p>
                            <p className="text-xs text-gray-500">
                              Pago: {formatCurrency(Number(sale.amount_paid || 0))}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagamentos Pendentes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
                  Pagamentos Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {safePayments.filter((p) => p.status === "pending" || p.status === "overdue")
                  .length === 0 ? (
                  <p className="text-center text-gray-500 py-8 text-sm">
                    Nenhum pagamento pendente
                  </p>
                ) : (
                  <div className="space-y-3">
                    {safePayments
                      .filter((p) => p.status === "pending" || p.status === "overdue")
                      .slice(0, 5)
                      .map((payment) => (
                        <div
                          key={payment.payment_id}
                          className="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">
                                  {payment.sale?.sale_number}
                                </span>
                                {getPaymentStatusBadge(payment.status)}
                              </div>
                              <p className="text-sm text-gray-600 mt-1 truncate">
                                {payment.sale?.patient?.full_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Venc: {format(new Date(payment.due_date), "dd/MM/yyyy")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm md:text-base whitespace-nowrap">
                                {formatCurrency(Number(payment.amount))}
                              </p>
                              <p className="text-xs text-gray-500">
                                {getPaymentMethodLabel(payment.payment_method)}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => handleMarkAsPaid(payment.payment_id)}
                          >
                            Marcar como Pago
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Budgets Tab */}
        <TabsContent value="budgets" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-8 md:p-12 text-center">
              <FileText className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm md:text-base text-gray-500 font-medium">
                {safeBudgets.length} orçamentos cadastrados
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-8 md:p-12 text-center">
              <ShoppingCart className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm md:text-base text-gray-500 font-medium">
                {safeSales.length} vendas registradas
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-8 md:p-12 text-center">
              <CreditCard className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm md:text-base text-gray-500 font-medium">
                {safePayments.length} pagamentos registrados
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modais */}
      <NewBudgetModal
        open={showNewBudgetModal}
        onOpenChange={setShowNewBudgetModal}
      />

      <NewSaleModal
        open={showNewSaleModal}
        onOpenChange={setShowNewSaleModal}
      />
    </div>
  );
};

export default Financial;
