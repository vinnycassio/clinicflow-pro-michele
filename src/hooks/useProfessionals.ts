import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Professional {
  professional_id: string;
  full_name: string;
  short_name: string | null;
  document_cpf: string | null;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  specialty: string;
  professional_role: string | null;
  registry_number: string | null;
  bio: string | null;
  persona_description: string | null;
  tone_of_voice: string | null;
  keywords: string | null;
  secretary_name: string | null;
  crm_agent_name: string | null;
  scheduler_agent_name: string | null;
  commission_model: string | null;
  commission_percentage: number | null;
  commission_fixed_value: number | null;
  user_id: string | null;
  system_role: string | null;
  default_appointment_duration: number | null;
  working_hours: any | null;
  google_calendar_id: string | null;
  is_active: boolean | null;
  accept_new_patients: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

type ProfessionalInsert = Partial<Professional> & {
  full_name: string;
  specialty: string;
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
      
      console.log("🔍 Buscando profissionais...");
      
      const { data, error: fetchError, count } = await supabase
        .from("vl_clinic_core_professionals")
        .select("*", { count: "exact" })
        .eq("is_active", true)
        .order("full_name", { ascending: true });

      console.log("📊 Resultado da busca:", {
        total: count,
        encontrados: data?.length,
        dados: data,
        erro: fetchError,
      });

      if (fetchError) {
        console.error("❌ Erro ao buscar profissionais:", fetchError);
        throw fetchError;
      }

      setProfessionals((data || []) as Professional[]);
      console.log("✅ Profissionais carregados:", data?.length || 0);
    } catch (err: any) {
      console.error("❌ Erro no fetchProfessionals:", err);
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
      return data as Professional;
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
        .insert([professional as any])
        .select()
        .single();

      if (insertError) throw insertError;
      await fetchProfessionals();
      return data as Professional;
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
        .update(updates as any)
        .eq("professional_id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchProfessionals();
      return data as Professional;
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
