import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Patient } from '@/types/database';

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vl_clinic_core_patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Patient[];
    },
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vl_clinic_core_patients')
        .select('*')
        .eq('patient_id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Patient | null;
    },
    enabled: !!id,
  });
}

export interface CreatePatientData {
  full_name: string;
  social_name?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  document_cpf?: string | null;
  document_rg?: string | null;
  phone_main?: string | null;
  phone_secondary?: string | null;
  email?: string | null;
  status?: string;
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patient: CreatePatientData) => {
      const { data, error } = await supabase
        .from('vl_clinic_core_patients')
        .insert(patient)
        .select()
        .single();

      if (error) throw error;
      return data as Patient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ patient_id, ...updates }: Partial<Patient> & { patient_id: string }) => {
      const { data, error } = await supabase
        .from('vl_clinic_core_patients')
        .update(updates)
        .eq('patient_id', patient_id)
        .select()
        .single();

      if (error) throw error;
      return data as Patient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patient_id: string) => {
      const { error } = await supabase
        .from('vl_clinic_core_patients')
        .delete()
        .eq('patient_id', patient_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
