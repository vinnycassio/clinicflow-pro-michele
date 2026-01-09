export interface Patient {
  patient_id: string;
  full_name: string;
  social_name: string | null;
  birth_date: string | null;
  gender: string | null;
  marital_status: string | null;
  profession: string | null;
  photo_url: string | null;
  document_cpf: string | null;
  document_rg: string | null;
  phone_main: string | null;
  phone_secondary: string | null;
  email: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_district: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zipcode: string | null;
  emergency_contact_name: string | null;
  emergency_contact_relationship: string | null;
  emergency_contact_phone: string | null;
  blood_type: string | null;
  allergies: string[] | null;
  continuous_medications: string[] | null;
  preexisting_conditions: string[] | null;
  previous_surgeries: string[] | null;
  family_history: string | null;
  source: string | null;
  referred_by_patient_id: string | null;
  health_insurance: string | null;
  notes: string | null;
  tags: string[] | null;
  last_appointment_at: string | null;
  next_appointment_at: string | null;
  total_spent: number | null;
  lifetime_value: number | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Professional {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  specialty: string | null;
  crm: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string | null;
}

export interface Appointment {
  id: string;
  patient_id: string;
  professional_id: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  patient?: Patient;
  professional?: Professional;
}
