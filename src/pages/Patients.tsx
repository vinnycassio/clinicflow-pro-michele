import { usePatients } from "@/hooks/usePatients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { Search, UserPlus, Eye, Trash2 } from "lucide-react";

const Patients = () => {
  const { patients, loading, error, searchPatients, deletePatient, fetchPatients } = usePatients();
  const [searchTerm, setSearchTerm] = useState("");

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

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
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
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pacientes</h1>
          <p className="text-gray-500 mt-1">{patients.length} pacientes cadastrados</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar por nome, telefone, CPF ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} variant="secondary">
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <div className="space-y-3">
        {patients.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhum paciente encontrado</p>
              <p className="text-sm text-gray-400 mt-1">
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
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                      {patient.full_name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="font-semibold text-lg">
                        {patient.full_name}
                      </h3>
                      <div className="space-y-1 mt-1">
                        {patient.phone_main && (
                          <p className="text-sm text-gray-600">
                            📱 {patient.phone_main}
                          </p>
                        )}
                        {patient.email && (
                          <p className="text-sm text-gray-600">
                            ✉️ {patient.email}
                          </p>
                        )}
                        {patient.document_cpf && (
                          <p className="text-sm text-gray-500">
                            CPF: {patient.document_cpf}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      Ver Detalhes
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() =>
                        handleDelete(patient.patient_id, patient.full_name)
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Patients;
