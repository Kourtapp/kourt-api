// supabase/functions/verify-otp/index.ts
// @ts-nocheck - Deno runtime
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: 'Telefone e código são obrigatórios' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Criar cliente Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Buscar código mais recente não verificado
    const { data: verification, error: fetchError } = await supabase
      .from('verification_logs')
      .select('*')
      .eq('phone', phone)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !verification) {
      return new Response(
        JSON.stringify({
          verified: false,
          error: 'Código expirado ou não encontrado',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Verificar código
    if (verification.code !== code) {
      // Incrementar tentativas
      await supabase
        .from('verification_logs')
        .update({ attempts: (verification.attempts || 0) + 1 })
        .eq('id', verification.id);

      // Verificar máximo de tentativas
      if ((verification.attempts || 0) >= 2) {
        await supabase
          .from('verification_logs')
          .update({ verified: false, expires_at: new Date().toISOString() })
          .eq('id', verification.id);

        return new Response(
          JSON.stringify({
            verified: false,
            error: 'Muitas tentativas incorretas. Solicite um novo código.',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({
          verified: false,
          error: 'Código incorreto',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Marcar como verificado
    await supabase
      .from('verification_logs')
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq('id', verification.id);

    return new Response(
      JSON.stringify({
        verified: true,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
