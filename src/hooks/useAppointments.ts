import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Appointment, AppointmentInsert, AppointmentUpdate, AppointmentWithDetails } from "@/types/database";

export const useAppointments = (professionalId?: string, date?: string) => {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("vl_clinic_core_appointments")
        .select(
          `
          *,
          patient:vl_clinic_core_patients(
            patient_id,
            full_name,
            phone_main,
            email
          ),
          professional:vl_clinic_core_professionals(
            professional_id,
            full_name,
            short_name,
            specialty
          )
        `,
        )
        .order("appointment_date", { ascending: true })
        .order("appointment_start_time", { ascending: true });

      if (professionalId) {
        query = query.eq("professional_id", professionalId);
      }

      if (date) {
        query = query.eq("appointment_date", date);
      }

       const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setAppointments(((data as unknown) as AppointmentWithDetails[]) || []);
    } catch (err: any) {
      console.error("Error fetching appointments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentById = async (id: string): Promise<AppointmentWithDetails | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from("vl_clinic_core_appointments")
        .select(
          `
          *,
          patient:vl_clinic_core_patients(*),
          professional:vl_clinic_core_professionals(*)
        `,
        )
        .eq("appointment_id", id)
        .single();

      if (fetchError) throw fetchError;
      return ((data as unknown) as AppointmentWithDetails) ?? null;
    } catch (err: any) {
      console.error("Error fetching appointment:", err);
      setError(err.message);
      return null;
    }
  };

  const createAppointment = async (appointment: AppointmentInsert): Promise<Appointment | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from("vl_clinic_core_appointments")
        .insert([appointment]) // Envolver em array
        .select()
        .single();

      if (insertError) throw insertError;
      await fetchAppointments();
      return (data as Appointment) ?? null;
    } catch (err: any) {
      console.error("Error creating appointment:", err);
      setError(err.message);
      return null;
    }
  };

  const updateAppointment = async (id: string, updates: AppointmentUpdate): Promise<Appointment | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from("vl_clinic_core_appointments")
        .update(updates)
        .eq("appointment_id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchAppointments();
      return (data as Appointment) ?? null;
    } catch (err: any) {
      console.error("Error updating appointment:", err);
      setError(err.message);
      return null;
    }
  };

  const cancelAppointment = async (id: string, reason: string): Promise<Appointment | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from("vl_clinic_core_appointments")
        .update({
          status: "cancelled",
          notes: reason,
        })
        .eq("appointment_id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchAppointments();
      return (data as Appointment) ?? null;
    } catch (err: any) {
      console.error("Error cancelling appointment:", err);
      setError(err.message);
      return null;
    }
  };

  const deleteAppointment = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from("vl_clinic_core_appointments")
        .delete()
        .eq("appointment_id", id);

      if (deleteError) throw deleteError;
      await fetchAppointments();
      return true;
    } catch (err: any) {
      console.error("Error deleting appointment:", err);
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [professionalId, date]);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    deleteAppointment,
  };
};
