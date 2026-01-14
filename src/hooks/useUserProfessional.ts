import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Professional {
  professional_id: string;
  full_name: string;
  user_id: string | null;
}

export const useUserProfessional = () => {
  const { user, hasRole } = useAuth();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfessional = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      // If user is admin or receptionist, they don't need a professional link
      if (hasRole('admin') || hasRole('receptionist')) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('vl_clinic_core_professionals')
          .select('professional_id, full_name, user_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user professional:', error);
        }

        setProfessional(data);
      } catch (error) {
        console.error('Error fetching user professional:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessional();
  }, [user?.id, hasRole]);

  // Get the professional ID to use for filtering
  // Returns undefined for admin/receptionist (see all), or the professional_id for professionals
  const getProfessionalFilter = (): string | undefined => {
    if (hasRole('admin') || hasRole('receptionist')) {
      return undefined; // See all
    }
    return professional?.professional_id;
  };

  // Check if user can see all professionals' data
  const canSeeAllProfessionals = (): boolean => {
    return hasRole('admin') || hasRole('receptionist');
  };

  return {
    professional,
    loading,
    getProfessionalFilter,
    canSeeAllProfessionals,
  };
};
