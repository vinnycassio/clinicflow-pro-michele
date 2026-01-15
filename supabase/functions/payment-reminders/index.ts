import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');
    const instanceName = Deno.env.get('EVOLUTION_INSTANCE_NAME') || 'default';

    if (!evolutionApiUrl || !evolutionApiKey) {
      throw new Error('Evolution API credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get dates for reminders (today + 3 days ahead for upcoming, past dates for overdue)
    const today = new Date();
    const threeDaysAhead = new Date();
    threeDaysAhead.setDate(today.getDate() + 3);
    
    const todayStr = today.toISOString().split('T')[0];
    const threeDaysAheadStr = threeDaysAhead.toISOString().split('T')[0];

    console.log(`🔍 Buscando pagamentos pendentes...`);

    // Fetch pending payments with patient info through sales
    const { data: payments, error } = await supabase
      .from('vl_fin_payments')
      .select(`
        payment_id,
        amount,
        due_date,
        status,
        payment_method,
        sale:sale_id(
          sale_id,
          sale_number,
          patient:patient_id(
            patient_id,
            full_name,
            phone_main
          )
        )
      `)
      .eq('status', 'pending')
      .not('due_date', 'is', null)
      .lte('due_date', threeDaysAheadStr)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }

    console.log(`📋 Encontrados ${payments?.length || 0} pagamentos pendentes`);

    const results: any[] = [];

    for (const payment of payments || []) {
      const sale = payment.sale as any;
      const patient = sale?.patient as any;

      if (!patient?.phone_main) {
        console.log(`⚠️ Pagamento ${payment.payment_id} - paciente sem telefone cadastrado`);
        continue;
      }

      const dueDate = new Date(payment.due_date + 'T12:00:00');
      const isOverdue = dueDate < today;
      const formattedDueDate = dueDate.toLocaleDateString('pt-BR');
      const formattedAmount = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(payment.amount);

      let message: string;

      if (isOverdue) {
        message = `⚠️ *Pagamento em Atraso*\n\n` +
          `Olá ${patient.full_name}!\n\n` +
          `Identificamos um pagamento em atraso:\n\n` +
          `📋 *Venda:* #${sale?.sale_number || 'N/A'}\n` +
          `💰 *Valor:* ${formattedAmount}\n` +
          `📅 *Vencimento:* ${formattedDueDate}\n\n` +
          `Por favor, regularize o pagamento o mais breve possível para evitar inconvenientes.\n\n` +
          `Em caso de dúvidas, entre em contato conosco.\n\n` +
          `_Vltra Clinic Pro_`;
      } else {
        message = `💳 *Lembrete de Pagamento*\n\n` +
          `Olá ${patient.full_name}!\n\n` +
          `Lembramos que você tem um pagamento próximo ao vencimento:\n\n` +
          `📋 *Venda:* #${sale?.sale_number || 'N/A'}\n` +
          `💰 *Valor:* ${formattedAmount}\n` +
          `📅 *Vencimento:* ${formattedDueDate}\n\n` +
          `Evite juros e multas realizando o pagamento até a data de vencimento.\n\n` +
          `_Vltra Clinic Pro_`;
      }

      // Format phone number
      let phone = patient.phone_main.replace(/\D/g, '');
      if (!phone.startsWith('55')) {
        phone = '55' + phone;
      }

      try {
        const response = await fetch(`${evolutionApiUrl}/message/sendText/${instanceName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionApiKey,
          },
          body: JSON.stringify({
            number: phone,
            text: message,
          }),
        });

        const responseData = await response.json();

        if (response.ok) {
          console.log(`✅ Lembrete enviado para ${patient.full_name} (${isOverdue ? 'atrasado' : 'próximo'})`);
          results.push({ 
            patient: patient.full_name, 
            status: 'sent', 
            type: isOverdue ? 'overdue' : 'upcoming',
            response: responseData 
          });
        } else {
          console.error(`❌ Erro ao enviar para ${patient.full_name}:`, responseData);
          results.push({ patient: patient.full_name, status: 'error', error: responseData });
        }
      } catch (sendError: any) {
        console.error(`❌ Erro ao enviar para ${patient.full_name}:`, sendError);
        results.push({ patient: patient.full_name, status: 'error', error: sendError.message });
      }

      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalPayments: payments?.length || 0,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error in payment-reminders:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
