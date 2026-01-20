// VLTRA Clinic Pro - Supabase Client
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { SUPABASE_CONFIG } from './supabase.config';

// Tentar usar variáveis de ambiente primeiro, depois fallback para config
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_CONFIG.url;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey;

console.log('🔌 Inicializando cliente Supabase...');
console.log('📍 URL:', supabaseUrl);

// Criar cliente tipado
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
});

// Verificar se está configurado
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://wboumcppekffsqzyqmqd.supabase.co' &&
    supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indib3VtY3BwZWtmZnNxenlxbXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NTY4OTIsImV4cCI6MjA4NDQzMjg5Mn0.erMs3Cy0RE4aLNOXFhrEow4GOEDgZcZnhkbL3Cdb2a8'
  );
};

// Testar conexão
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testando conexão com Supabase...');
    
    const { data, error } = await supabase
      .from('vl_clinic_core_patients')
      .select('patient_id')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      console.error('Detalhes:', error);
      return false;
    }
    
    console.log('✅ Conectado ao Supabase com sucesso!');
    console.log('📊 Teste de query funcionou');
    return true;
    
  } catch (error: any) {
    console.error('❌ Erro ao testar conexão:', error.message);
    return false;
  }
};

// Testar conexão ao inicializar (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  export const debugAuth = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  console.log('👤 Usuário atual:', user);
  console.log('🔑 Auth user ID:', user?.id);
  
  if (user) {
    // Verificar se existe em vl_clinic_core_users
    const { data: userData, error: userError } = await supabase
      .from('vl_clinic_core_users')
      .select('id, email, clinic_id')
      .eq('auth_user_id', user.id)
      .single();
    
    console.log('📋 Dados do usuário em vl_clinic_core_users:', userData);
    console.log('❌ Erro ao buscar usuário:', userError);
  }
};
  testSupabaseConnection();
}
