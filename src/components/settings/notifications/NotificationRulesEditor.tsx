import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Calendar, DollarSign, Save, Plus, Trash2, Bell } from "lucide-react";

export interface NotificationRule {
  id: string;
  name: string;
  type: "appointment" | "payment";
  enabled: boolean;
  triggerType: "before" | "after" | "on_day";
  triggerValue: number;
  triggerUnit: "hours" | "days";
  templateId: string;
  conditions?: {
    status?: string[];
    minAmount?: number;
    maxAmount?: number;
  };
}

interface NotificationRulesEditorProps {
  rules: NotificationRule[];
  templates: { id: string; name: string; type: string }[];
  onSave: (rules: NotificationRule[]) => void;
}

export function NotificationRulesEditor({ rules, templates, onSave }: NotificationRulesEditorProps) {
  const [editedRules, setEditedRules] = useState<NotificationRule[]>(rules);

  const handleToggleRule = (ruleId: string) => {
    setEditedRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleUpdateRule = (ruleId: string, updates: Partial<NotificationRule>) => {
    setEditedRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, ...updates } : r))
    );
  };

  const handleAddRule = (type: "appointment" | "payment") => {
    const newRule: NotificationRule = {
      id: `rule_${Date.now()}`,
      name: type === "appointment" ? "Nova Regra de Agendamento" : "Nova Regra de Pagamento",
      type,
      enabled: true,
      triggerType: "before",
      triggerValue: 1,
      triggerUnit: "days",
      templateId: templates.find((t) => t.type === type)?.id || "",
    };
    setEditedRules((prev) => [...prev, newRule]);
  };

  const handleDeleteRule = (ruleId: string) => {
    setEditedRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  const appointmentRules = editedRules.filter((r) => r.type === "appointment");
  const paymentRules = editedRules.filter((r) => r.type === "payment");

  const RuleCard = ({ rule }: { rule: NotificationRule }) => {
    const availableTemplates = templates.filter((t) => t.type === rule.type);

    return (
      <Card className={`transition-opacity ${!rule.enabled ? "opacity-60" : ""}`}>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                checked={rule.enabled}
                onCheckedChange={() => handleToggleRule(rule.id)}
              />
              <Input
                value={rule.name}
                onChange={(e) => handleUpdateRule(rule.id, { name: e.target.value })}
                className="font-medium border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => handleDeleteRule(rule.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Quando</Label>
              <Select
                value={rule.triggerType}
                onValueChange={(value) =>
                  handleUpdateRule(rule.id, { triggerType: value as NotificationRule["triggerType"] })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before">Antes</SelectItem>
                  <SelectItem value="on_day">No dia</SelectItem>
                  <SelectItem value="after">Depois</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {rule.triggerType !== "on_day" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={rule.triggerValue}
                    onChange={(e) =>
                      handleUpdateRule(rule.id, { triggerValue: parseInt(e.target.value) || 1 })
                    }
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Unidade</Label>
                  <Select
                    value={rule.triggerUnit}
                    onValueChange={(value) =>
                      handleUpdateRule(rule.id, { triggerUnit: value as "hours" | "days" })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Horas</SelectItem>
                      <SelectItem value="days">Dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Template</Label>
              <Select
                value={rule.templateId}
                onValueChange={(value) => handleUpdateRule(rule.id, { templateId: value })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {rule.type === "payment" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Valor mínimo (opcional)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="R$ 0,00"
                  value={rule.conditions?.minAmount || ""}
                  onChange={(e) =>
                    handleUpdateRule(rule.id, {
                      conditions: { ...rule.conditions, minAmount: parseFloat(e.target.value) || undefined },
                    })
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Valor máximo (opcional)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="R$ 0,00"
                  value={rule.conditions?.maxAmount || ""}
                  onChange={(e) =>
                    handleUpdateRule(rule.id, {
                      conditions: { ...rule.conditions, maxAmount: parseFloat(e.target.value) || undefined },
                    })
                  }
                  className="h-9"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Appointment Rules */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-primary" />
              Regras de Agendamento
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleAddRule("appointment")}>
              <Plus className="h-4 w-4 mr-1.5" />
              Nova Regra
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {appointmentRules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma regra de agendamento configurada</p>
            </div>
          ) : (
            appointmentRules.map((rule) => <RuleCard key={rule.id} rule={rule} />)
          )}
        </CardContent>
      </Card>

      {/* Payment Rules */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4 text-secondary" />
              Regras de Pagamento e Cobrança
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleAddRule("payment")}>
              <Plus className="h-4 w-4 mr-1.5" />
              Nova Regra
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {paymentRules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma regra de pagamento configurada</p>
            </div>
          ) : (
            paymentRules.map((rule) => <RuleCard key={rule.id} rule={rule} />)
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => onSave(editedRules)}>
          <Save className="h-4 w-4 mr-1.5" />
          Salvar Todas as Regras
        </Button>
      </div>
    </div>
  );
}
