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

  const safeBudgets = budgets || [];
  const safeSales = sales || [];
  const safePayments = payments || [];

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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Financeiro</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestão completa de orçamentos, vendas e pagamentos
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Faturamento Total</span>
              <span className="sm:hidden">Faturamento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.salesStats.total} vendas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Recebido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-blue-600">
              {formatCurrency(stats.totalReceived)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {safePayments.filter((p) => p.status === "paid").length} pagos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              A Receber
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-orange-600">
              {formatCurrency(stats.totalPending)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {safePayments.filter((p) => p.status === "pending").length} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Atrasados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalOverdue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {safePayments.filter((p) => p.status === "overdue").length} vencidos
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview" className="text-xs md:text-sm">Visão Geral</TabsTrigger>
          <TabsTrigger value="budgets" className="text-xs md:text-sm">Orçamentos ({stats.budgetStats.total})</TabsTrigger>
          <TabsTrigger value="sales" className="text-xs md:text-sm">Vendas ({stats.salesStats.total})</TabsTrigger>
          <TabsTrigger value="payments" className="text-xs md:text-sm">Pagamentos ({safePayments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Últimas Vendas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {safeSales.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 text-sm">Nenhuma venda ainda</p>
                ) : (
                  <div className="space-y-3">
                    {safeSales.slice(0, 5).map((sale) => (
                      <div key={sale.sale_id} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{sale.sale_number}</span>
                              {getSaleStatusBadge(sale.payment_status)}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 truncate">{sale.patient?.full_name}</p>
                            <p className="text-xs text-gray-500">{format(new Date(sale.sale_date), "dd/MM/yyyy")}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600 text-sm whitespace-nowrap">
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Pagamentos Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {safePayments.filter((p) => p.status === "pending" || p.status === "overdue").length === 0 ? (
                  <p className="text-center text-gray-500 py-8 text-sm">Nenhum pagamento pendente</p>
                ) : (
                  <div className="space-y-3">
                    {safePayments
                      .filter((p) => p.status === "pending" || p.status === "overdue")
                      .slice(0, 5)
                      .map((payment) => (
                        <div key={payment.payment_id} className="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">{payment.sale?.sale_number}</span>
                                {getPaymentStatusBadge(payment.status)}
                              </div>
                              <p className="text-sm text-gray-600 mt-1 truncate">{payment.sale?.patient?.full_name}</p>
                              <p className="text-xs text-gray-500">Venc: {format(new Date(payment.due_date), "dd/MM/yyyy")}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm whitespace-nowrap">{formatCurrency(Number(payment.amount))}</p>
                              <p className="text-xs text-gray-500">{getPaymentMethodLabel(payment.payment_method)}</p>
                            </div>
                          </div>
                          <Button size="sm" className="w-full" onClick={() => handleMarkAsPaid(payment.payment_id)}>
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

        <TabsContent value="budgets" className="mt-4">
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">{safeBudgets.length} orçamentos cadastrados</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">{safeSales.length} vendas registradas</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardContent className="p-12 text-center">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">{safePayments.length} pagamentos registrados</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NewBudgetModal open={showNewBudgetModal} onOpenChange={setShowNewBudgetModal} />
      <NewSaleModal open={showNewSaleModal} onOpenChange={setShowNewSaleModal} />
    </div>
  );
};

export default Financial;
