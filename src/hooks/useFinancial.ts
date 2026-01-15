import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Json } from '@/types/database';

// ==========================================
// TYPES - BUDGETS
// ==========================================
export interface BudgetItem {
  item_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  discount_amount?: number;
  total: number;
}

export interface Budget {
  budget_id: string;
  budget_number: string;
  patient_id: string;
  professional_id: string;
  issue_date: string;
  validity_date: string;
  status: 'draft' | 'sent' | 'approved' | 'expired' | 'rejected';
  items: BudgetItem[];
  subtotal: number;
  discount_total: number;
  total_amount: number;
  notes?: string;
  terms_conditions?: string;
  created_at: string;
  updated_at: string;
  patient?: {
    patient_id: string;
    full_name: string;
    phone_main?: string;
    email?: string;
  };
  professional?: {
    professional_id: string;
    full_name: string;
    specialty?: string;
  };
}

export interface BudgetInsert {
  patient_id: string;
  professional_id: string;
  issue_date: string;
  validity_date: string;
  status?: string;
  items: Json;
  subtotal: number;
  discount_total: number;
  total_amount: number;
  notes?: string;
  terms_conditions?: string;
}

// ==========================================
// TYPES - SALES
// ==========================================
export interface Sale {
  sale_id: string;
  sale_number: string;
  patient_id: string;
  professional_id: string;
  budget_id?: string;
  sale_date: string;
  items: BudgetItem[];
  subtotal: number;
  discount_total: number;
  total_amount: number;
  amount_paid: number;
  amount_pending: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: {
    patient_id: string;
    full_name: string;
    phone_main?: string;
    email?: string;
  };
  professional?: {
    professional_id: string;
    full_name: string;
    specialty?: string;
  };
  budget?: {
    budget_id: string;
    budget_number: string;
  };
}

export interface SaleInsert {
  patient_id: string;
  professional_id: string;
  budget_id?: string;
  sale_date: string;
  items: Json;
  subtotal: number;
  discount_total: number;
  total_amount: number;
  notes?: string;
}

// ==========================================
// TYPES - PAYMENTS
// ==========================================
export interface Payment {
  payment_id: string;
  sale_id: string;
  installment_number?: number;
  total_installments?: number;
  payment_date: string;
  due_date: string;
  paid_at?: string;
  amount: number;
  payment_method: 'pix' | 'cash' | 'debit' | 'credit' | 'boleto' | 'transfer';
  payment_details?: any;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  gateway_transaction_id?: string;
  gateway_status?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  sale?: {
    sale_id: string;
    sale_number: string;
    patient?: {
      full_name: string;
      phone_main?: string;
    };
  };
}

export interface PaymentInsert {
  sale_id: string;
  installment_number?: number;
  total_installments?: number;
  payment_date: string;
  due_date: string;
  amount: number;
  payment_method: string;
  payment_details?: any;
  status?: string;
  notes?: string;
}

