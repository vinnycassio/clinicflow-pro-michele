import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Appointment, AppointmentInsert, AppointmentUpdate, AppointmentWithDetails } from '@/types/database';

export const useAppointments = (professionalId?: string, date?: string) => {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('vl_clinic_core_appointments')
        .select(`
          *,
          patient:patient_id(
            patient_id,
            full_name,
            phone_main,
            email
          ),
          professional:professional_id(
            professional_id,
            full_name,
            short_name,
            specialty
          )
        `)
        .order('appointment_date', { ascending: true })
        .order('appointment_start_time', { ascending: true });

      if (professionalId) {
        query = query.eq('professional_id', professionalId);
      }

      if (date) {
        query = query.eq('appointment_date', date);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setAppointments((data || []) as unknown as AppointmentWithDetails[]);
    } catch (err: any) {
      console.error('Erro ao carregar agendamentos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentById = async (id: string): Promise<AppointmentWithDetails | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('vl_clinic_core_appointments')
        .select(`
          *,
          patient:patient_id(*),
          professional:professional_id(*)
        `)
        .eq('appointment_id', id)
        .single();

      if (fetchError) throw fetchError;
      return data as unknown as AppointmentWithDetails;
    } catch (err: any) {
      console.error('Erro ao buscar agendamento:', err);
      setError(err.message);
      return null;
    }
  };

  const createAppointment = async (appointment: AppointmentInsert): Promise<Appointment | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('vl_clinic_core_appointments')
        .insert([appointment])
        .select()
        .single();
  
      if (insertError) throw insertError;
      await fetchAppointments();
      return data as Appointment;
    } catch (err: any) {
      console.error('Erro ao criar agendamento:', err);
      setError(err.message);
      return null;
    }
  };

  const updateAppointment = async (id: string, updates: AppointmentUpdate): Promise<Appointment | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from('vl_clinic_core_appointments')
        .update(updates)
        .eq('appointment_id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchAppointments();
      return data as Appointment;
    } catch (err: any) {
      console.error('Erro ao atualizar agendamento:', err);
      setError(err.message);
      return null;
    }
  };

  const cancelAppointment = async (id: string, reason: string): Promise<Appointment | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from('vl_clinic_core_appointments')
        .update({
          status: 'cancelled',
          notes: reason,
        })
        .eq('appointment_id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchAppointments();
      return data as Appointment;
    } catch (err: any) {
      console.error('Erro ao cancelar agendamento:', err);
      setError(err.message);
      return null;
    }
  };

  const deleteAppointment = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('vl_clinic_core_appointments')
        .delete()
        .eq('appointment_id', id);

      if (deleteError) throw deleteError;
      await fetchAppointments();
      return true;
    } catch (err: any) {
      console.error('Erro ao deletar agendamento:', err);
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
