export interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  birth_date: string | null;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
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
  // Joined data
  patient?: Patient;
  professional?: Professional;
}
