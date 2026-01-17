import { useMedicalRecords } from "@/hooks/useMedicalRecords";
import { usePatients } from "@/hooks/usePatients";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useUserProfessional } from "@/hooks/useUserProfessional";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Plus,
  Search,
  User,
  Calendar,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const MedicalRecords = () => {
  const { records, loading, error, createRecord, deleteRecord } = useMedicalRecords();
  const { patients } = usePatients();
  const { professionals } = useProfessionals();
  const { getProfessionalFilter, canSeeAllProfessionals, professional: userProfessional } = useUserProfessional();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewRecordModal, setShowNewRecordModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    patient_id: "",
    professional_id: "",
    record_date: format(new Date(), "yyyy-MM-dd"),
    record_type: "consultation",
    chief_complaint: "",
    subjective_soap: "",
    objective_soap: "",
    assessment_soap: "",
    plan_soap: "",
    recommendations: "",
  });

  // Set default professional_id for professionals
  useEffect(() => {
    if (userProfessional?.professional_id && !formData.professional_id) {
      setFormData(prev => ({ ...prev, professional_id: userProfessional.professional_id }));
    }
  }, [userProfessional?.professional_id]);

  // Enriquecer com dados de paciente/profissional quando a query não traz relacionamentos
  const enrichedRecords = records.map((r) => ({
    ...r,
    patient: r.patient || patients.find((p) => p.patient_id === r.patient_id),
    professional: r.professional || professionals.find((p) => p.professional_id === r.professional_id),
  }));

  // Filter records based on user role
  const roleFilteredRecords = canSeeAllProfessionals()
    ? enrichedRecords
    : enrichedRecords.filter((r) => r.professional_id === getProfessionalFilter());

  const filteredRecords = roleFilteredRecords.filter((record) => {
    const searchLower = searchTerm.toLowerCase();
    const patientName = record.patient?.full_name || "";
    const professionalName = record.professional?.full_name || "";
    const complaint = record.chief_complaint || "";

    return (
      patientName.toLowerCase().includes(searchLower) ||
      professionalName.toLowerCase().includes(searchLower) ||
      complaint.toLowerCase().includes(searchLower)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patient_id || !formData.professional_id) {
      toast.error("Selecione o paciente e o profissional");
      return;
    }

    const result = await createRecord(formData);

    if (result) {
      toast.success("Prontuário criado com sucesso!");
      setShowNewRecordModal(false);
      setFormData({
        patient_id: "",
        professional_id: "",
        record_date: format(new Date(), "yyyy-MM-dd"),
        record_type: "consultation",
        chief_complaint: "",
        subjective_soap: "",
        objective_soap: "",
        assessment_soap: "",
        plan_soap: "",
        recommendations: "",
      });
    } else {
      toast.error("Erro ao criar prontuário");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este prontuário?")) {
      const success = await deleteRecord(id);
      if (success) {
        toast.success("Prontuário excluído com sucesso!");
      } else {
        toast.error("Erro ao excluir prontuário");
      }
    }
  };

  const getRecordTypeBadge = (type: string) => {
    const types: Record<string, { color: string; label: string }> = {
      consultation: { color: "bg-blue-100 text-blue-800", label: "Consulta" },
      return: { color: "bg-green-100 text-green-800", label: "Retorno" },
      procedure: { color: "bg-purple-100 text-purple-800", label: "Procedimento" },
      exam: { color: "bg-orange-100 text-orange-800", label: "Exame" },
      emergency: { color: "bg-red-100 text-red-800", label: "Emergência" },
    };

    const config = types[type] || types.consultation;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 lg:h-32 bg-gray-200 rounded"></div>
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
            <p className="text-red-600 font-medium">Erro ao carregar prontuários</p>
            <p className="text-sm text-red-500 mt-1">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 lg:p-8 space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Prontuários</h1>
            <p className="text-sm lg:text-base text-gray-500 mt-1">
              {records.length} prontuários cadastrados
            </p>
          </div>
          <Button 
            className="w-full lg:w-auto gap-2" 
            onClick={() => setShowNewRecordModal(true)}
          >
            <Plus className="w-4 h-4" />
            Novo Prontuário
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-3 lg:p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
              <Input
                placeholder="Buscar por paciente, profissional ou queixa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 lg:pl-10 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        <div className="space-y-3">
          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="p-8 lg:p-12 text-center">
                <FileText className="w-10 h-10 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm lg:text-base">
                  Nenhum prontuário encontrado
                </p>
                <p className="text-xs lg:text-sm text-gray-400 mt-1">
                  {searchTerm
                    ? "Tente buscar com outros termos"
                    : "Comece criando o primeiro prontuário"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record) => (
              <Card
                key={record.record_id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 lg:p-6">
                  <div className="flex flex-col lg:flex-row items-start gap-4">
                    <div className="flex-1 w-full">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {(record.patient?.full_name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base lg:text-lg truncate">
                            {record.patient?.full_name || "Paciente não identificado"}
                          </h3>
                          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-500 flex-wrap">
                            <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span>
                              {format(
                                new Date(record.record_date),
                                "dd/MM/yyyy",
                                { locale: ptBR }
                              )}
                            </span>
                            <span>•</span>
                            {getRecordTypeBadge(record.record_type)}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {record.chief_complaint && (
                          <div>
                            <span className="text-xs lg:text-sm font-medium text-gray-700">
                              Queixa Principal:
                            </span>
                            <p className="text-xs lg:text-sm text-gray-600 line-clamp-2">
                              {record.chief_complaint}
                            </p>
                          </div>
                        )}

                        {record.professional && (
                          <p className="text-xs lg:text-sm text-gray-600 flex items-center gap-2">
                            <User className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                            <span className="font-medium truncate">
                              {record.professional.full_name}
                            </span>
                            {record.professional.specialty && (
                              <span className="text-gray-400 hidden sm:inline">
                                • {record.professional.specialty}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 w-full lg:w-auto lg:ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 lg:flex-none gap-1 lg:gap-2 text-xs"
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowViewModal(true);
                        }}
                      >
                        <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                        <span className="hidden sm:inline">Ver Completo</span>
                        <span className="sm:hidden">Ver</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleDelete(record.record_id)}
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
      </div>

      {/* New Record Modal */}
      <Dialog open={showNewRecordModal} onOpenChange={setShowNewRecordModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Prontuário</DialogTitle>
            <DialogDescription>
              Preencha os dados do atendimento
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Paciente e Profissional */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient_id">
                    Paciente <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.patient_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, patient_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem
                          key={patient.patient_id}
                          value={patient.patient_id}
                        >
                          {patient.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professional_id">
                    Profissional <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.professional_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, professional_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionals.map((prof) => (
                        <SelectItem
                          key={prof.professional_id}
                          value={prof.professional_id}
                        >
                          {prof.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Data e Tipo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="record_date">Data do Atendimento</Label>
                  <Input
                    id="record_date"
                    type="date"
                    value={formData.record_date}
                    onChange={(e) =>
                      setFormData({ ...formData, record_date: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="record_type">Tipo de Atendimento</Label>
                  <Select
                    value={formData.record_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, record_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consulta</SelectItem>
                      <SelectItem value="return">Retorno</SelectItem>
                      <SelectItem value="procedure">Procedimento</SelectItem>
                      <SelectItem value="exam">Exame</SelectItem>
                      <SelectItem value="emergency">Emergência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Queixa Principal */}
              <div className="space-y-2">
                <Label htmlFor="chief_complaint">Queixa Principal</Label>
                <Textarea
                  id="chief_complaint"
                  value={formData.chief_complaint}
                  onChange={(e) =>
                    setFormData({ ...formData, chief_complaint: e.target.value })
                  }
                  placeholder="Descreva a queixa principal do paciente..."
                  rows={2}
                />
              </div>

              {/* SOAP - Subjetivo */}
              <div className="space-y-2">
                <Label htmlFor="subjective_soap">Subjetivo (S)</Label>
                <Textarea
                  id="subjective_soap"
                  value={formData.subjective_soap}
                  onChange={(e) =>
                    setFormData({ ...formData, subjective_soap: e.target.value })
                  }
                  placeholder="História relatada pelo paciente, sintomas, queixas..."
                  rows={3}
                />
              </div>

              {/* SOAP - Objetivo */}
              <div className="space-y-2">
                <Label htmlFor="objective_soap">Objetivo (O)</Label>
                <Textarea
                  id="objective_soap"
                  value={formData.objective_soap}
                  onChange={(e) =>
                    setFormData({ ...formData, objective_soap: e.target.value })
                  }
                  placeholder="Exame físico, sinais vitais, achados objetivos..."
                  rows={3}
                />
              </div>

              {/* SOAP - Avaliação */}
              <div className="space-y-2">
                <Label htmlFor="assessment_soap">Avaliação (A)</Label>
                <Textarea
                  id="assessment_soap"
                  value={formData.assessment_soap}
                  onChange={(e) =>
                    setFormData({ ...formData, assessment_soap: e.target.value })
                  }
                  placeholder="Diagnóstico, impressão clínica..."
                  rows={3}
                />
              </div>

              {/* SOAP - Plano */}
              <div className="space-y-2">
                <Label htmlFor="plan_soap">Plano (P)</Label>
                <Textarea
                  id="plan_soap"
                  value={formData.plan_soap}
                  onChange={(e) =>
                    setFormData({ ...formData, plan_soap: e.target.value })
                  }
                  placeholder="Tratamento proposto, medicações, exames solicitados..."
                  rows={3}
                />
              </div>

              {/* Recomendações */}
              <div className="space-y-2">
                <Label htmlFor="recommendations">Recomendações</Label>
                <Textarea
                  id="recommendations"
                  value={formData.recommendations}
                  onChange={(e) =>
                    setFormData({ ...formData, recommendations: e.target.value })
                  }
                  placeholder="Orientações gerais, cuidados, retorno..."
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewRecordModal(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Salvar Prontuário
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Record Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base lg:text-lg">Prontuário Completo</DialogTitle>
            <DialogDescription className="text-xs lg:text-sm">
              {selectedRecord?.patient?.full_name} •{" "}
              {selectedRecord &&
                format(new Date(selectedRecord.record_date), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-semibold text-xs lg:text-sm text-gray-700 mb-1">
                  Queixa Principal
                </h3>
                <p className="text-xs lg:text-sm text-gray-600">
                  {selectedRecord.chief_complaint || "Não informado"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-xs lg:text-sm text-gray-700 mb-1">
                  Subjetivo (S)
                </h3>
                <p className="text-xs lg:text-sm text-gray-600 whitespace-pre-wrap">
                  {selectedRecord.subjective_soap || "Não informado"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-xs lg:text-sm text-gray-700 mb-1">
                  Objetivo (O)
                </h3>
                <p className="text-xs lg:text-sm text-gray-600 whitespace-pre-wrap">
                  {selectedRecord.objective_soap || "Não informado"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-xs lg:text-sm text-gray-700 mb-1">
                  Avaliação (A)
                </h3>
                <p className="text-xs lg:text-sm text-gray-600 whitespace-pre-wrap">
                  {selectedRecord.assessment_soap || "Não informado"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-xs lg:text-sm text-gray-700 mb-1">
                  Plano (P)
                </h3>
                <p className="text-xs lg:text-sm text-gray-600 whitespace-pre-wrap">
                  {selectedRecord.plan_soap || "Não informado"}
                </p>
              </div>

              {selectedRecord.recommendations && (
                <div>
                  <h3 className="font-semibold text-xs lg:text-sm text-gray-700 mb-1">
                    Recomendações
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-600 whitespace-pre-wrap">
                    {selectedRecord.recommendations}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Profissional: {selectedRecord.professional?.full_name}
                </p>
                <p className="text-xs text-gray-500">
                  Data de criação:{" "}
                  {format(new Date(selectedRecord.created_at), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowViewModal(false)}
              className="w-full sm:w-auto"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MedicalRecords;
