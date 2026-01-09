import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Validação das credenciais
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Supabase credentials are missing!");
  console.error("VITE_SUPABASE_URL:", supabaseUrl ? "✓ Configured" : "✗ Missing");
  console.error("VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓ Configured" : "✗ Missing");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: "public",
  },
});

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://urqxtqfszqwbixpeeusd.supabase.co" &&
    supabaseAnonKey !== "placeholder-key",
  );
};

// Helper para verificar conexão
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from("vl_clinic_core_patients").select("patient_id").limit(1);
    if (error) {
      console.error("Supabase connection test failed:", error);
      return false;
    }
    console.log("✅ Supabase connected successfully!");
    return true;
  } catch (error) {
    console.error("Supabase connection error:", error);
    return false;
  }
};
