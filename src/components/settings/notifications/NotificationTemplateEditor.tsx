import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Save, RotateCcw, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface NotificationTemplate {
  id: string;
  name: string;
  type: "appointment" | "payment";
  message: string;
}

interface NotificationTemplateEditorProps {
  template: NotificationTemplate;
  onSave: (template: NotificationTemplate) => void;
}

const APPOINTMENT_VARIABLES = [
  { key: "{{paciente_nome}}", description: "Nome do paciente" },
  { key: "{{data}}", description: "Data da consulta" },
  { key: "{{horario}}", description: "Horário da consulta" },
  { key: "{{profissional}}", description: "Nome do profissional" },
  { key: "{{especialidade}}", description: "Especialidade" },
  { key: "{{clinica_nome}}", description: "Nome da clínica" },
  { key: "{{clinica_endereco}}", description: "Endereço da clínica" },
  { key: "{{clinica_telefone}}", description: "Telefone da clínica" },
];

const PAYMENT_VARIABLES = [
  { key: "{{paciente_nome}}", description: "Nome do paciente" },
  { key: "{{valor}}", description: "Valor do pagamento" },
  { key: "{{vencimento}}", description: "Data de vencimento" },
  { key: "{{tratamento}}", description: "Tratamento/Serviço" },
  { key: "{{parcela}}", description: "Número da parcela" },
  { key: "{{total_parcelas}}", description: "Total de parcelas" },
  { key: "{{clinica_nome}}", description: "Nome da clínica" },
  { key: "{{pix_chave}}", description: "Chave PIX" },
];

export function NotificationTemplateEditor({ template, onSave }: NotificationTemplateEditorProps) {
  const [editedTemplate, setEditedTemplate] = useState(template);
  const [showPreview, setShowPreview] = useState(false);

  const variables = template.type === "appointment" ? APPOINTMENT_VARIABLES : PAYMENT_VARIABLES;

  const handleInsertVariable = (variable: string) => {
    setEditedTemplate((prev) => ({
      ...prev,
      message: prev.message + variable,
    }));
  };

  const handleReset = () => {
    setEditedTemplate(template);
  };

  const getPreviewMessage = () => {
    let preview = editedTemplate.message;
    const sampleData: Record<string, string> = {
      "{{paciente_nome}}": "Maria Silva",
      "{{data}}": "15/01/2026",
      "{{horario}}": "14:30",
      "{{profissional}}": "Dr. João Santos",
      "{{especialidade}}": "Ortodontia",
      "{{clinica_nome}}": "Clínica Premium",
      "{{clinica_endereco}}": "Rua das Flores, 123",
      "{{clinica_telefone}}": "(11) 99999-9999",
      "{{valor}}": "R$ 500,00",
      "{{vencimento}}": "20/01/2026",
      "{{tratamento}}": "Limpeza Dental",
      "{{parcela}}": "2",
      "{{total_parcelas}}": "6",
      "{{pix_chave}}": "clinica@email.com",
    };

    Object.entries(sampleData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(key.replace(/[{}]/g, "\\$&"), "g"), value);
    });

    return preview;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            {template.name}
          </CardTitle>
          <Badge variant={template.type === "appointment" ? "default" : "secondary"}>
            {template.type === "appointment" ? "Agendamento" : "Pagamento"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`name-${template.id}`}>Nome do Template</Label>
          <Input
            id={`name-${template.id}`}
            value={editedTemplate.name}
            onChange={(e) => setEditedTemplate((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Nome do template"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`message-${template.id}`}>Mensagem</Label>
          <Textarea
            id={`message-${template.id}`}
            value={editedTemplate.message}
            onChange={(e) => setEditedTemplate((prev) => ({ ...prev, message: e.target.value }))}
            placeholder="Digite a mensagem..."
            rows={6}
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Variáveis disponíveis (clique para inserir)</Label>
          <div className="flex flex-wrap gap-1.5">
            {variables.map((v) => (
              <Button
                key={v.key}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleInsertVariable(v.key)}
                title={v.description}
              >
                {v.key}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1.5" />
                Prévia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Prévia da Mensagem</DialogTitle>
              </DialogHeader>
              <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap text-sm">
                {getPreviewMessage()}
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Restaurar
          </Button>

          <Button size="sm" onClick={() => onSave(editedTemplate)}>
            <Save className="h-4 w-4 mr-1.5" />
            Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
