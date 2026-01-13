// ============================================
// TYPES GERADOS BASEADOS NO SCHEMA REAL
// ============================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ============================================
// TABELAS PRINCIPAIS
// ============================================

export interface Patient {
  patient_id: string;
  full_name: string;
  social_name: string | null;
  birth_date: string | null;
  gender: string | null;
  marital_status: string | null;
  profession: string | null;
  photo_url: string | null;

  // Documentos
  document_cpf: string | null;
  document_rg: string | null;

  // Contatos
  phone_main: string | null;
  phone_secondary: string | null;
  email: string | null;

  // Endereço
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_district: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zipcode: string | null;

  // Emergência
  emergency_contact_name: string | null;
  emergency_contact_relationship: string | null;
  emergency_contact_phone: string | null;

  // Dados Clínicos
  blood_type: string | null;
  allergies: string[] | null;
  continuous_medications: string[] | null;
  preexisting_conditions: string[] | null;
  previous_surgeries: string[] | null;
  family_history: string | null;

  // Administrativo
  source: string | null;
  referred_by_patient_id: string | null;
  health_insurance: string | null;
  notes: string | null;
  tags: string[] | null;

  // Controle de Consultas
  last_appointment_at: string | null;
  next_appointment_at: string | null;

  // Financeiro
  total_spent: number | null;
  lifetime_value: number | null;

  // Status
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Professional {
  professional_id: string;
  full_name: string;
  short_name: string | null;
  document_cpf: string | null;
  photo_url: string | null;

  // Contatos
  email: string | null;
  phone: string | null;

  // Profissional
  specialty: string;
  professional_role: string | null;
  registry_number: string | null;

  // Perfil IA
  bio: string | null;
  persona_description: string | null;
  tone_of_voice: string | null;
  keywords: string | null;

  // Agentes
  secretary_name: string | null;
  crm_agent_name: string | null;
  scheduler_agent_name: string | null;

  // Comissionamento
  commission_model: string | null;
  commission_percentage: number | null;
  commission_fixed_value: number | null;

  // Acesso
  user_id: string | null;
  system_role: string | null;

  // Agenda
  default_appointment_duration: number | null;
  working_hours: Json | null;
  google_calendar_id: string | null;

  // Status
  is_active: boolean | null;
  accept_new_patients: boolean | null;

  created_at: string | null;
  updated_at: string | null;
}

export interface Appointment {
  appointment_id: string;
  patient_id: string;
  professional_id: string;

  // Data e Horário
  appointment_date: string;
  appointment_start_time: string;
  appointment_end_time: string;

  // Status e Tipo
  status: string;
  service_type: string | null;

  // Informações
  notes: string | null;

  // Origem
  channel_origin: string | null;
  created_by_agent: string | null;

  // Google Calendar
  google_event_id: string | null;
  sync_source: string | null;
  last_synced_at: string | null;
  sync_status: string | null;

