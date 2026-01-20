import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';



const addClinicId = async (data: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const { data: userData } = await supabase
    .from('vl_clinic_core_users')
    .select('clinic_id')
    .eq('auth_user_id', user.id)
    .single();

  if (!userData?.clinic_id) {
    throw new Error('Clínica não encontrada para o usuário');
  }

  return {
    ...data,
    clinic_id: userData.clinic_id
  };
};


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
  patient?: {
    patient_id: string;
    full_name: string;
    phone_main?: string;
    email?: string;
  };
  professional?: {
    professional_id: string;
    full_name: string;
    specialty?: string;
  };
}

export interface MedicalRecordInsert {
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
}

export const useMedicalRecords = (patientId?: string) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Buscando prontuários...');
      
      let query = supabase
        .from('vl_clinic_medical_records')
        .select('*')
        .order('record_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error: fetchError } = await query;

      console.log('📊 Prontuários encontrados:', {
        total: data?.length,
        dados: data,
        erro: fetchError,
      });

      if (fetchError) throw fetchError;
      setRecords((data || []) as MedicalRecord[]);
      console.log('✅ Prontuários carregados:', data?.length || 0);
    } catch (err: any) {
      console.error('❌ Erro ao carregar prontuários:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRecordById = async (id: string): Promise<MedicalRecord | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('vl_clinic_medical_records')
        .select('*')
        .eq('record_id', id)
        .single();

      if (fetchError) throw fetchError;
      return data as MedicalRecord;
    } catch (err: any) {
      console.error('Erro ao buscar prontuário:', err);
      setError(err.message);
      return null;
    }
  };

  const createRecord = async (record: MedicalRecordInsert): Promise<MedicalRecord | null> => {
    try {
      console.log('📝 Criando prontuário...', record);
      
      const { data, error: insertError } = await supabase
        .from('vl_clinic_medical_records')
        .insert([record as any])
        .select('*')
        .single();

      if (insertError) {
        console.error('❌ Erro ao criar:', insertError);
        throw insertError;
      }
      
      console.log('✅ Prontuário criado:', data);
      await fetchRecords();
      return data as MedicalRecord;
    } catch (err: any) {
      console.error('❌ Erro ao criar prontuário:', err);
      setError(err.message);
      return null;
    }
  };

  const updateRecord = async (id: string, updates: Partial<MedicalRecordInsert>): Promise<MedicalRecord | null> => {
    try {
      console.log('📝 Atualizando prontuário...', id, updates);
      
      const { data, error: updateError } = await supabase
        .from('vl_clinic_medical_records')
        .update(updates as any)
        .eq('record_id', id)
        .select('*')
        .single();

      if (updateError) throw updateError;
      
      console.log('✅ Prontuário atualizado:', data);
      await fetchRecords();
      return data as MedicalRecord;
    } catch (err: any) {
      console.error('❌ Erro ao atualizar prontuário:', err);
      setError(err.message);
      return null;
    }
  };

  const deleteRecord = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('vl_clinic_medical_records')
        .delete()
        .eq('record_id', id);

      if (deleteError) throw deleteError;
      await fetchRecords();
      return true;
    } catch (err: any) {
      console.error('❌ Erro ao deletar prontuário:', err);
      setError(err.message);
      return false;
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
    getRecordById,
    createRecord,
    updateRecord,
    deleteRecord,
  };
};
