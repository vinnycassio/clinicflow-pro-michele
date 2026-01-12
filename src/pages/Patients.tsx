import { usePatients } from "@/hooks/usePatients";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewPatientModal } from "@/components/patients/NewPatientModal";
import { toast } from "sonner";
import { 
  Search, 
  UserPlus, 
  Eye, 
  Trash2, 
  Users, 
  Phone, 
  Mail,
  Calendar,
  FileText
} from "lucide-react";
import { format } from "date-fns";

const Patients = () => {
  const { 
    patients, 
    loading, 
    error, 
    searchPatients, 
    deletePatient, 
    fetchPatients 
  } = usePatients();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);

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

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
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
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Users className="w-7 h-7" />
            Pacientes
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            {patients.length} paciente(s) cadastrado(s)
          </p>
        </div>
        <Button 
          onClick={() => setShowNewPatientModal(true)}
          className="gap-2 w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, telefone, email ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} variant="secondary">
          <Search className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Buscar</span>
        </Button>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhum paciente encontrado</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm 
                  ? "Tente buscar com outros termos" 
                  : "Cadastre o primeiro paciente"}
              </p>
            </CardContent>
          </Card>
        ) : (
          patients.map((patient) => (
            <Card key={patient.patient_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                {/* Header do Card */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg truncate">
                      {patient.full_name}
                    </h3>
                    {patient.birth_date && (
                      <p className="text-sm text-gray-500">
                        {calculateAge(patient.birth_date)} anos
                      </p>
                    )}
                  </div>
                  <Badge variant={patient.status === "active" ? "outline" : "secondary"}>
                    {patient.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                {/* Informações de Contato */}
                <div className="space-y-2 pt-2 border-t">
                  {patient.phone_main && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{patient.phone_main}</span>
                    </div>
                  )}
                  
                  {patient.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 truncate">{patient.email}</span>
                    </div>
                  )}

                  {patient.birth_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {format(new Date(patient.birth_date), "dd/MM/yyyy")}
                      </span>
                    </div>
                  )}

                  {patient.document_cpf && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        CPF: {patient.document_cpf.replace(
                          /(\d{3})(\d{3})(\d{3})(\d{2})/,
                          "$1.$2.$3-$4"
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => toast.info("Visualização em breve")}
                  >
                    <Eye className="w-4 h-4" />
                    Ver Detalhes
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(patient.patient_id, patient.full_name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Novo Paciente */}
      <NewPatientModal
        open={showNewPatientModal}
        onOpenChange={setShowNewPatientModal}
      />
    </div>
  );
};

export default Patients;
