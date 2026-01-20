// ============================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================
export const SUPABASE_CONFIG = {
  // Project URL
  url: 'https://wboumcppekffsqzyqmqd.supabase.co',
  
  // Project API Keys > anon/public
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indib3VtY3BwZWtmZnNxenlxbXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NTY4OTIsImV4cCI6MjA4NDQzMjg5Mn0.erMs3Cy0RE4aLNOXFhrEow4GOEDgZcZnhkbL3Cdb2a8',
} as const;

// Log de sucesso
console.log('✅ Configuração do Supabase carregada');
console.log('📍 URL:', SUPABASE_CONFIG.url);
console.log('🔑 Key:', SUPABASE_CONFIG.anonKey.substring(0, 20) + '...');
