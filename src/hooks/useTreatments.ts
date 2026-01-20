import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Helper para adicionar clinic_id automaticamente
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


// Helper para limpar campos vazios de UUID
const cleanUuidFields = (data: any) => {
  const cleaned = { ...data };
  
  // Converter strings vazias em null para campos UUID opcionais
  if (cleaned.protocol_id === '') cleaned.protocol_id = null;
  if (cleaned.end_date === '') cleaned.end_date = null;
  
  return cleaned;
};


export interface TreatmentProtocol {
  protocol_id: string;
  protocol_name: string;
  description?: string;
  category?: string;
  estimated_sessions?: number;
  estimated_duration_days?: number;
  default_interval_days?: number;
  instructions?: string;
  contraindications?: string;
  expected_results?: string;
  is_active: boolean;
  created_at: string;
}

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
  session_interval_days?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: {
    patient_id: string;
    full_name: string;
    phone_main?: string;
  };
  professional?: {
    professional_id: string;
    full_name: string;
    specialty?: string;
  };
  protocol?: {
    protocol_id: string;
    protocol_name: string;
    category?: string;
  };
}

export interface TreatmentInsert {
  patient_id: string;
  professional_id: string;
  protocol_id?: string;
  treatment_name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status?: string;
  total_sessions?: number;
  completed_sessions?: number;
  session_interval_days?: number;
  notes?: string;
}

export const useTreatments = (patientId?: string) => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [protocols, setProtocols] = useState<TreatmentProtocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Buscando tratamentos...');
      
      let query = supabase
        .from('vl_clinic_patient_treatments')
        .select('*')
        .order('start_date', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error: fetchError } = await query;

      console.log('📊 Tratamentos encontrados:', {
        total: data?.length,
        dados: data,
        erro: fetchError,
      });

      if (fetchError) throw fetchError;
      setTreatments((data || []) as Treatment[]);
      console.log('✅ Tratamentos carregados:', data?.length || 0);
    } catch (err: any) {
      console.error('❌ Erro ao carregar tratamentos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProtocols = async () => {
    try {
      console.log('🔍 Buscando protocolos...');
      
      const { data, error: fetchError } = await supabase
        .from('vl_clinic_treatment_protocols')
        .select('*')
        .eq('is_active', true)
        .order('protocol_name', { ascending: true });

      if (fetchError) throw fetchError;
      setProtocols((data || []) as unknown as TreatmentProtocol[]);
      console.log('✅ Protocolos carregados:', data?.length || 0);
    } catch (err: any) {
      console.error('❌ Erro ao carregar protocolos:', err);
    }
  };

  const getTreatmentById = async (id: string): Promise<Treatment | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('vl_clinic_patient_treatments')
        .select('*')
        .eq('treatment_id', id)
        .single();

      if (fetchError) throw fetchError;
      return data as Treatment;
    } catch (err: any) {
      console.error('Erro ao buscar tratamento:', err);
      setError(err.message);
      return null;
    }
  };

const createTreatment = async (treatment: TreatmentInsert): Promise<Treatment | null> => {
  try {
    console.log('📝 Criando tratamento...', treatment);
    
    // Limpar campos vazios e adicionar clinic_id
    const cleanedData = cleanUuidFields(treatment);
    const treatmentData = await addClinicId(cleanedData);
    
    const { data, error: insertError } = await supabase
      .from('vl_clinic_patient_treatments')
      .insert([treatmentData as any])
      .select('*')
      .single();

    if (insertError) {
      console.error('❌ Erro ao criar:', insertError);
      throw insertError;
    }
    
    console.log('✅ Tratamento criado:', data);
    await fetchTreatments();
    return data as Treatment;
  } catch (err: any) {
    console.error('❌ Erro ao criar tratamento:', err);
    setError(err.message);
    return null;
  }
};

  const updateTreatment = async (id: string, updates: Partial<TreatmentInsert>): Promise<Treatment | null> => {
    try {
      console.log('📝 Atualizando tratamento...', id, updates);
      
      const { data, error: updateError } = await supabase
        .from('vl_clinic_patient_treatments')
        .update(updates as any)
        .eq('treatment_id', id)
        .select('*')
        .single();

      if (updateError) throw updateError;
      
      console.log('✅ Tratamento atualizado:', data);
      await fetchTreatments();
      return data as Treatment;
    } catch (err: any) {
      console.error('❌ Erro ao atualizar tratamento:', err);
      setError(err.message);
      return null;
    }
  };

  const completeTreatment = async (id: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('vl_clinic_patient_treatments')
        .update({
          status: 'completed',
          end_date: new Date().toISOString().split('T')[0],
        })
        .eq('treatment_id', id);

      if (updateError) throw updateError;
      await fetchTreatments();
      return true;
    } catch (err: any) {
      console.error('❌ Erro ao completar tratamento:', err);
      setError(err.message);
      return false;
    }
  };

  const cancelTreatment = async (id: string, reason?: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('vl_clinic_patient_treatments')
        .update({
          status: 'cancelled',
          end_date: new Date().toISOString().split('T')[0],
          notes: reason || '',
        })
        .eq('treatment_id', id);

      if (updateError) throw updateError;
      await fetchTreatments();
      return true;
    } catch (err: any) {
      console.error('❌ Erro ao cancelar tratamento:', err);
      setError(err.message);
      return false;
    }
  };

  const deleteTreatment = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('vl_clinic_patient_treatments')
        .delete()
        .eq('treatment_id', id);

      if (deleteError) throw deleteError;
      await fetchTreatments();
      return true;
    } catch (err: any) {
      console.error('❌ Erro ao deletar tratamento:', err);
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    fetchTreatments();
    fetchProtocols();
  }, [patientId]);

  return {
    treatments,
    protocols,
    loading,
    error,
    fetchTreatments,
    fetchProtocols,
    getTreatmentById,
    createTreatment,
    updateTreatment,
    completeTreatment,
    cancelTreatment,
    deleteTreatment,
  };
};
