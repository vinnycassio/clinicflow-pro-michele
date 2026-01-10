// ============================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================
// 🔴 SUBSTITUA PELOS SEUS VALORES REAIS
// Encontre em: https://supabase.com/dashboard/project/[seu-projeto]/settings/api

export const SUPABASE_CONFIG = {
  // Project URL
  url: 'https://urqxtqfszqwbixpeeusd.supabase.co',
  
  // Project API Keys > anon/public
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycXh0cWZzenF3Yml4cGVldXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODU4OTAsImV4cCI6MjA4MzQ2MTg5MH0.TPHGDuG1gm7CJiaw7LdkRrVncX60nSZcDUEzWl0L850',
} as const;

// ============================================
// VALIDAÇÃO
// ============================================

if (SUPABASE_CONFIG.url === 'https://seu-projeto.supabase.co') {
  console.error(`
    ❌ SUPABASE NÃO CONFIGURADO!
    
    Edite o arquivo: src/lib/supabase.config.ts
    
    Substitua:
    - url: 'https://seu-projeto.supabase.co'
    - anonKey: 'sua-chave-publica-aqui'
    
    Pelos valores reais do seu projeto Supabase.
    
    Encontre suas credenciais em:
    https://supabase.com/dashboard/project/[seu-projeto]/settings/api
  `);
  
  throw new Error('Configure o Supabase em src/lib/supabase.config.ts');
}

if (SUPABASE_CONFIG.anonKey === 'sua-chave-publica-aqui') {
  console.error('❌ Configure a anonKey em src/lib/supabase.config.ts');
  throw new Error('Configure o Supabase em src/lib/supabase.config.ts');
}

// Log de sucesso
console.log('✅ Configuração do Supabase carregada');
console.log('📍 URL:', SUPABASE_CONFIG.url);
console.log('🔑 Key:', SUPABASE_CONFIG.anonKey.substring(0, 20) + '...');
