/**
 * SUPABASE CLIENT - MULTI-TENANT
 * 
 * Cliente Supabase dinâmico que se conecta ao banco correto
 * baseado no tenant atual.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useTenant } from '@/contexts/TenantContext';
import { useMemo } from 'react';

/**
 * Hook para obter cliente Supabase do tenant atual
 * 
 * @example
 * const supabase = useSupabaseClient();
 * const { data } = await supabase.from('pacientes').select('*');
 */
export function useSupabaseClient(): SupabaseClient {
  const tenant = useTenant();
  
  const supabase = useMemo(() => {
    if (!tenant.supabase.url || !tenant.supabase.anonKey) {
      throw new Error(
        `Configuração Supabase inválida para tenant: ${tenant.tenantId}`
      );
    }
    
    console.log('🔌 Conectando ao Supabase:', {
      tenant: tenant.tenantId,
      url: tenant.supabase.url,
    });
    
    return createClient(
      tenant.supabase.url,
      tenant.supabase.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    );
  }, [tenant]);
  
  return supabase;
}

/**
 * Cria cliente Supabase para um tenant específico
 * Útil em contextos fora de componentes React
 * 
 * @example
 * const supabase = createTenantSupabaseClient('michele-lucena');
 */
export function createTenantSupabaseClient(
  tenantId: string,
  supabaseUrl: string,
  supabaseKey: string
): SupabaseClient {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
