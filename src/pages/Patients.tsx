import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, SlidersHorizontal, Download } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PatientsTable, Patient } from "@/components/patients/PatientsTable";
import { NewPatientModal } from "@/components/patients/NewPatientModal";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockPatients: Patient[] = [
  {
    id: "1",
    name: "Maria Silva",
    email: "maria.silva@email.com",
    phone: "(11) 99999-9999",
    lastVisit: "Ontem",
    status: "active",
    totalVisits: 8,
  },
  {
    id: "2",
    name: "João Santos",
    email: "joao.santos@email.com",
    phone: "(11) 98888-8888",
    lastVisit: "Há 3 dias",
    status: "active",
    totalVisits: 12,
  },
  {
    id: "3",
    name: "Ana Costa",
    email: "ana.costa@email.com",
    phone: "(11) 97777-7777",
    lastVisit: "Há 1 semana",
    status: "active",
    totalVisits: 5,
  },
  {
    id: "4",
    name: "Lucas Martins",
    email: "lucas.martins@email.com",
    phone: "(11) 96666-6666",
    lastVisit: "Hoje",
    status: "active",
    totalVisits: 3,
  },
  {
    id: "5",
    name: "Carla Oliveira",
    email: "carla.oliveira@email.com",
    phone: "(11) 95555-5555",
    lastVisit: "Há 2 semanas",
    status: "pending",
    totalVisits: 1,
  },
  {
    id: "6",
    name: "Pedro Almeida",
    email: "pedro.almeida@email.com",
    phone: "(11) 94444-4444",
    lastVisit: "Há 1 mês",
    status: "inactive",
    totalVisits: 6,
  },
];

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const filteredPatients = mockPatients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone.includes(searchQuery)
  );

  const handleViewPatient = (patient: Patient) => {
    navigate(`/pacientes/${patient.id}`);
  };

  const handleNewPatient = () => {
    toast({
      title: "Paciente cadastrado!",
      description: "O novo paciente foi adicionado com sucesso.",
    });
    setIsNewPatientOpen(false);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Pacientes"
        subtitle={`${mockPatients.length} pacientes cadastrados`}
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
              placeholder="Buscar paciente..."
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
        <PatientsTable
          patients={filteredPatients}
          onView={handleViewPatient}
          onEdit={(patient) => {
            toast({
              title: "Editar paciente",
              description: `Editando ${patient.name}...`,
            });
          }}
          onDelete={(patient) => {
            toast({
              title: "Paciente excluído",
              description: `${patient.name} foi removido.`,
              variant: "destructive",
            });
          }}
          onSchedule={(patient) => {
            toast({
              title: "Agendar consulta",
              description: `Agendando consulta para ${patient.name}...`,
            });
          }}
        />

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 text-sm text-muted-foreground">
          <p>
            Mostrando{" "}
            <span className="font-medium text-foreground">
              {filteredPatients.length}
            </span>{" "}
            de{" "}
            <span className="font-medium text-foreground">
              {mockPatients.length}
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
