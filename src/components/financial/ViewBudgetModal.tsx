import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, FileText, Pencil, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Budget } from "@/hooks/useFinancial";

interface ViewBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: Budget | null;
  onEdit?: () => void;
  onConvertToSale?: () => void;
}

export const ViewBudgetModal = ({
  open,
  onOpenChange,
  budget,
  onEdit,
  onConvertToSale,
}: ViewBudgetModalProps) => {
  if (!budget) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const getStatusBadge = (status: string) => {
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

  const items = Array.isArray(budget.items) ? budget.items : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <FileText className="w-5 h-5" />
                {budget.budget_number}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Detalhes do orçamento
              </DialogDescription>
            </div>
            {getStatusBadge(budget.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <User className="w-4 h-4" />
                  Paciente
                </div>
                <p className="font-medium">{budget.patient?.full_name || "N/A"}</p>
                {budget.patient?.phone_main && (
                  <p className="text-sm text-muted-foreground">{budget.patient.phone_main}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <User className="w-4 h-4" />
                  Profissional
                </div>
                <p className="font-medium">{budget.professional?.full_name || "N/A"}</p>
                {budget.professional?.specialty && (
                  <p className="text-sm text-muted-foreground">{budget.professional.specialty}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Datas */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Emissão:</span>
              <span className="font-medium">
                {format(new Date(budget.issue_date), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Validade:</span>
              <span className="font-medium">
                {format(new Date(budget.validity_date), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>

          <Separator />

          {/* Itens do Orçamento */}
          <div>
            <h3 className="font-semibold mb-3">Itens do Orçamento</h3>
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 grid grid-cols-12 gap-2 p-3 text-sm font-medium">
                <div className="col-span-5">Descrição</div>
                <div className="col-span-2 text-center">Qtd</div>
                <div className="col-span-2 text-right">Preço Unit.</div>
                <div className="col-span-3 text-right">Total</div>
              </div>
              <div className="divide-y">
                {items.map((item: any, index: number) => (
                  <div key={item.item_id || index} className="grid grid-cols-12 gap-2 p-3 text-sm">
                    <div className="col-span-5">{item.description}</div>
                    <div className="col-span-2 text-center">{item.quantity}</div>
                    <div className="col-span-2 text-right">{formatCurrency(item.unit_price)}</div>
                    <div className="col-span-3 text-right font-medium">{formatCurrency(item.total)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Totais */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>{formatCurrency(budget.subtotal)}</span>
            </div>
            {budget.discount_total > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Desconto:</span>
                <span className="text-red-600">- {formatCurrency(budget.discount_total)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-green-600">{formatCurrency(budget.total_amount)}</span>
            </div>
          </div>

          {/* Observações */}
          {budget.notes && (
            <div>
              <h4 className="font-medium mb-2">Observações</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{budget.notes}</p>
            </div>
          )}

          {/* Termos e Condições */}
          {budget.terms_conditions && (
            <div>
              <h4 className="font-medium mb-2">Termos e Condições</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{budget.terms_conditions}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {onEdit && budget.status !== "approved" && (
            <Button variant="outline" onClick={onEdit}>
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
          {onConvertToSale && budget.status === "approved" && (
            <Button onClick={onConvertToSale}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Converter em Venda
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
