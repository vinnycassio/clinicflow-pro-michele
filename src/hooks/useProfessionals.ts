import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Professional {
  professional_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  license_number?: string;
  created_at: string;
  updated_at: string;
}

export const useProfessionals = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('vl_clinic_core_professionals')
        .select('*')
        .order('full_name', { ascending: true });

      if (fetchError) throw fetchError;
      setProfessionals(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar profissionais:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  return {
    professionals,
    loading,
    error,
    fetchProfessionals,
  };
};
