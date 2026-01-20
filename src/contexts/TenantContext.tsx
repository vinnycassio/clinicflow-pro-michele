import React, { createContext, useContext, useEffect, useState } from 'react';
import { getTenantFromHostname, validateTenant, TenantConfig } from '@/config/tenants.config';

interface TenantContextValue {
  tenant: TenantConfig | null;
  isLoading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeTenant = () => {
      try {
        const hostname = window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        console.log('🔍 Detectando tenant para:', hostname);
        
        const tenantConfig = getTenantFromHostname(hostname);
        
        if (!tenantConfig) {
          console.error('❌ Tenant não encontrado para:', hostname);
          setError(`Domínio não configurado: ${hostname}`);
          setIsLoading(false);
          return;
        }
        
        if (!validateTenant(tenantConfig)) {
          console.error('❌ Configuração inválida para tenant:', tenantConfig.tenantId);
          setError('Configuração de cliente inválida. Verifique as variáveis de ambiente.');
          setIsLoading(false);
          return;
        }
        
        console.log('✅ Tenant identificado:', tenantConfig.tenantId);
        console.log('🎨 Aplicando branding:', tenantConfig.branding);
        
        // Aplicar cores
        document.documentElement.style.setProperty('--primary-color', tenantConfig.branding.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', tenantConfig.branding.secondaryColor);
        document.documentElement.style.setProperty('--accent-color', tenantConfig.branding.accentColor);
        
        // Atualizar título
        document.title = tenantConfig.clinicName;
        
        setTenant(tenantConfig);
        setIsLoading(false);
        
      } catch (err) {
        console.error('❌ Erro ao inicializar tenant:', err);
        setError('Erro ao carregar configurações');
        setIsLoading(false);
      }
    };
    
    initializeTenant();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro de Configuração</h1>
          <p className="text-gray-600 mb-4">{error || 'Não foi possível identificar a clínica.'}</p>
          <p className="text-sm text-gray-500">Verifique as variáveis de ambiente (.env.local)</p>
        </div>
      </div>
    );
  }

  return (
    <TenantContext.Provider value={{ tenant, isLoading, error }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant deve ser usado dentro de TenantProvider');
  }
  if (!context.tenant) {
    throw new Error('Tenant não está configurado');
  }
  return context.tenant;
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenantContext deve ser usado dentro de TenantProvider');
  }
  return context;
}