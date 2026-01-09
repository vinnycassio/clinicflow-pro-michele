import { usePatients } from "@/hooks/usePatients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export const Patients = () => {
  const { patients, loading, error, searchPatients, deletePatient } = usePatients();

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    if (searchTerm) {
      searchPatients(searchTerm);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este paciente?")) {
      const success = await deletePatient(id);
      if (success) {
        toast.success("Paciente excluído com sucesso!");
      } else {
        toast.error("Erro ao excluir paciente");
      }
    }
  };

  // Usar loading e error do hook
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Carregando pacientes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-500">Erro: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pacientes</h1>
        <Button>+ Novo Paciente</Button>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Buscar paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch}>Buscar</Button>
      </div>

      <div className="grid gap-4">
        {patients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Nenhum paciente encontrado</div>
        ) : (
          patients.map((patient) => (
            <div key={patient.patient_id} className="border p-4 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{patient.full_name}</h3>
                  {patient.phone_main && <p className="text-sm text-gray-600">{patient.phone_main}</p>}
                  {patient.email && <p className="text-sm text-gray-600">{patient.email}</p>}
                  {patient.document_cpf && <p className="text-sm text-gray-500 mt-1">CPF: {patient.document_cpf}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(patient.patient_id)}>
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
