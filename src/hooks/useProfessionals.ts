import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Professional } from "@/types/database";

type ProfessionalInsert = Omit<Professional, "professional_id" | "created_at" | "updated_at"> & {
  professional_id?: string;
};

type ProfessionalUpdate = Partial<Omit<Professional, "professional_id" | "created_at">>;

export const useProfessionals = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("vl_clinic_core_professionals")
        .select("*")
        .eq("is_active", true)
        .order("full_name", { ascending: true });

      if (fetchError) throw fetchError;
      setProfessionals((data as Professional[]) || []);
    } catch (err: any) {
      console.error("Error fetching professionals:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getProfessionalById = async (id: string): Promise<Professional | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from("vl_clinic_core_professionals")
        .select("*")
        .eq("professional_id", id)
        .single();

      if (fetchError) throw fetchError;
      return (data as Professional) ?? null;
    } catch (err: any) {
      console.error("Error fetching professional:", err);
      setError(err.message);
      return null;
    }
  };

  const createProfessional = async (professional: ProfessionalInsert): Promise<Professional | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from("vl_clinic_core_professionals")
        .insert([professional]) // Envolver em array
        .select()
        .single();

      if (insertError) throw insertError;
      await fetchProfessionals();
      return (data as Professional) ?? null;
    } catch (err: any) {
      console.error("Error creating professional:", err);
      setError(err.message);
      return null;
    }
  };

  const updateProfessional = async (id: string, updates: ProfessionalUpdate): Promise<Professional | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from("vl_clinic_core_professionals")
        .update(updates)
        .eq("professional_id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchProfessionals();
      return (data as Professional) ?? null;
    } catch (err: any) {
      console.error("Error updating professional:", err);
      setError(err.message);
      return null;
    }
  };

  const deleteProfessional = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from("vl_clinic_core_professionals")
        .delete()
        .eq("professional_id", id);

      if (deleteError) throw deleteError;
      await fetchProfessionals();
      return true;
    } catch (err: any) {
      console.error("Error deleting professional:", err);
      setError(err.message);
      return false;
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
    getProfessionalById,
    createProfessional,
    updateProfessional,
    deleteProfessional,
  };
};
