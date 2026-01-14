import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppRequest {
  phone: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');

    if (!evolutionApiUrl || !evolutionApiKey) {
      console.error('Missing Evolution API credentials');
      throw new Error('Evolution API credentials not configured');
    }

    const { phone, message }: WhatsAppRequest = await req.json();

    if (!phone || !message) {
      throw new Error('Phone and message are required');
    }

    // Format phone number (remove non-digits and ensure country code)
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone;
    }

    console.log(`📱 Sending WhatsApp to: ${formattedPhone}`);
    console.log(`📝 Message: ${message.substring(0, 50)}...`);

    // Send message via Evolution API
    const response = await fetch(`${evolutionApiUrl}/message/sendText/default`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey,
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: message,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Evolution API error:', responseData);
      throw new Error(`Evolution API error: ${JSON.stringify(responseData)}`);
    }

    console.log('✅ WhatsApp sent successfully:', responseData);

    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error sending WhatsApp:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
