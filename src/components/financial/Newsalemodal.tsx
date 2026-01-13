import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useFinancial } from "@/hooks/useFinancial";
import { usePatients } from "@/hooks/usePatients";
import { useProfessionals } from "@/hooks/useProfessionals";
import { Loader2, ShoppingCart, DollarSign, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NewSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedBudgetId?: string;
}

export const NewSaleModal = ({
  open,
  onOpenChange,
  preSelectedBudgetId,
}: NewSaleModalProps) => {
  const { createSale, createPayment, budgets } = useFinancial();
  const { patients } = usePatients();
  const { professionals } = useProfessionals();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: "",
    professional_id: "",
    budget_id: preSelectedBudgetId || "",
    sale_date: new Date().toISOString().split("T")[0],
    total_amount: 0,
    discount_amount: 0,
    final_amount: 0,
    payment_method: "pix" as const,
    installments: 1,
    first_payment_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [selectedBudget, setSelectedBudget] = useState<any>(null);

  useEffect(() => {
    if (preSelectedBudgetId) {
      const budget = budgets.find((b) => b.budget_id === preSelectedBudgetId);
      if (budget) {
        setSelectedBudget(budget);
        setFormData((prev) => ({
          ...prev,
          budget_id: budget.budget_id,
          patient_id: budget.patient_id,
          professional_id: budget.professional_id,
          total_amount: budget.total_amount,
          final_amount: budget.total_amount,
        }));
      }
    }
  }, [preSelectedBudgetId, budgets]);

  const handleBudgetChange = (budgetId: string) => {
    const budget = budgets.find((b) => b.budget_id === budgetId);
    if (budget) {
      setSelectedBudget(budget);
      setFormData({
        ...formData,
        budget_id: budgetId,
        patient_id: budget.patient_id,
        professional_id: budget.professional_id,
        total_amount: budget.total_amount,
        final_amount: budget.total_amount - formData.discount_amount,
      });
    }
  };

  const handleDiscountChange = (discount: number) => {
    const finalAmount = formData.total_amount - discount;
    setFormData({
      ...formData,
      discount_amount: discount,
      final_amount: finalAmount >= 0 ? finalAmount : 0,
    });
  };

  const calculateInstallmentAmount = () => {
    return formData.final_amount / formData.installments;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.patient_id) {
      toast.error("Selecione um paciente");
      return;
    }

    if (!formData.professional_id) {
      toast.error("Selecione um profissional");
      return;
    }

    if (formData.final_amount <= 0) {
      toast.error("O valor final deve ser maior que zero");
      return;
    }

    if (formData.installments < 1) {
      toast.error("Número de parcelas inválido");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Pegar os itens do orçamento ou criar item genérico
      let items: any[] = [];

      if (selectedBudget) {
        items = selectedBudget.items || [];
      } else {
        // Se não houver orçamento, criar um item genérico
        items = [
          {
            item_id: crypto.randomUUID(),
            description: "Serviço",
            quantity: 1,
            unit_price: formData.total_amount,
            discount_percent: 0,
            discount_amount: formData.discount_amount,
            total: formData.final_amount,
          },
        ];
      }

      // 2. Criar a venda
      const saleData: any = {
        patient_id: formData.patient_id,
        professional_id: formData.professional_id,
        budget_id: formData.budget_id || null,
        sale_date: formData.sale_date,
        items: items,
        subtotal: formData.total_amount,
        discount_total: formData.discount_amount,
        total_amount: formData.final_amount,
        notes: formData.notes || null,
      };

      const newSale = await createSale(saleData);

      if (!newSale) {
        throw new Error("Erro ao criar venda");
      }

      // 3. Criar as parcelas
      const installmentAmount = calculateInstallmentAmount();
      const firstPaymentDate = new Date(formData.first_payment_date);

      for (let i = 0; i < formData.installments; i++) {
        const dueDate = new Date(firstPaymentDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        const paymentData: any = {
          sale_id: newSale.sale_id,
          installment_number: i + 1,
          total_installments: formData.installments,
          payment_date: formData.sale_date,
          due_date: dueDate.toISOString().split("T")[0],
          amount: installmentAmount,
          payment_method: formData.payment_method,
          status: "pending",
          notes: `Parcela ${i + 1}/${formData.installments}`,
        };

        await createPayment(paymentData);
      }

      toast.success(`Venda criada com sucesso! ${formData.installments} parcela(s) gerada(s).`);
      onOpenChange(false);
      
      // Reset form
      setFormData({
        patient_id: "",
        professional_id: "",
        budget_id: "",
        sale_date: new Date().toISOString().split("T")[0],
        total_amount: 0,
        discount_amount: 0,
        final_amount: 0,
        payment_method: "pix",
        installments: 1,
        first_payment_date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setSelectedBudget(null);
    } catch (error: any) {
      console.error("Erro ao criar venda:", error);
      toast.error(error.message || "Erro ao criar venda");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const paymentMethods = [
    { value: "pix", label: "Pix" },
    { value: "cash", label: "Dinheiro" },
    { value: "debit", label: "Débito" },
    { value: "credit", label: "Crédito" },
    { value: "boleto", label: "Boleto" },
    { value: "transfer", label: "Transferência" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Nova Venda
          </DialogTitle>
          <DialogDescription>
            Registre uma nova venda e gere as parcelas de pagamento automaticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Seleção de Orçamento (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="budget_id">Orçamento Base (Opcional)</Label>
              <Select
                value={formData.budget_id}
                onValueChange={handleBudgetChange}
                disabled={!!preSelectedBudgetId}
              >
                <SelectTrigger id="budget_id">
                  <SelectValue placeholder="Selecione um orçamento aprovado ou deixe em branco" />
                </SelectTrigger>
                <SelectContent>
                  {budgets
                    .filter((b) => b.status === "approved")
                    .map((budget) => (
                      <SelectItem key={budget.budget_id} value={budget.budget_id}>
                        {budget.budget_number} - {budget.patient?.full_name} -{" "}
                        {formatCurrency(budget.total_amount)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Paciente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient_id">
                  Paciente <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.patient_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, patient_id: value })
                  }
                  disabled={!!selectedBudget}
                >
                  <SelectTrigger id="patient_id">
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.patient_id} value={patient.patient_id}>
                        {patient.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="professional_id">
                  Profissional <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.professional_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, professional_id: value })
                  }
                  disabled={!!selectedBudget}
                >
                  <SelectTrigger id="professional_id">
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals.map((prof) => (
                      <SelectItem key={prof.professional_id} value={prof.professional_id}>
                        {prof.full_name} - {prof.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Informações do Orçamento Selecionado */}
            {selectedBudget && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Orçamento: {selectedBudget.budget_number}
                      </p>
                      <p className="text-xs text-blue-700">
                        {selectedBudget.items?.length || 0} item(s)
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-white">
                      {formatCurrency(selectedBudget.total_amount)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Valores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_amount">
                  Valor Total <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="total_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={formData.total_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        total_amount: parseFloat(e.target.value) || 0,
                        final_amount:
                          parseFloat(e.target.value) - formData.discount_amount,
                      })
                    }
                    className="pl-10"
                    disabled={!!selectedBudget}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_amount">Desconto Adicional</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="discount_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={formData.discount_amount}
                    onChange={(e) =>
                      handleDiscountChange(parseFloat(e.target.value) || 0)
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Valor Final</Label>
                <div className="text-2xl font-bold text-green-600 py-1.5">
                  {formatCurrency(formData.final_amount)}
                </div>
              </div>
            </div>

            {/* Data e Método de Pagamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sale_date">Data da Venda</Label>
                <Input
                  id="sale_date"
                  type="date"
                  value={formData.sale_date}
                  onChange={(e) =>
                    setFormData({ ...formData, sale_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method">Método de Pagamento</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, payment_method: value })
                  }
                >
                  <SelectTrigger id="payment_method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Parcelamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="installments">Número de Parcelas</Label>
                <Input
                  id="installments"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.installments}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      installments: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_payment_date">
                  Vencimento da 1ª Parcela
                </Label>
                <Input
                  id="first_payment_date"
                  type="date"
                  value={formData.first_payment_date}
                  onChange={(e) =>
                    setFormData({ ...formData, first_payment_date: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Preview do Parcelamento */}
            {formData.installments > 1 && (
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-2">
                    Plano de Pagamento:
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {formData.installments}x de
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(calculateInstallmentAmount())}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Observações sobre a venda..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Venda"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
