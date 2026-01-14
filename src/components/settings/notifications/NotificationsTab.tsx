import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NotificationTemplateEditor } from "./NotificationTemplateEditor";
import { NotificationRulesEditor, NotificationRule } from "./NotificationRulesEditor";
import { NotificationTestPanel } from "./NotificationTestPanel";
import { MessageSquare, Settings2, Zap, Bell, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Default templates
const DEFAULT_TEMPLATES = [
  {
    id: "appointment_reminder",
    name: "Lembrete de Consulta",
    type: "appointment" as const,
    message: `Olá {{paciente_nome}}! 👋

Passando para lembrar da sua consulta:

📅 *Data:* {{data}}
🕐 *Horário:* {{horario}}
👨‍⚕️ *Profissional:* {{profissional}}

📍 {{clinica_nome}}
{{clinica_endereco}}

Em caso de dúvidas ou para remarcar, entre em contato: {{clinica_telefone}}

Aguardamos você! 😊`,
  },
  {
    id: "appointment_confirmation",
    name: "Confirmação de Agendamento",
    type: "appointment" as const,
    message: `✅ *Agendamento Confirmado!*

Olá {{paciente_nome}},

Sua consulta foi agendada com sucesso:

📅 {{data}} às {{horario}}
👨‍⚕️ {{profissional}} - {{especialidade}}
📍 {{clinica_nome}}

Qualquer dúvida, estamos à disposição!
📞 {{clinica_telefone}}`,
  },
  {
    id: "payment_reminder",
    name: "Lembrete de Pagamento",
    type: "payment" as const,
    message: `Olá {{paciente_nome}}! 👋

Gostaríamos de lembrar que você possui um pagamento em aberto:

💰 *Valor:* {{valor}}
📅 *Vencimento:* {{vencimento}}
📋 *Ref:* {{tratamento}}

Para sua comodidade, você pode pagar via PIX:
🔑 {{pix_chave}}

Em caso de dúvidas, entre em contato: {{clinica_telefone}}

{{clinica_nome}}`,
  },
  {
    id: "payment_overdue",
    name: "Cobrança de Pagamento Atrasado",
    type: "payment" as const,
    message: `Olá {{paciente_nome}},

Identificamos que há um pagamento pendente em sua conta:

💰 *Valor:* {{valor}}
📅 *Vencimento:* {{vencimento}}
📋 *Ref:* {{tratamento}}

Por favor, regularize sua situação o mais breve possível.

🔑 PIX: {{pix_chave}}

Dúvidas? Entre em contato: {{clinica_telefone}}

{{clinica_nome}}`,
  },
  {
    id: "payment_installment",
    name: "Lembrete de Parcela",
    type: "payment" as const,
    message: `Olá {{paciente_nome}}! 📋

Lembrete da sua parcela:

💳 *Parcela:* {{parcela}}/{{total_parcelas}}
💰 *Valor:* {{valor}}
📅 *Vencimento:* {{vencimento}}
📋 *Tratamento:* {{tratamento}}

🔑 PIX: {{pix_chave}}

{{clinica_nome}}
📞 {{clinica_telefone}}`,
  },
];

// Default rules
const DEFAULT_RULES: NotificationRule[] = [
  {
    id: "rule_appointment_1day",
    name: "Lembrete 1 dia antes",
    type: "appointment",
    enabled: true,
    triggerType: "before",
    triggerValue: 1,
    triggerUnit: "days",
    templateId: "appointment_reminder",
  },
  {
    id: "rule_appointment_2hours",
    name: "Lembrete 2 horas antes",
    type: "appointment",
    enabled: true,
    triggerType: "before",
    triggerValue: 2,
    triggerUnit: "hours",
    templateId: "appointment_reminder",
  },
  {
    id: "rule_payment_3days",
    name: "Lembrete 3 dias antes do vencimento",
    type: "payment",
    enabled: true,
    triggerType: "before",
    triggerValue: 3,
    triggerUnit: "days",
    templateId: "payment_reminder",
  },
  {
    id: "rule_payment_onday",
    name: "Lembrete no dia do vencimento",
    type: "payment",
    enabled: true,
    triggerType: "on_day",
    triggerValue: 0,
    triggerUnit: "days",
    templateId: "payment_reminder",
  },
  {
    id: "rule_payment_overdue",
    name: "Cobrança após vencimento",
    type: "payment",
    enabled: true,
    triggerType: "after",
    triggerValue: 1,
    triggerUnit: "days",
    templateId: "payment_overdue",
  },
];

export function NotificationsTab() {
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [rules, setRules] = useState(DEFAULT_RULES);

  const handleSaveTemplate = (updatedTemplate: typeof DEFAULT_TEMPLATES[0]) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t))
    );
    toast({
      title: "Template salvo",
      description: `O template "${updatedTemplate.name}" foi atualizado com sucesso.`,
    });
  };

  const handleSaveRules = (updatedRules: NotificationRule[]) => {
    setRules(updatedRules);
    toast({
      title: "Regras salvas",
      description: "As regras de notificação foram atualizadas com sucesso.",
    });
  };

  const appointmentTemplates = templates.filter((t) => t.type === "appointment");
  const paymentTemplates = templates.filter((t) => t.type === "payment");

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Integração WhatsApp via API Evolution</AlertTitle>
        <AlertDescription>
          As notificações são enviadas via WhatsApp usando a API Evolution. Certifique-se de que as
          variáveis <code className="bg-muted px-1 rounded">EVOLUTION_API_URL</code> e{" "}
          <code className="bg-muted px-1 rounded">EVOLUTION_API_KEY</code> estão configuradas no Supabase.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="templates" className="flex items-center gap-1.5 text-xs sm:text-sm flex-1 min-w-0">
            <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-1.5 text-xs sm:text-sm flex-1 min-w-0">
            <Settings2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">Regras</span>
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-1.5 text-xs sm:text-sm flex-1 min-w-0">
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">Testar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Appointment Templates */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">
                Agendamentos
              </Badge>
              <span className="text-sm text-muted-foreground">
                {appointmentTemplates.length} template(s)
              </span>
            </div>
            <div className="grid gap-4">
              {appointmentTemplates.map((template) => (
                <NotificationTemplateEditor
                  key={template.id}
                  template={template}
                  onSave={handleSaveTemplate}
                />
              ))}
            </div>
          </div>

          {/* Payment Templates */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Pagamentos
              </Badge>
              <span className="text-sm text-muted-foreground">
                {paymentTemplates.length} template(s)
              </span>
            </div>
            <div className="grid gap-4">
              {paymentTemplates.map((template) => (
                <NotificationTemplateEditor
                  key={template.id}
                  template={template}
                  onSave={handleSaveTemplate}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <NotificationRulesEditor
            rules={rules}
            templates={templates.map((t) => ({ id: t.id, name: t.name, type: t.type }))}
            onSave={handleSaveRules}
          />
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <NotificationTestPanel />
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" />
                Execução Automática
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                As notificações são executadas automaticamente via cron jobs no Supabase:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-muted rounded-lg p-3">
                  <div className="font-medium text-sm">Lembretes de Consulta</div>
                  <div className="text-xs text-muted-foreground">Executado diariamente às 18:00</div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="font-medium text-sm">Lembretes de Pagamento</div>
                  <div className="text-xs text-muted-foreground">Executado diariamente às 10:00</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Para alterar os horários de execução, edite os cron jobs diretamente no painel do Supabase.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
