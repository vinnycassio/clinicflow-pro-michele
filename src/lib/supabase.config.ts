// ============================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================

export const SUPABASE_CONFIG = {
  // Project URL
  url: 'https://urqxtqfszqwbixpeeusd.supabase.co',
  
  // Project API Keys > anon/public
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycXh0cWZzenF3Yml4cGVldXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODU4OTAsImV4cCI6MjA4MzQ2MTg5MH0.TPHGDuG1gm7CJiaw7LdkRrVncX60nSZcDUEzWl0L850',
} as const;

// Log de sucesso
console.log('✅ Configuração do Supabase carregada');
console.log('📍 URL:', SUPABASE_CONFIG.url);
console.log('🔑 Key:', SUPABASE_CONFIG.anonKey.substring(0, 20) + '...');
