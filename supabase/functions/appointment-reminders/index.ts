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

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`🔍 Buscando consultas para: ${tomorrowStr}`);

    // Fetch appointments for tomorrow
    const { data: appointments, error } = await supabase
      .from('vl_clinic_core_appointments')
      .select(`
        appointment_id,
        appointment_date,
        appointment_start_time,
        patient_id,
        professional_id,
        vl_clinic_core_patients!inner (
          patient_id,
          full_name,
          phone_main
        ),
        vl_clinic_core_professionals!inner (
          full_name
        )
      `)
      .eq('appointment_date', tomorrowStr)
      .in('status', ['scheduled', 'confirmed']);

    if (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }

    console.log(`📋 Encontradas ${appointments?.length || 0} consultas para amanhã`);

    const results: any[] = [];

    for (const appointment of appointments || []) {
      const patient = appointment.vl_clinic_core_patients as any;
      const professional = appointment.vl_clinic_core_professionals as any;

      if (!patient?.phone_main) {
        console.log(`⚠️ Paciente ${patient?.full_name} sem telefone cadastrado`);
        continue;
      }

      const formattedTime = appointment.appointment_start_time?.substring(0, 5) || '';
      const formattedDate = new Date(appointment.appointment_date + 'T12:00:00').toLocaleDateString('pt-BR');

      const message = `🏥 *Lembrete de Consulta*\n\n` +
        `Olá ${patient.full_name}!\n\n` +
        `Lembramos que você tem uma consulta agendada:\n\n` +
        `📅 *Data:* ${formattedDate}\n` +
        `⏰ *Horário:* ${formattedTime}\n` +
        `👨‍⚕️ *Profissional:* ${professional?.full_name || 'Não informado'}\n\n` +
        `Por favor, chegue com 15 minutos de antecedência.\n\n` +
        `Em caso de impossibilidade, entre em contato para remarcar.\n\n` +
        `_Vltra Clinic Pro_`;

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
          console.log(`✅ Lembrete enviado para ${patient.full_name}`);
          results.push({ patient: patient.full_name, status: 'sent', response: responseData });
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
        date: tomorrowStr,
        totalAppointments: appointments?.length || 0,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error in appointment-reminders:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
