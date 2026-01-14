export type AppRole = 'admin' | 'professional' | 'receptionist';

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile | null;
  roles: AppRole[];
}

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrador',
  professional: 'Profissional',
  receptionist: 'Recepcionista',
};

export const ROLE_PERMISSIONS = {
  admin: ['all'],
  professional: ['appointments', 'patients', 'medical_records', 'treatments'],
  receptionist: ['appointments', 'patients', 'financial'],
} as const;
