import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SUPABASE_CONFIG } from '@/lib/supabase.config';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SendNotificationResult {
  success: boolean;
  error?: string;
}

// Formatar número de telefone para WhatsApp (Brasil)
const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '');
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }
  return cleaned;
};

// Formatar valor em moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const useWhatsAppNotification = () => {
  const [sending, setSending] = useState(false);

  // Enviar mensagem genérica
  const sendMessage = async (phone: string, message: string): Promise<SendNotificationResult> => {
    if (!phone) {
      return { success: false, error: 'Telefone não informado' };
    }

    setSending(true);
    try {
      const formattedPhone = formatPhoneNumber(phone);

      const invokeWithBearer = async (bearerToken: string) => {
        return supabase.functions.invoke('send-whatsapp', {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
          body: {
            to: formattedPhone,
            message,
          },
        });
      };

      // 1) tenta com o JWT do usuário (quando disponível)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const primaryBearer = session?.access_token || SUPABASE_CONFIG.anonKey;
      let { data, error } = await invokeWithBearer(primaryBearer);

      // 2) fallback: alguns projetos retornam "Invalid JWT" para o access_token (assinatura/keys).
      // Nesses casos, usar anonKey como Bearer mantém a função acessível (a função não depende de auth).
      const errorBody = (error as any)?.context?.body;
      const isInvalidJwt =
        typeof errorBody === 'string' &&
        (errorBody.includes('Invalid JWT') || errorBody.includes('"Invalid JWT"'));

      if (error && !primaryBearer.includes('.') && !isInvalidJwt) {
        // bearer já era anonKey (sem motivo para retry)
      } else if (error && isInvalidJwt && primaryBearer !== SUPABASE_CONFIG.anonKey) {
        ({ data, error } = await invokeWithBearer(SUPABASE_CONFIG.anonKey));
      }

      if (error) {
        console.error('Erro ao enviar WhatsApp:', error);
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        return { success: false, error: data?.error || 'Erro desconhecido' };
      }

      return { success: true };
    } catch (err: any) {
      console.error('Erro ao enviar WhatsApp:', err);
      return { success: false, error: err.message };
    } finally {
      setSending(false);
    }
  };

  // Enviar lembrete de agendamento
  const sendAppointmentReminder = async (appointment: {
    patient?: { full_name?: string; phone_main?: string };
    professional?: { full_name?: string };
    appointment_date: string;
    appointment_start_time: string;
    service_type?: string;
  }): Promise<SendNotificationResult> => {
    const patientName = appointment.patient?.full_name || 'Paciente';
    const phone = appointment.patient?.phone_main;
    
    if (!phone) {
      toast.error('Paciente não possui telefone cadastrado');
      return { success: false, error: 'Telefone não cadastrado' };
    }

    const appointmentDate = format(
      new Date(appointment.appointment_date),
      "dd 'de' MMMM",
      { locale: ptBR }
    );
    const appointmentTime = appointment.appointment_start_time.slice(0, 5);
    const professionalName = appointment.professional?.full_name || 'nosso profissional';
    const serviceType = appointment.service_type || 'consulta';

    const message = `📅 *Lembrete de Agendamento*

Olá, ${patientName}!

Gostaríamos de confirmar seu agendamento:

📆 *Data:* ${appointmentDate}
⏰ *Horário:* ${appointmentTime}
👨‍⚕️ *Profissional:* ${professionalName}
📋 *Serviço:* ${serviceType}

Por favor, confirme sua presença respondendo esta mensagem.

_Vltra Clinic Pro_`;

    const result = await sendMessage(phone, message);
    
    if (result.success) {
      toast.success('Lembrete enviado com sucesso!');
    } else {
      toast.error(`Erro ao enviar: ${result.error}`);
    }
    
    return result;
  };

  // Enviar lembrete de pagamento
  const sendPaymentReminder = async (payment: {
    amount: number;
    due_date: string;
    payment_method: string;
    sale?: {
      sale_number?: string;
      patient?: { full_name?: string; phone_main?: string };
    };
  }): Promise<SendNotificationResult> => {
    const patientName = payment.sale?.patient?.full_name || 'Paciente';
    const phone = payment.sale?.patient?.phone_main;
    
    if (!phone) {
      toast.error('Paciente não possui telefone cadastrado');
      return { success: false, error: 'Telefone não cadastrado' };
    }

    const dueDate = format(new Date(payment.due_date), "dd/MM/yyyy");
    const amount = formatCurrency(Number(payment.amount || 0));
    const saleNumber = payment.sale?.sale_number || '';

    const message = `💰 *Lembrete de Pagamento*

Olá, ${patientName}!

Gostaríamos de lembrá-lo sobre o pagamento:

📄 *Venda:* ${saleNumber}
💵 *Valor:* ${amount}
📅 *Vencimento:* ${dueDate}

Entre em contato para mais informações.

_Vltra Clinic Pro_`;

    const result = await sendMessage(phone, message);
    
    if (result.success) {
      toast.success('Lembrete de pagamento enviado!');
    } else {
      toast.error(`Erro ao enviar: ${result.error}`);
    }
    
    return result;
  };

  // Enviar aviso de pagamento em atraso
  const sendOverdueNotice = async (payment: {
    amount: number;
    due_date: string;
    payment_method: string;
    sale?: {
      sale_number?: string;
      patient?: { full_name?: string; phone_main?: string };
    };
  }): Promise<SendNotificationResult> => {
    const patientName = payment.sale?.patient?.full_name || 'Paciente';
    const phone = payment.sale?.patient?.phone_main;
    
    if (!phone) {
      toast.error('Paciente não possui telefone cadastrado');
      return { success: false, error: 'Telefone não cadastrado' };
    }

    const dueDate = format(new Date(payment.due_date), "dd/MM/yyyy");
    const amount = formatCurrency(Number(payment.amount || 0));
    const saleNumber = payment.sale?.sale_number || '';

    const message = `⚠️ *Aviso de Pagamento em Atraso*

Olá, ${patientName}!

Identificamos um pagamento pendente em sua conta:

📄 *Venda:* ${saleNumber}
💵 *Valor:* ${amount}
📅 *Vencimento:* ${dueDate} *(vencido)*

Por favor, entre em contato para regularizar sua situação.

_Vltra Clinic Pro_`;

    const result = await sendMessage(phone, message);
    
    if (result.success) {
      toast.success('Aviso de atraso enviado!');
    } else {
      toast.error(`Erro ao enviar: ${result.error}`);
    }
    
    return result;
  };

  return {
    sending,
    sendMessage,
    sendAppointmentReminder,
    sendPaymentReminder,
    sendOverdueNotice,
  };
};
