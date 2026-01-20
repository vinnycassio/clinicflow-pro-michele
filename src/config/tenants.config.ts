export interface TenantConfig {
  tenantId: string;
  clinicName: string;
  domain: string;
  
  supabase: {
    url: string;
    anonKey: string;
  };
  
  branding: {
    logo: string;
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    favicon: string;
  };
  
  features: {
    whatsappEnabled: boolean;
    whatsappNumber?: string;
    googleCalendarEnabled: boolean;
    n8nEnabled: boolean;
    n8nWebhookUrl?: string;
    emailEnabled: boolean;
    smsEnabled: boolean;
  };
  
  publicSiteUrl: string;
  supportEmail: string;
  supportPhone: string;
}

export const TENANTS: Record<string, TenantConfig> = {
  'app.michelefono.com.br': {
    tenantId: 'michele-lucena',
    clinicName: 'Michele Lucena - Fonoaudiologia',
    domain: 'app.michelefono.com.br',
    
    supabase: {
      url: import.meta.env.VITE_MICHELE_SUPABASE_URL || '',
      anonKey: import.meta.env.VITE_MICHELE_SUPABASE_ANON_KEY || '',
    },
    
    branding: {
      logo: 'Michele Lucena',
      primaryColor: '#64D9C6',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B',
      favicon: '/favicon.ico',
    },
    
    features: {
      whatsappEnabled: true,
      whatsappNumber: '5511963851167',
      googleCalendarEnabled: true,
      n8nEnabled: true,
      n8nWebhookUrl: import.meta.env.VITE_MICHELE_N8N_WEBHOOK_URL,
      emailEnabled: true,
      smsEnabled: false,
    },
    
    publicSiteUrl: 'https://michelefono.com.br',
    supportEmail: 'contato@michelefono.com.br',
    supportPhone: '(11) 96385-1167',
  },
  
  'localhost:8080': {
    tenantId: 'dev-local',
    clinicName: 'VLTRA Clinic - Dev',
    domain: 'localhost:8080',
    
    supabase: {
      url: import.meta.env.VITE_DEV_SUPABASE_URL || '',
      anonKey: import.meta.env.VITE_DEV_SUPABASE_ANON_KEY || '',
    },
    
    branding: {
      logo: 'VLTRA Dev',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B',
      favicon: '/favicon.ico',
    },
    
    features: {
      whatsappEnabled: true,
      googleCalendarEnabled: true,
      n8nEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
    },
    
    publicSiteUrl: 'http://localhost:8080',
    supportEmail: 'dev@vltraclinic.com',
    supportPhone: '(00) 0000-0000',
  },
};

export function getTenantFromHostname(hostname: string): TenantConfig | null {
  if (TENANTS[hostname]) {
    return TENANTS[hostname];
  }
  
  const tenant = Object.values(TENANTS).find(t => t.domain === hostname);
  return tenant || null;
}

export function validateTenant(tenant: TenantConfig | null): boolean {
  if (!tenant) return false;
  return !!(tenant.supabase.url && tenant.supabase.anonKey);
}