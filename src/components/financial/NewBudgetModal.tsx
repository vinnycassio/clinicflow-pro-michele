import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePatients } from "@/hooks/usePatients";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useFinancial, type BudgetItem } from "@/hooks/useFinancial";
import { toast } from "sonner";
import { Plus, Trash2, Calculator } from "lucide-react";
import { format, addDays } from "date-fns";

interface NewBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewBudgetModal = ({ open, onOpenChange }: NewBudgetModalProps) => {
  const { patients } = usePatients();
  const { professionals } = useProfessionals();
  const { createBudget } = useFinancial();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    professional_id: "",
    issue_date: format(new Date(), "yyyy-MM-dd"),
    validity_date: format(addDays(new Date(), 30), "yyyy-MM-dd"),
    status: "draft",
    notes: "",
    terms_conditions: "Orçamento válido por 30 dias.\nPreços sujeitos a alteração sem aviso prévio.",
  });

  const [items, setItems] = useState<BudgetItem[]>([
    {
      item_id: "1",
      description: "",
      quantity: 1,
      unit_price: 0,
      discount_percent: 0,
      discount_amount: 0,
      total: 0,
    },
  ]);

  // Adicionar item
  const addItem = () => {
    const newItem: BudgetItem = {
      item_id: String(items.length + 1),
      description: "",
      quantity: 1,
      unit_price: 0,
      discount_percent: 0,
      discount_amount: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  // Remover item
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Atualizar item
  const updateItem = (index: number, field: keyof BudgetItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalcular totais
    const item = newItems[index];
    const subtotal = item.quantity * item.unit_price;

    if (field === "discount_percent") {
      item.discount_amount = (subtotal * item.discount_percent) / 100;
    } else if (field === "discount_amount") {
      item.discount_percent = subtotal > 0 ? (item.discount_amount / subtotal) * 100 : 0;
    }

    item.total = subtotal - item.discount_amount;

    setItems(newItems);
  };

  // Calcular totais
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const discount_total = items.reduce((sum, item) => sum + item.discount_amount, 0);
    const total_amount = subtotal - discount_total;

    return { subtotal, discount_total, total_amount };
  };

  const totals = calculateTotals();

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patient_id || !formData.professional_id) {
      toast.error("Selecione o paciente e o profissional");
      return;
    }

    if (items.some((item) => !item.description || item.unit_price <= 0)) {
      toast.error("Preencha todos os itens corretamente");
      return;
    }

    setLoading(true);

    try {
      const budgetData = {
        ...formData,
        items,
        subtotal: totals.subtotal,
        discount_total: totals.discount_total,
        total_amount: totals.total_amount,
      };

      const result = await createBudget(budgetData);

      if (result) {
        toast.success("Orçamento criado com sucesso!");
        onOpenChange(false);
        // Reset form
        setFormData({
          patient_id: "",
          professional_id: "",
          issue_date: format(new Date(), "yyyy-MM-dd"),
          validity_date: format(addDays(new Date(), 30), "yyyy-MM-dd"),
          status: "draft",
          notes: "",
          terms_conditions: "Orçamento válido por 30 dias.\nPreços sujeitos a alteração sem aviso prévio.",
        });
        setItems([
          {
            item_id: "1",
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
      console.error("Erro:", error);
      toast.error(error.message || "Erro ao criar orçamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Orçamento</DialogTitle>
          <DialogDescription>
            Crie um novo orçamento para o paciente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Paciente e Profissional */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Paciente <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.patient_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, patient_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.patient_id} value={p.patient_id}>
                        {p.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Profissional <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.professional_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, professional_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals.map((p) => (
                      <SelectItem key={p.professional_id} value={p.professional_id}>
                        {p.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Data de Emissão</Label>
                <Input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) =>
                    setFormData({ ...formData, issue_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Data de Validade</Label>
                <Input
                  type="date"
                  value={formData.validity_date}
                  onChange={(e) =>
                    setFormData({ ...formData, validity_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Status Inicial</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="sent">Enviado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Itens */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Itens do Orçamento</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 grid grid-cols-12 gap-2 p-3 text-sm font-medium text-gray-700">
                  <div className="col-span-4">Descrição</div>
                  <div className="col-span-1">Qtd</div>
                  <div className="col-span-2">Preço Unit.</div>
                  <div className="col-span-1">Desc. %</div>
                  <div className="col-span-2">Desc. R$</div>
                  <div className="col-span-2">Total</div>
                </div>

                <div className="divide-y">
                  {items.map((item, index) => (
                    <div key={item.item_id} className="grid grid-cols-12 gap-2 p-3 items-center">
                      <div className="col-span-4">
                        <Input
                          placeholder="Ex: Harmonização Facial"
                          value={item.description}
                          onChange={(e) =>
                            updateItem(index, "description", e.target.value)
                          }
                        />
                      </div>

                      <div className="col-span-1">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, "quantity", Number(e.target.value))
                          }
                        />
                      </div>

                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0,00"
                          value={item.unit_price}
                          onChange={(e) =>
                            updateItem(index, "unit_price", Number(e.target.value))
                          }
                        />
                      </div>

                      <div className="col-span-1">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.discount_percent}
                          onChange={(e) =>
                            updateItem(index, "discount_percent", Number(e.target.value))
                          }
                        />
                      </div>

                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.discount_amount}
                          onChange={(e) =>
                            updateItem(index, "discount_amount", Number(e.target.value))
                          }
                        />
                      </div>

                      <div className="col-span-1 font-semibold">
                        {formatCurrency(item.total)}
                      </div>

                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totais */}
                <div className="bg-gray-50 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  {totals.discount_total > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Desconto Total:</span>
                      <span className="font-semibold text-red-600">
                        - {formatCurrency(totals.discount_total)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg border-t pt-2">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(totals.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações adicionais..."
                rows={2}
              />
            </div>

            {/* Termos e Condições */}
            <div className="space-y-2">
              <Label>Termos e Condições</Label>
              <Textarea
                value={formData.terms_conditions}
                onChange={(e) =>
                  setFormData({ ...formData, terms_conditions: e.target.value })
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
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Orçamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
