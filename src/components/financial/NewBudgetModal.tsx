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
import { Loader2, Plus, Trash2, DollarSign, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface NewBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BudgetItem {
  item_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  total: number;
}

export const NewBudgetModal = ({ open, onOpenChange }: NewBudgetModalProps) => {
  const { createBudget } = useFinancial();
  const { patients } = usePatients();
  const { professionals } = useProfessionals();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: "",
    professional_id: "",
    issue_date: new Date().toISOString().split("T")[0],
    validity_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 30 dias
    status: "draft" as const,
    notes: "",
    terms_conditions: "",
  });

  const [items, setItems] = useState<BudgetItem[]>([
    {
      item_id: crypto.randomUUID(),
      description: "",
      quantity: 1,
      unit_price: 0,
      discount_percent: 0,
      discount_amount: 0,
      total: 0,
    },
  ]);

  const calculateItemTotal = (item: BudgetItem): number => {
    const subtotal = item.quantity * item.unit_price;
    const discount = item.discount_amount || (subtotal * item.discount_percent) / 100;
    return subtotal - discount;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    const discountTotal = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unit_price;
      const discount =
        item.discount_amount || (itemSubtotal * item.discount_percent) / 100;
      return sum + discount;
    }, 0);
    const total = subtotal - discountTotal;

    return { subtotal, discountTotal, total };
  };

  const handleItemChange = (
    index: number,
    field: keyof BudgetItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalcular total do item
    if (["quantity", "unit_price", "discount_percent", "discount_amount"].includes(field)) {
      newItems[index].total = calculateItemTotal(newItems[index]);
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        item_id: crypto.randomUUID(),
        description: "",
        quantity: 1,
        unit_price: 0,
        discount_percent: 0,
        discount_amount: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
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

    if (items.length === 0 || items.every((item) => !item.description)) {
      toast.error("Adicione pelo menos um item ao orçamento");
      return;
    }

    const { subtotal, discountTotal, total } = calculateTotals();

    if (total <= 0) {
      toast.error("O valor total do orçamento deve ser maior que zero");
      return;
    }

    setIsSubmitting(true);

    try {
      // Filtrar itens vazios
      const validItems = items.filter((item) => item.description.trim());

      const budgetData: any = {
        patient_id: formData.patient_id,
        professional_id: formData.professional_id,
        issue_date: formData.issue_date,
        validity_date: formData.validity_date,
        status: formData.status,
        items: validItems,
        subtotal,
        discount_total: discountTotal,
        total_amount: total,
        notes: formData.notes || null,
        terms_conditions: formData.terms_conditions || null,
      };

      const newBudget = await createBudget(budgetData);

      if (newBudget) {
        toast.success("Orçamento criado com sucesso!");
        onOpenChange(false);
        
        // Reset form
        setFormData({
          patient_id: "",
          professional_id: "",
          issue_date: new Date().toISOString().split("T")[0],
          validity_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          status: "draft",
          notes: "",
          terms_conditions: "",
        });
        setItems([
          {
            item_id: crypto.randomUUID(),
            description: "",
            quantity: 1,
            unit_price: 0,
            discount_percent: 0,
            discount_amount: 0,
            total: 0,
          },
        ]);
      } else {
        toast.error("Erro ao criar orçamento");
      }
    } catch (error: any) {
      console.error("Erro ao criar orçamento:", error);
      toast.error(error.message || "Erro ao criar orçamento");
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

  const { subtotal, discountTotal, total } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Novo Orçamento
          </DialogTitle>
          <DialogDescription>
            Crie um novo orçamento para o paciente. Adicione os serviços e valores.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Dados Básicos */}
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
                >
                  <SelectTrigger id="patient_id">
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem
                        key={patient.patient_id}
                        value={patient.patient_id}
                      >
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
                >
                  <SelectTrigger id="professional_id">
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals.map((prof) => (
                      <SelectItem
                        key={prof.professional_id}
                        value={prof.professional_id}
                      >
                        {prof.full_name} - {prof.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issue_date">Data de Emissão</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) =>
                    setFormData({ ...formData, issue_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validity_date">Validade</Label>
                <Input
                  id="validity_date"
                  type="date"
                  value={formData.validity_date}
                  onChange={(e) =>
                    setFormData({ ...formData, validity_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="sent">Enviado</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Itens do Orçamento */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base">Itens do Orçamento</Label>
                <Button type="button" onClick={addItem} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <Card key={item.item_id}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                        <div className="md:col-span-4 space-y-2">
                          <Label className="text-xs">Descrição</Label>
                          <Input
                            placeholder="Ex: Limpeza de Pele"
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(index, "description", e.target.value)
                            }
                          />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <Label className="text-xs">Qtd</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                          />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <Label className="text-xs">Preço Unit.</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            value={item.unit_price}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "unit_price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <Label className="text-xs">Desc. %</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="0"
                            value={item.discount_percent}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "discount_percent",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>

                        <div className="md:col-span-1 space-y-2">
                          <Label className="text-xs">Total</Label>
                          <div className="text-sm font-semibold text-green-600 py-2">
                            {formatCurrency(item.total)}
                          </div>
                        </div>

                        <div className="md:col-span-1 flex items-end">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Resumo de Valores */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Desconto Total:</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(discountTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Observações internas..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms_conditions">Termos e Condições</Label>
                <Textarea
                  id="terms_conditions"
                  placeholder="Termos e condições do orçamento..."
                  value={formData.terms_conditions}
                  onChange={(e) =>
                    setFormData({ ...formData, terms_conditions: e.target.value })
                  }
                  rows={3}
                />
              </div>
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
                "Criar Orçamento"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
