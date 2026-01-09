import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, SlidersHorizontal, Download } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PatientsTable } from "@/components/patients/PatientsTable";
import { NewPatientModal } from "@/components/patients/NewPatientModal";
import { useToast } from "@/hooks/use-toast";
import { usePatients, useCreatePatient, useDeletePatient } from "@/hooks/usePatients";
import { Skeleton } from "@/components/ui/skeleton";

function formatLastVisit(date: string | null): string {
  if (!date) return "-";
  try {
    const visitDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - visitDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `Há ${diffDays} dias`;
    if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semana(s)`;
    return `Há ${Math.floor(diffDays / 30)} mês(es)`;
  } catch {
    return "-";
  }
}

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: patients, isLoading, error } = usePatients();
  const createPatient = useCreatePatient();
  const deletePatient = useDeletePatient();

  const filteredPatients = (patients ?? []).filter((patient) =>
    patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (patient.phone_main?.includes(searchQuery) ?? false) ||
    (patient.document_cpf?.includes(searchQuery) ?? false)
  );

  // Transform data for PatientsTable component
  const tablePatients = filteredPatients.map((patient) => {
    const lastVisit = formatLastVisit(patient.last_appointment_at);

    return {
      id: patient.patient_id,
      name: patient.social_name || patient.full_name,
      email: patient.email ?? "",
      phone: patient.phone_main ?? "",
      lastVisit,
      status: (patient.status as "active" | "inactive" | "pending") ?? "active",
      totalVisits: 0,
    };
  });

  const handleViewPatient = (patient: { id: string }) => {
    navigate(`/pacientes/${patient.id}`);
  };

  const handleNewPatient = async (data: { 
    fullName: string; 
    socialName?: string;
    email: string; 
    phone: string; 
    cpf: string;
    birthDate: string;
    gender: string;
  }) => {
    try {
      await createPatient.mutateAsync({
        full_name: data.fullName,
        social_name: data.socialName || null,
        email: data.email || null,
        phone_main: data.phone || null,
        document_cpf: data.cpf || null,
        birth_date: data.birthDate || null,
        gender: data.gender || null,
        status: "active",
      });
      toast({
        title: "Paciente cadastrado!",
        description: "O novo paciente foi adicionado com sucesso.",
      });
      setIsNewPatientOpen(false);
    } catch (err) {
      console.error('Error creating patient:', err);
      toast({
        title: "Erro ao cadastrar",
        description: "Não foi possível cadastrar o paciente.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePatient = async (patient: { id: string; name: string }) => {
    try {
      await deletePatient.mutateAsync(patient.id);
      toast({
        title: "Paciente excluído",
        description: `${patient.name} foi removido.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o paciente.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-2">Erro ao carregar pacientes</p>
            <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Pacientes"
        subtitle={`${patients?.length ?? 0} pacientes cadastrados`}
        breadcrumbs={[{ label: "Pacientes" }]}
        actions={
          <Button
            onClick={() => setIsNewPatientOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Paciente
          </Button>
        }
      />

      <div className="px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, telefone ou CPF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 input-focus-ring"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Patients Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <PatientsTable
            patients={tablePatients}
            onView={handleViewPatient}
            onEdit={(patient) => {
              toast({
                title: "Editar paciente",
                description: `Editando ${patient.name}...`,
              });
            }}
            onDelete={handleDeletePatient}
            onSchedule={(patient) => {
              toast({
                title: "Agendar consulta",
                description: `Agendando consulta para ${patient.name}...`,
              });
            }}
          />
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 text-sm text-muted-foreground">
          <p>
            Mostrando{" "}
            <span className="font-medium text-foreground">
              {filteredPatients.length}
            </span>{" "}
            de{" "}
            <span className="font-medium text-foreground">
              {patients?.length ?? 0}
            </span>{" "}
            pacientes
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <Button variant="outline" size="sm">
              Próximo
            </Button>
          </div>
        </div>
      </div>

      {/* New Patient Modal */}
      <NewPatientModal
        open={isNewPatientOpen}
        onClose={() => setIsNewPatientOpen(false)}
        onSubmit={handleNewPatient}
      />
    </AppLayout>
  );
}