  created_at: string | null;
  updated_at: string | null;
}

export interface Anamnesis {
  anamnesis_id: string;
  patient_id: string;
  professional_id: string;
  template_id: string | null;
  answers: Json;
  weight: number | null;
  height: number | null;
  bmi: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface MedicalRecord {
  record_id: string;
  patient_id: string;
  professional_id: string;
  appointment_id: string | null;
  treatment_id: string | null;
  record_type: string;
  procedures_performed: string[] | null;
  products_used: Json | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  instructions: string | null;
  prescription: string | null;
  prescription_pdf_url: string | null;
  followup_days: number | null;
  followup_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PatientPhoto {
  photo_id: string;
  patient_id: string;
  appointment_id: string | null;
  medical_record_id: string | null;
  treatment_id: string | null;
  google_drive_file_id: string;
  google_drive_url: string;
  thumbnail_url: string | null;
  photo_type: string | null;
  angle: string | null;
  body_area: string | null;
  related_procedure: string | null;
  session_number: number | null;
  days_since_procedure: number | null;
  usage_consent: boolean | null;
  visible_to_patient: boolean | null;
  description: string | null;
  tags: string[] | null;
  uploaded_at: string | null;
  uploaded_by: string | null;
}

export interface Treatment {
  treatment_id: string;
  patient_id: string;
  professional_id: string;
  protocol_id: string | null;
  treatment_name: string;
  description: string | null;
  planned_sessions: number;
  completed_sessions: number | null;
  start_date: string | null;
  expected_end_date: string | null;
  actual_end_date: string | null;
  total_price: number | null;
  sale_id: string | null;
  status: string | null;
  notes: string | null;
  cancellation_reason: string | null;
  upcoming_appointments: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  completed_at: string | null;
}

// ============================================
// TABELAS FINANCEIRAS
// ============================================

export interface Budget {
  budget_id: string;
  patient_id: string;
  professional_id: string;
  budget_number: string;
  title: string | null;
  description: string | null;
  subtotal: number;
  discount_percentage: number | null;
  discount_amount: number | null;
  final_amount: number;
  items: Json;
  valid_until: string | null;
  status: string | null;
  approved_at: string | null;
  approved_by_name: string | null;
  approval_signature: string | null;
  converted_to_sale: boolean | null;
  sale_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Sale {
  sale_id: string;
  patient_id: string;
  professional_id: string;
  budget_id: string | null;
  appointment_id: string | null;
  sale_number: string;
  sale_type: string;
  subtotal: number;
  discount: number | null;
  final_amount: number;
  amount_paid: number | null;
  amount_pending: number;
  items: Json;
  status: string | null;
  payment_status: string | null;
  created_at: string | null;
  updated_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
}

export interface Payment {
  payment_id: string;
  sale_id: string;
  patient_id: string;
  payment_method: string;
  payment_amount: number;
  installment_number: number | null;
  total_installments: number | null;
  due_date: string;
  payment_date: string | null;
  status: string | null;
  gateway_provider: string | null;
  gateway_transaction_id: string | null;
  gateway_payment_url: string | null;
  gateway_qr_code: string | null;
  gateway_response: Json | null;
  gateway_fee: number | null;
  net_amount: number | null;
  collection_attempts: number | null;
  last_collection_attempt_at: string | null;
  late_fee: number | null;
  interest: number | null;
  receipt_url: string | null;
  receipt_number: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ============================================
// TYPES COM RELACIONAMENTOS
// ============================================

export interface AppointmentWithDetails extends Appointment {
  patient?: Patient;
  professional?: Professional;
}

export interface MedicalRecordWithDetails extends MedicalRecord {
  patient?: Patient;
  professional?: Professional;
  appointment?: Appointment;
  treatment?: Treatment;
}

export interface TreatmentWithDetails extends Treatment {
  patient?: Patient;
  professional?: Professional;
}

export interface SaleWithDetails extends Sale {
  patient?: Patient;
  professional?: Professional;
  payments?: Payment[];
}

// ============================================
// INSERTS E UPDATES (Para operações do Supabase)
// Campos opcionais que o banco gera automaticamente
// ============================================

export interface AppointmentInsert {
  patient_id: string;
  professional_id: string;
  appointment_date: string;
  appointment_start_time: string;
  appointment_end_time: string;
  status?: string;
  service_type?: string | null;
  notes?: string | null;
  channel_origin?: string | null;
  created_by_agent?: string | null;
  google_event_id?: string | null;
  sync_source?: string | null;
  last_synced_at?: string | null;
  sync_status?: string | null;
}

export type AppointmentUpdate = Partial<AppointmentInsert>;

export type PatientInsert = Omit<Patient, "patient_id" | "created_at" | "updated_at"> & {
  patient_id?: string;
};

export type PatientUpdate = Partial<Omit<Patient, "patient_id" | "created_at">>;

export type MedicalRecordInsert = Omit<MedicalRecord, "record_id" | "created_at" | "updated_at"> & {
  record_id?: string;
};

export type MedicalRecordUpdate = Partial<Omit<MedicalRecord, "record_id" | "created_at">>;

// ============================================
// DATABASE INTERFACE (Para uso com Supabase Client)
// ============================================

export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: any[];
      };

      vl_clinic_core_patients: {
        Row: Patient;
        Insert: PatientInsert;
        Update: PatientUpdate;
        Relationships: [];
      };
      vl_clinic_core_professionals: {
        Row: Professional;
        Insert: Omit<Professional, "professional_id" | "created_at" | "updated_at"> & {
          professional_id?: string;
        };
        Update: Partial<Omit<Professional, "professional_id" | "created_at">>;
        Relationships: [];
      };
      vl_clinic_core_appointments: {
        Row: Appointment;
        Insert: AppointmentInsert;
        Update: AppointmentUpdate;
        Relationships: [];
      };
      vl_ana_records: {
        Row: Anamnesis;
        Insert: Omit<Anamnesis, "anamnesis_id" | "created_at" | "updated_at"> & {
          anamnesis_id?: string;
        };
        Update: Partial<Omit<Anamnesis, "anamnesis_id" | "created_at">>;
        Relationships: [];
      };
      vl_clinic_medical_records: {
        Row: MedicalRecord;
        Insert: MedicalRecordInsert;
        Update: MedicalRecordUpdate;
        Relationships: [];
      };
      vl_clinic_patient_photos: {
        Row: PatientPhoto;
        Insert: Omit<PatientPhoto, "photo_id" | "uploaded_at"> & {
          photo_id?: string;
        };
        Update: Partial<Omit<PatientPhoto, "photo_id" | "uploaded_at">>;
        Relationships: [];
      };
      vl_clinic_patient_treatments: {
        Row: Treatment;
        Insert: Omit<Treatment, "treatment_id" | "created_at" | "updated_at" | "completed_at"> & {
          treatment_id?: string;
        };
        Update: Partial<Omit<Treatment, "treatment_id" | "created_at">>;
        Relationships: [];
      };
      vl_fin_budgets: {
        Row: Budget;
        Insert: Omit<Budget, "budget_id" | "created_at" | "updated_at"> & {
          budget_id?: string;
          budget_number?: string;
        };
        Update: Partial<Omit<Budget, "budget_id" | "created_at">>;
        Relationships: [];
      };
      vl_fin_sales: {
        Row: Sale;
        Insert: Omit<Sale, "sale_id" | "created_at" | "updated_at" | "cancelled_at"> & {
          sale_id?: string;
          sale_number?: string;
        };
        Update: Partial<Omit<Sale, "sale_id" | "created_at">>;
        Relationships: [];
      };
      vl_fin_payments: {
        Row: Payment;
        Insert: Omit<Payment, "payment_id" | "created_at" | "updated_at"> & {
          payment_id?: string;
        };
        Update: Partial<Omit<Payment, "payment_id" | "created_at">>;
        Relationships: [];
      };
    };

    Views: {
      [key: string]: {
        Row: any;
        Relationships: any[];
      };

      vw_patient_financial_summary: {
        Row: {
          patient_id: string;
          full_name: string;
          phone_main: string | null;
          total_sales: number;
          total_billed: number;
          total_paid: number;
          total_pending: number;
          overdue_payments: number;
          next_due_date: string | null;
          lifetime_value: number | null;
        };
        Relationships: [];
      };
      vw_active_treatments: {
        Row: {
          treatment_id: string;
          treatment_name: string;
          patient_id: string;
          patient_name: string;
          phone_main: string | null;
          professional_name: string;
          planned_sessions: number;
          completed_sessions: number;
          start_date: string | null;
          expected_end_date: string | null;
          status: string | null;
          progress_percentage: number | null;
        };
        Relationships: [];
      };
    };

    Functions: {
      [key: string]: {
        Args: any;
        Returns: any;
      };

      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
}
