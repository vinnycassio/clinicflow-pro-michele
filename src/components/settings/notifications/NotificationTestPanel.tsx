import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Send, CheckCircle2, XCircle, Loader2, Smartphone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { SUPABASE_CONFIG } from "@/lib/supabase.config";

interface TestResult {
  success: boolean;
  message: string;
  timestamp: Date;
}

export function NotificationTestPanel() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [testMessage, setTestMessage] = useState(
    "🔔 *Teste de Notificação*\n\nEsta é uma mensagem de teste do sistema de notificações WhatsApp.\n\n_Vltra Clinic Pro_"
  );
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<TestResult | null>(null);

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-numeric characters
    const numbers = phone.replace(/\D/g, "");
    
    // If it doesn't start with country code, assume Brazil (55)
    if (numbers.length <= 11) {
      return `55${numbers}`;
    }
    return numbers;
  };

  const handleSendTest = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Número obrigatório",
        description: "Digite um número de telefone para enviar o teste.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    setLastResult(null);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      const invokeWithBearer = async (bearerToken: string) => {
        return supabase.functions.invoke("send-whatsapp", {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
          body: {
            to: formattedPhone,
            message: testMessage,
          },
        });
      };

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const primaryBearer = session?.access_token || SUPABASE_CONFIG.anonKey;
      let { data, error } = await invokeWithBearer(primaryBearer);

      const errorBody = (error as any)?.context?.body;
      const isInvalidJwt =
        typeof errorBody === "string" &&
        (errorBody.includes("Invalid JWT") || errorBody.includes('"Invalid JWT"'));

      if (error && isInvalidJwt && primaryBearer !== SUPABASE_CONFIG.anonKey) {
        ({ data, error } = await invokeWithBearer(SUPABASE_CONFIG.anonKey));
      }

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || "Erro ao enviar mensagem");
      }

      setLastResult({
        success: true,
        message: "Mensagem enviada com sucesso!",
        timestamp: new Date(),
      });

      toast({
        title: "Teste enviado!",
        description: "A mensagem de teste foi enviada com sucesso.",
      });
    } catch (error: any) {
      console.error("Error sending test:", error);
      setLastResult({
        success: false,
        message: error.message || "Erro ao enviar mensagem",
        timestamp: new Date(),
      });

      toast({
        title: "Erro no envio",
        description: error.message || "Não foi possível enviar a mensagem de teste.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Smartphone className="h-4 w-4" />
          Testar Envio de Notificação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="test-phone">Número do WhatsApp</Label>
            <Input
              id="test-phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Digite o número com DDD. O código do país (55) será adicionado automaticamente.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-message">Mensagem de Teste</Label>
            <textarea
              id="test-message"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            {lastResult && (
              <div className="flex items-center gap-2">
                {lastResult.success ? (
                  <Badge className="bg-success/10 text-success border-success/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Sucesso
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Falha
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {lastResult.timestamp.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>

          <Button onClick={handleSendTest} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1.5" />
                Enviar Teste
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
