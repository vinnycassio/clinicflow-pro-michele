import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface MedicalRecord {
  record_id: string;
  patient_id: string;
  professional_id: string;
  appointment_id?: string;
  record_date: string;
  record_type: string;
  chief_complaint?: string;
  subjective_soap?: string;
  objective_soap?: string;
  assessment_soap?: string;
  plan_soap?: string;
  prescriptions?: any;
  recommendations?: string;
  next_appointment_notes?: string;
  created_at: string;
  updated_at: string;
}

export const useMedicalRecords = (patientId?: string) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('vl_clinic_medical_records')
        .select(`
          *,
          patient:vl_clinic_core_patients(patient_id, full_name),
          professional:vl_clinic_core_professionals(professional_id, full_name)
        `)
        .order('record_date', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setRecords(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar prontuários:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createRecord = async (record: Partial<MedicalRecord>): Promise<MedicalRecord | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('vl_clinic_medical_records')
        .insert([record])
        .select()
        .single();

      if (insertError) throw insertError;
      await fetchRecords();
      return data;
    } catch (err: any) {
      console.error('Erro ao criar prontuário:', err);
      setError(err.message);
      return null;
    }
  };

  const updateRecord = async (id: string, updates: Partial<MedicalRecord>): Promise<MedicalRecord | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from('vl_clinic_medical_records')
        .update(updates)
        .eq('record_id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchRecords();
      return data;
    } catch (err: any) {
      console.error('Erro ao atualizar prontuário:', err);
      setError(err.message);
      return null;
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [patientId]);

  return {
    records,
    loading,
    error,
    fetchRecords,
    createRecord,
    updateRecord,
  };
};
