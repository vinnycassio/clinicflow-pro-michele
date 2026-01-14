import { usePatients } from "@/hooks/usePatients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { Search, UserPlus, Eye, Trash2, Users, Pencil } from "lucide-react";
import { NewPatientModal } from "@/components/patients/NewPatientModal";
import { EditPatientModal } from "@/components/patients/EditPatientModal";
import type { Patient } from "@/types/database";

const Patients = () => {
  const { patients, loading, error, searchPatients, deletePatient, fetchPatients, createPatient, updatePatient } = usePatients();
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchPatients(searchTerm);
    } else {
      fetchPatients();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir ${name}?`)) {
      const success = await deletePatient(id);
      if (success) {
        toast.success("Paciente excluído com sucesso!");
      } else {
        toast.error("Erro ao excluir paciente");
      }
    }
  };

  const handleCreatePatient = async (data: any) => {
    const patientData = {
      full_name: data.fullName,
      social_name: data.socialName || null,
      birth_date: data.birthDate || null,
      gender: data.gender || null,
      document_cpf: data.cpf || null,
      document_rg: data.rg || null,
      phone_main: data.phone || null,
      email: data.email || null,
      address_street: data.addressStreet || null,
      address_number: data.addressNumber || null,
      address_complement: data.addressComplement || null,
      address_district: data.addressDistrict || null,
      address_city: data.addressCity || null,
      address_state: data.addressState || null,
      address_zipcode: data.addressZipcode || null,
      status: "active",
    };

    const result = await createPatient(patientData as any);
    if (result) {
      toast.success("Paciente criado com sucesso!");
      setIsNewModalOpen(false);
    } else {
      toast.error("Erro ao criar paciente");
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditModalOpen(true);
  };

  const handleUpdatePatient = async (data: any) => {
    if (!selectedPatient) return;

    const patientData = {
      full_name: data.fullName,
      social_name: data.socialName || null,
      birth_date: data.birthDate || null,
      gender: data.gender || null,
      document_cpf: data.cpf || null,
      document_rg: data.rg || null,
      phone_main: data.phone || null,
      email: data.email || null,
      address_street: data.addressStreet || null,
      address_number: data.addressNumber || null,
      address_complement: data.addressComplement || null,
      address_district: data.addressDistrict || null,
      address_city: data.addressCity || null,
      address_state: data.addressState || null,
      address_zipcode: data.addressZipcode || null,
    };

    const result = await updatePatient(selectedPatient.patient_id, patientData as any);
    if (result) {
      toast.success("Paciente atualizado com sucesso!");
      setIsEditModalOpen(false);
      setSelectedPatient(null);
    } else {
      toast.error("Erro ao atualizar paciente");
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 lg:h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 lg:p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600 font-medium">Erro ao carregar pacientes</p>
            <p className="text-sm text-red-500 mt-1">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Pacientes</h1>
          <p className="text-sm lg:text-base text-gray-500 mt-1">
            {patients.length} pacientes cadastrados
          </p>
        </div>
        <Button className="w-full lg:w-auto gap-2" onClick={() => setIsNewModalOpen(true)}>
          <UserPlus className="w-4 h-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-3 lg:p-4">
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
              <Input
                placeholder="Buscar por nome, telefone, CPF ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9 lg:pl-10 text-sm"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <div className="space-y-3">
        {patients.length === 0 ? (
          <Card>
            <CardContent className="p-8 lg:p-12 text-center">
              <Users className="w-10 h-10 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-sm lg:text-base">
                Nenhum paciente encontrado
              </p>
              <p className="text-xs lg:text-sm text-gray-400 mt-1">
                {searchTerm
                  ? "Tente buscar com outros termos"
                  : "Comece adicionando seu primeiro paciente"}
              </p>
            </CardContent>
          </Card>
        ) : (
          patients.map((patient) => (
            <Card
              key={patient.patient_id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row items-start gap-4">
                  {/* Avatar e Info */}
                  <div className="flex items-start gap-3 lg:gap-4 flex-1 w-full">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-base lg:text-lg flex-shrink-0">
                      {patient.full_name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base lg:text-lg truncate">
                        {patient.full_name}
                      </h3>
                      <div className="space-y-1 mt-1">
                        {patient.phone_main && (
                          <p className="text-xs lg:text-sm text-gray-600 truncate">
                            {patient.phone_main}
                          </p>
                        )}
                        {patient.email && (
                          <p className="text-xs lg:text-sm text-gray-600 truncate">
                            {patient.email}
                          </p>
                        )}
                        {patient.document_cpf && (
                          <p className="text-xs lg:text-sm text-gray-500">
                            CPF: {patient.document_cpf}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2 w-full lg:w-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 lg:flex-none gap-1 lg:gap-2 text-xs"
                    >
                      <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span className="hidden sm:inline">Ver Detalhes</span>
                      <span className="sm:hidden">Ver</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleEditPatient(patient)}
                    >
                      <Pencil className="w-3 h-3 lg:w-4 lg:h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="text-xs"
                      onClick={() =>
                        handleDelete(patient.patient_id, patient.full_name)
                      }
                    >
                      <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {/* Modais */}
      <NewPatientModal
        open={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreatePatient}
      />

      {selectedPatient && (
        <EditPatientModal
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPatient(null);
          }}
          patient={selectedPatient}
          onSubmit={handleUpdatePatient}
        />
      )}
    </div>
  );
};

export default Patients;