// ==========================================
// HOOK
// ==========================================
export const useFinancial = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==========================================
  // BUDGETS
  // ==========================================
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Buscando orçamentos...');
      
      const { data, error: fetchError } = await supabase
        .from('vl_fin_budgets')
        .select(`
          *,
          patient:patient_id(patient_id, full_name, phone_main, email),
          professional:professional_id(professional_id, full_name, specialty)
        `)
        .order('created_at', { ascending: false });

      console.log('📊 Orçamentos:', data?.length);

      if (fetchError) throw fetchError;
      setBudgets((data || []) as unknown as Budget[]);
    } catch (err: any) {
      console.error('❌ Erro ao carregar orçamentos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createBudget = async (budget: BudgetInsert): Promise<Budget | null> => {
    try {
      console.log('📝 Criando orçamento...', budget);
      
      const { data, error: insertError } = await supabase
        .from('vl_fin_budgets')
        .insert([budget as any])
        .select()
        .single();

      if (insertError) throw insertError;
      
      console.log('✅ Orçamento criado:', data);
      await fetchBudgets();
      return data as unknown as Budget;
    } catch (err: any) {
      console.error('❌ Erro ao criar orçamento:', err);
      setError(err.message);
      return null;
    }
  };

  const updateBudget = async (id: string, updates: Partial<BudgetInsert>): Promise<Budget | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from('vl_fin_budgets')
        .update(updates)
        .eq('budget_id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchBudgets();
      return data as unknown as Budget;
    } catch (err: any) {
      console.error('❌ Erro ao atualizar orçamento:', err);
      setError(err.message);
      return null;
    }
  };

  const deleteBudget = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('vl_fin_budgets')
        .delete()
        .eq('budget_id', id);

      if (deleteError) throw deleteError;
      await fetchBudgets();
      return true;
    } catch (err: any) {
      console.error('❌ Erro ao deletar orçamento:', err);
      setError(err.message);
      return false;
    }
  };

  const convertBudgetToSale = async (budgetId: string): Promise<Sale | null> => {
    try {
      // Buscar orçamento
      const { data: budget, error: budgetError } = await supabase
        .from('vl_fin_budgets')
        .select('*')
        .eq('budget_id', budgetId)
        .single();

      if (budgetError) throw budgetError;
      if (!budget) throw new Error('Orçamento não encontrado');

      const budgetData = budget as any;
      
      // Criar venda
      const saleData: SaleInsert = {
        patient_id: budgetData.patient_id,
        professional_id: budgetData.professional_id,
        budget_id: budgetId,
        sale_date: new Date().toISOString().split('T')[0],
        items: budgetData.items,
        subtotal: budgetData.subtotal || 0,
        discount_total: budgetData.discount_amount || 0,
        total_amount: budgetData.final_amount || 0,
        notes: `Convertido do orçamento ${budgetData.budget_number}`,
      };

      const sale = await createSale(saleData);

      if (sale) {
        // Atualizar status do orçamento
        await updateBudget(budgetId, { status: 'approved' });
      }

      return sale;
    } catch (err: any) {
      console.error('❌ Erro ao converter orçamento:', err);
      setError(err.message);
      return null;
    }
  };

  // ==========================================
  // SALES
  // ==========================================
  const fetchSales = async () => {
    try {
      console.log('🔍 Buscando vendas...');
      
      const { data, error: fetchError } = await supabase
        .from('vl_fin_sales')
        .select(`
          *,
          patient:patient_id(patient_id, full_name, phone_main, email),
          professional:professional_id(professional_id, full_name, specialty),
          budget:budget_id(budget_id, budget_number)
        `)
        .order('created_at', { ascending: false });

      console.log('📊 Vendas:', data?.length);

      if (fetchError) throw fetchError;
      setSales((data || []) as unknown as Sale[]);
    } catch (err: any) {
      console.error('❌ Erro ao carregar vendas:', err);
      setError(err.message);
    }
  };

  const createSale = async (sale: SaleInsert): Promise<Sale | null> => {
    try {
      console.log('📝 Criando venda...', sale);
      
      const { data, error: insertError } = await supabase
        .from('vl_fin_sales')
        .insert([sale as any])
        .select()
        .single();

      if (insertError) throw insertError;
      
      console.log('✅ Venda criada:', data);
      await fetchSales();
      return data as unknown as Sale;
    } catch (err: any) {
      console.error('❌ Erro ao criar venda:', err);
      setError(err.message);
      return null;
    }
  };

  const updateSale = async (id: string, updates: Partial<SaleInsert>): Promise<Sale | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from('vl_fin_sales')
        .update(updates)
        .eq('sale_id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchSales();
      return data as unknown as Sale;
    } catch (err: any) {
      console.error('❌ Erro ao atualizar venda:', err);
      setError(err.message);
      return null;
    }
  };

  const deleteSale = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('vl_fin_sales')
        .delete()
        .eq('sale_id', id);

      if (deleteError) throw deleteError;
      await fetchSales();
      return true;
    } catch (err: any) {
      console.error('❌ Erro ao deletar venda:', err);
      setError(err.message);
      return false;
    }
  };

  // ==========================================
  // PAYMENTS
  // ==========================================
  const fetchPayments = async () => {
    try {
      console.log('🔍 Buscando pagamentos...');
      
      const { data, error: fetchError } = await supabase
        .from('vl_fin_payments')
        .select(`
          *,
          sale:sale_id(
            sale_id,
            sale_number,
            patient:patient_id(full_name, phone_main)
          )
        `)
        .order('due_date', { ascending: true });

      console.log('📊 Pagamentos:', data?.length);

      if (fetchError) throw fetchError;
      setPayments((data || []) as unknown as Payment[]);
    } catch (err: any) {
      console.error('❌ Erro ao carregar pagamentos:', err);
      setError(err.message);
    }
  };

  const createPayment = async (payment: PaymentInsert): Promise<Payment | null> => {
    try {
      console.log('📝 Criando pagamento...', payment);
      
      const { data, error: insertError } = await supabase
        .from('vl_fin_payments')
        .insert([payment as any])
        .select()
        .single();

      if (insertError) throw insertError;
      
      console.log('✅ Pagamento criado:', data);
      await fetchPayments();
      await fetchSales(); // Atualizar vendas também
      return data as unknown as Payment;
    } catch (err: any) {
      console.error('❌ Erro ao criar pagamento:', err);
      setError(err.message);
      return null;
    }
  };

  const updatePayment = async (id: string, updates: Partial<PaymentInsert>): Promise<Payment | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from('vl_fin_payments')
        .update(updates)
        .eq('payment_id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchPayments();
      await fetchSales(); // Atualizar vendas também
      return data as unknown as Payment;
    } catch (err: any) {
      console.error('❌ Erro ao atualizar pagamento:', err);
      setError(err.message);
      return null;
    }
  };

  const markPaymentAsPaid = async (paymentId: string): Promise<boolean> => {
    try {
      const result = await updatePayment(paymentId, {
        status: 'paid',
        payment_date: new Date().toISOString().split('T')[0],
      });
      return result !== null;
    } catch (err: any) {
      console.error('❌ Erro ao marcar pagamento como pago:', err);
      return false;
    }
  };

  const deletePayment = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('vl_fin_payments')
        .delete()
        .eq('payment_id', id);

      if (deleteError) throw deleteError;
      await fetchPayments();
      await fetchSales();
      return true;
    } catch (err: any) {
      console.error('❌ Erro ao deletar pagamento:', err);
      setError(err.message);
      return false;
    }
  };

  // ==========================================
  // EFFECTS
  // ==========================================
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
    createBudget,
    updateBudget,
    deleteBudget,
    convertBudgetToSale,
    fetchSales,
    createSale,
    updateSale,
    deleteSale,
    fetchPayments,
    createPayment,
    updatePayment,
    markPaymentAsPaid,
    deletePayment,
  };
};
