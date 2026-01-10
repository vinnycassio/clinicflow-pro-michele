import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Treatment {
  treatment_id: string;
  patient_id: string;
  protocol_id?: string;
  professional_id: string;
  treatment_name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status: string;
  total_sessions?: number;
  completed_sessions?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useTreatments = (patientId?: string) => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('vl_clinic_patient_treatments')
        .select(`
          *,
          patient:vl_clinic_core_patients(patient_id, full_name),
          professional:vl_clinic_core_professionals(professional_id, full_name),
          protocol:vl_clinic_treatment_protocols(protocol_id, protocol_name)
        `)
        .order('start_date', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setTreatments(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar tratamentos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTreatment = async (treatment: Partial<Treatment>): Promise<Treatment | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('vl_clinic_patient_treatments')
        .insert([treatment])
        .select()
        .single();

      if (insertError) throw insertError;
      await fetchTreatments();
      return data;
    } catch (err: any) {
      console.error('Erro ao criar tratamento:', err);
      setError(err.message);
      return null;
    }
  };

  const updateTreatment = async (id: string, updates: Partial<Treatment>): Promise<Treatment | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from('vl_clinic_patient_treatments')
        .update(updates)
        .eq('treatment_id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchTreatments();
      return data;
    } catch (err: any) {
      console.error('Erro ao atualizar tratamento:', err);
      setError(err.message);
      return null;
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, [patientId]);

  return {
    treatments,
    loading,
    error,
    fetchTreatments,
    createTreatment,
    updateTreatment,
  };
};
