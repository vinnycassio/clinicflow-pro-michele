import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthUser, AppRole, UserProfile } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  authUser: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  hasPermission: (permission: string) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string, userEmail?: string): Promise<void> => {
    try {
      // Fetch profile - using any type since table may not exist yet
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle() as { data: Record<string, unknown> | null };

      // Fetch roles - using any type since table may not exist yet
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId) as { data: Array<{ role: string }> | null };

      const userRoles = roles?.map(r => r.role as AppRole) || ['receptionist'];

      const typedProfile: UserProfile | null = profile ? {
        id: String(profile.id || userId),
        full_name: String(profile.full_name || ''),
        avatar_url: profile.avatar_url ? String(profile.avatar_url) : null,
        phone: profile.phone ? String(profile.phone) : null,
        created_at: String(profile.created_at || new Date().toISOString()),
        updated_at: String(profile.updated_at || new Date().toISOString()),
      } : null;

      setAuthUser({
        id: userId,
        email: userEmail || user?.email || '',
        profile: typedProfile,
        roles: userRoles,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Set basic auth user even if profile fetch fails
      setAuthUser({
        id: userId,
        email: userEmail || user?.email || '',
        profile: null,
        roles: ['receptionist'],
      });
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer Supabase calls with setTimeout to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id, session.user.email);
          }, 0);
        } else {
          setAuthUser(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
  };

  const hasRole = (role: AppRole): boolean => {
    return authUser?.roles.includes(role) || authUser?.roles.includes('admin') || false;
  };

 const hasPermission = (permission: string): boolean => {
  if (!authUser) return false;
  
  for (const role of authUser.roles) {
    // Admin e Owner têm todas as permissões
    if (role === 'admin' || role === 'owner') return true;
    
    const permissions = {
      admin: ['all'],
      owner: ['all'],
      professional: ['appointments', 'patients', 'medical_records', 'treatments'],
      receptionist: ['appointments', 'patients', 'financial'],
      staff: ['appointments', 'patients', 'financial'],
      atendente: ['appointments', 'patients'],
    }[role];
    
    if (permissions?.includes(permission) || permissions?.includes('all')) {
      return true;
    }
  }
  
  return false;
};

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        authUser,
        loading,
        signIn,
        signUp,
        signOut,
        hasRole,
        hasPermission,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
