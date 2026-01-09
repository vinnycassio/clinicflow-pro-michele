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
      setPatients(data || []);
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
      return data;
    } catch (err: any) {
      console.error("Error fetching patient:", err);
      setError(err.message);
      return null;
    }
  };

  const createPatient = async (patient: PatientInsert): Promise<Patient | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from("vl_clinic_core_patients")
        .insert(patient)
        .select()
        .single();

      if (insertError) throw insertError;
      await fetchPatients();
      return data;
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
      return data;
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
      setPatients(data || []);
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
