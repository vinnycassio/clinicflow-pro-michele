import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Budget {
  budget_id: string;
  patient_id: string;
  professional_id: string;
  budget_number: string;
  issue_date: string;
  validity_date: string;
  total_amount: number;
  status: string;
  items: any;
  notes?: string;
  created_at: string;
}

export interface Sale {
  sale_id: string;
  patient_id: string;
  professional_id: string;
  budget_id?: string;
  sale_number: string;
  sale_date: string;
  total_amount: number;
  amount_paid: number;
  amount_pending: number;
  payment_status: string;
  items: any;
  created_at: string;
}

export interface Payment {
  payment_id: string;
  sale_id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  status: string;
  gateway_transaction_id?: string;
  created_at: string;
}

export const useFinancial = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = async () => {
    try {
      const { data, error } = await supabase
        .from('vl_fin_budgets')
        .select(`
          *,
          patient:vl_clinic_core_patients(patient_id, full_name),
          professional:vl_clinic_core_professionals(professional_id, full_name)
        `)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar orçamentos:', err);
      setError(err.message);
    }
  };

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('vl_fin_sales')
        .select(`
          *,
          patient:vl_clinic_core_patients(patient_id, full_name),
          professional:vl_clinic_core_professionals(professional_id, full_name)
        `)
        .order('sale_date', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar vendas:', err);
      setError(err.message);
    }
  };

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('vl_fin_payments')
        .select(`
          *,
          sale:vl_fin_sales(
            sale_id,
            sale_number,
            patient:vl_clinic_core_patients(full_name)
          )
        `)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar pagamentos:', err);
      setError(err.message);
    }
  };

  const createBudget = async (budget: Partial<Budget>) => {
    try {
      const { data, error } = await supabase
        .from('vl_fin_budgets')
        .insert([budget])
        .select()
        .single();

      if (error) throw error;
      await fetchBudgets();
      return data;
    } catch (err: any) {
      console.error('Erro ao criar orçamento:', err);
      setError(err.message);
      return null;
    }
  };

  const createSale = async (sale: Partial<Sale>) => {
    try {
      const { data, error } = await supabase
        .from('vl_fin_sales')
        .insert([sale])
        .select()
        .single();

      if (error) throw error;
      await fetchSales();
      return data;
    } catch (err: any) {
      console.error('Erro ao criar venda:', err);
      setError(err.message);
      return null;
    }
  };

  const createPayment = async (payment: Partial<Payment>) => {
    try {
      const { data, error } = await supabase
        .from('vl_fin_payments')
        .insert([payment])
        .select()
        .single();

      if (error) throw error;
      await fetchPayments();
      return data;
    } catch (err: any) {
      console.error('Erro ao criar pagamento:', err);
      setError(err.message);
      return null;
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchBudgets(), fetchSales(), fetchPayments()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  return {
    budgets,
    sales,
    payments,
    loading,
    error,
    fetchBudgets,
    fetchSales,
    fetchPayments,
    createBudget,
    createSale,
    createPayment,
  };
};
