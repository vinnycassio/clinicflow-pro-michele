import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Patient, PatientInsert, PatientUpdate } from "@/types/database";

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("vl_clinic_core_patients")
        .select("*")
        .eq("status", "active")
        .order("full_name", { ascending: true });

      if (fetchError) throw fetchError;
      setPatients((data as Patient[]) || []);
    } catch (err: any) {
      console.error("Error fetching patients:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPatientById = async (id: string): Promise<Patient | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from("vl_clinic_core_patients")
        .select("*")
        .eq("patient_id", id)
        .single();

      if (fetchError) throw fetchError;
      return (data as Patient) ?? null;
    } catch (err: any) {
      console.error("Error fetching patient:", err);
      setError(err.message);
      return null;
    }
  };
  
  const createPatient = async (patient: PatientInsert): Promise<Patient | null> => {
    try {
      // Buscar clinic_id do usuário logado
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
  
      // Adicionar clinic_id ao paciente
      const patientData = {
        ...patient,
        clinic_id: userData.clinic_id
      };
  
      const { data, error: insertError } = await supabase
        .from("vl_clinic_core_patients")
        .insert([patientData])
        .select()
        .single();
  
      if (insertError) throw insertError;
      await fetchPatients();
      return (data as Patient) ?? null;
    } catch (err: any) {
      console.error("Error creating patient:", err);
      setError(err.message);
      return null;
    }
  };

  const updatePatient = async (id: string, updates: PatientUpdate): Promise<Patient | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from("vl_clinic_core_patients")
        .update(updates)
        .eq("patient_id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchPatients();
      return (data as Patient) ?? null;
    } catch (err: any) {
      console.error("Error updating patient:", err);
      setError(err.message);
      return null;
    }
  };

  const deletePatient = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase.from("vl_clinic_core_patients").delete().eq("patient_id", id);

      if (deleteError) throw deleteError;
      await fetchPatients();
      return true;
    } catch (err: any) {
      console.error("Error deleting patient:", err);
      setError(err.message);
      return false;
    }
  };

  const searchPatients = async (searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: searchError } = await supabase
        .from("vl_clinic_core_patients")
        .select("*")
        .or(
          `full_name.ilike.%${searchTerm}%,phone_main.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,document_cpf.ilike.%${searchTerm}%`,
        )
        .eq("status", "active")
        .order("full_name", { ascending: true });

      if (searchError) throw searchError;
      setPatients((data as Patient[]) || []);
    } catch (err: any) {
      console.error("Error searching patients:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient,
    searchPatients,
  };
};

// Exportar hooks individuais para compatibilidade com código existente
export const useCreatePatient = () => {
  const { createPatient, error } = usePatients();

  return {
    mutate: createPatient,
    error,
    isLoading: false,
  };
};

export const useDeletePatient = () => {
  const { deletePatient, error } = usePatients();

  return {
    mutate: deletePatient,
    error,
    isLoading: false,
  };
};
