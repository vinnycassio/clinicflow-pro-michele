import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AppRole } from "@/types/auth";

export interface SystemUser {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: AppRole;
  linked_professional_id: string | null;
  linked_professional_name: string | null;
  created_at: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role: AppRole;
  professional_id?: string | null;
}

export const useUsers = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Fetch professionals to get links
      const { data: professionals, error: profError } = await supabase
        .from('vl_clinic_core_professionals')
        .select('professional_id, full_name, user_id')
        .not('user_id', 'is', null);

      if (profError) throw profError;

      // Combine the data
      const combinedUsers: SystemUser[] = (profiles || []).map((profile: any) => {
        const userRole = (roles as any[])?.find((r) => r.user_id === profile.id);
        const linkedProfessional = (professionals as any[])?.find((p) => p.user_id === profile.id);

        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          role: userRole?.role || 'receptionist',
          linked_professional_id: linkedProfessional?.professional_id || null,
          linked_professional_name: linkedProfessional?.full_name || null,
          created_at: profile.created_at,
        };
      });

      setUsers(combinedUsers);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: AppRole): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (updateError) throw updateError;
      await fetchUsers();
      return true;
    } catch (err: any) {
      console.error('Error updating user role:', err);
      setError(err.message);
      return false;
    }
  };

  const linkUserToProfessional = async (userId: string, professionalId: string | null): Promise<boolean> => {
    try {
      if (professionalId) {
        // First, unlink any existing user from this professional
        await supabase
          .from('vl_clinic_core_professionals')
          .update({ user_id: null })
          .eq('professional_id', professionalId);

        // Then link the new user
        const { error: linkError } = await supabase
          .from('vl_clinic_core_professionals')
          .update({ user_id: userId })
          .eq('professional_id', professionalId);

        if (linkError) throw linkError;
      } else {
        // Unlink user from any professional
        const { error: unlinkError } = await supabase
          .from('vl_clinic_core_professionals')
          .update({ user_id: null })
          .eq('user_id', userId);

        if (unlinkError) throw unlinkError;
      }

      await fetchUsers();
      return true;
    } catch (err: any) {
      console.error('Error linking user to professional:', err);
      setError(err.message);
      return false;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      // First unlink from professional if exists
      await supabase
        .from('vl_clinic_core_professionals')
        .update({ user_id: null })
        .eq('user_id', userId);

      // Delete role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Delete profile
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (deleteError) throw deleteError;

      await fetchUsers();
      return true;
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUserRole,
    linkUserToProfessional,
    deleteUser,
  };
};
