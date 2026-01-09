import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Professional } from '@/types/database';

export function useProfessionals() {
  return useQuery({
    queryKey: ['professionals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Professional[];
    },
  });
}

export function useProfessional(id: string) {
  return useQuery({
    queryKey: ['professionals', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Professional | null;
    },
    enabled: !!id,
  });
}

export function useCreateProfessional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (professional: Omit<Professional, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('professionals')
        .insert(professional)
        .select()
        .single();

      if (error) throw error;
      return data as Professional;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
    },
  });
}

export function useUpdateProfessional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Professional> & { id: string }) => {
      const { data, error } = await supabase
        .from('professionals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Professional;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
    },
  });
}

export function useDeleteProfessional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
    },
  });
}
