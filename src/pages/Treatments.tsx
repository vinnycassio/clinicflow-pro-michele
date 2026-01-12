import { useTreatments } from "@/hooks/useTreatments";
import { usePatients } from "@/hooks/usePatients";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Activity,
  Plus,
  Search,
  User,
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const Treatments = () => {
  const { treatments, protocols, loading, error, createTreatment, completeTreatment, cancelTreatment, deleteTreatment } = useTreatments();
  const { patients } = usePatients();
  const { professionals } = useProfessionals();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showNewTreatmentModal, setShowNewTreatmentModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    patient_id: "",
    professional_id: "",
    protocol_id: "",
    treatment_name: "",
    description: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    total_sessions: "",
    session_interval_days: "",
    notes: "",
    status: "active",
  });

  // Filtrar tratamentos
  const filteredTreatments = treatments.filter((treatment) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      treatment.patient?.full_name.toLowerCase().includes(searchLower) ||
      treatment.treatment_name.toLowerCase().includes(searchLower) ||
      treatment.professional?.full_name.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === "all" || treatment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Estatísticas
  const stats = {
    total: treatments.length,
    active: treatments.filter((t) => t.status === "active").length,
    completed: treatments.filter((t) => t.status === "completed").length,
    paused: treatments.filter((t) => t.status === "paused").length,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patient_id || !formData.professional_id || !formData.treatment_name) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const treatmentData = {
      ...formData,
      total_sessions: formData.total_sessions ? parseInt(formData.total_sessions) : null,
      session_interval_days: formData.session_interval_days ? parseInt(formData.session_interval_days) : null,
      completed_sessions: 0,
    };

    const result = await createTreatment(treatmentData);

    if (result) {
      toast.success("Tratamento criado com sucesso!");
      setShowNewTreatmentModal(false);
      setFormData({
        patient_id: "",
        professional_id: "",
        protocol_id: "",
        treatment_name: "",
        description: "",
        start_date: format(new Date(), "yyyy-MM-dd"),
        total_sessions: "",
        session_interval_days: "",
        notes: "",
        status: "active",
      });
    } else {
      toast.error("Erro ao criar tratamento");
    }
  };

  const handleComplete = async (id: string) => {
    if (window.confirm("Confirmar conclusão do tratamento?")) {
      const success = await completeTreatment(id);
      if (success) {
        toast.success("Tratamento concluído!");
      } else {
        toast.error("Erro ao concluir tratamento");
      }
    }
  };

  const handleCancel = async (id: string) => {
    const reason = window.prompt("Motivo do cancelamento:");
    if (reason !== null) {
      const success = await cancelTreatment(id, reason);
      if (success) {
        toast.success("Tratamento cancelado!");
      } else {
        toast.error("Erro ao cancelar tratamento");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este tratamento?")) {
      const success = await deleteTreatment(id);
      if (success) {
        toast.success("Tratamento excluído!");
      } else {
        toast.error("Erro ao excluir tratamento");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      active: { variant: "default", icon: Activity, label: "Em Andamento" },
      completed: { variant: "outline", icon: CheckCircle2, label: "Concluído" },
      paused: { variant: "secondary", icon: Clock, label: "Pausado" },
      cancelled: { variant: "destructive", icon: XCircle, label: "Cancelado" },
    };

    const config = variants[status] || variants.active;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const calculateProgress = (completed: number, total: number) => {
    if (!total) return 0;
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {[1, 2, 3, 4].map((i) => (
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
            <p className="text-red-600 font-medium">Erro ao carregar tratamentos</p>
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
            <h1 className="text-2xl lg:text-3xl font-bold">Tratamentos</h1>
            <p className="text-sm lg:text-base text-gray-500 mt-1">
              {treatments.length} tratamentos cadastrados
            </p>
          </div>
          <Button 
            className="w-full lg:w-auto gap-2" 
            onClick={() => setShowNewTreatmentModal(true)}
          >
            <Plus className="w-4 h-4" />
            Novo Tratamento
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-600">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-600">
                Em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold text-blue-600">
                {stats.active}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-600">
                Concluídos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold text-green-600">
                {stats.completed}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-600">
                Pausados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold text-orange-600">
                {stats.paused}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3 lg:p-4">
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                <Input
                  placeholder="Buscar por paciente, tratamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 lg:pl-10 text-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                  <SelectItem value="paused">Pausados</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Treatments List */}
        <div className="space-y-3">
          {filteredTreatments.length === 0 ? (
            <Card>
              <CardContent className="p-8 lg:p-12 text-center">
                <Activity className="w-10 h-10 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm lg:text-base">
                  Nenhum tratamento encontrado
                </p>
                <p className="text-xs lg:text-sm text-gray-400 mt-1">
                  {searchTerm || statusFilter !== "all"
                    ? "Tente ajustar os filtros"
                    : "Comece criando o primeiro tratamento"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTreatments.map((treatment) => {
              const progress = calculateProgress(
                treatment.completed_sessions || 0,
                treatment.total_sessions || 0
              );

              return (
                <Card
                  key={treatment.treatment_id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex flex-col lg:flex-row items-start gap-4">
                      {/* Conteúdo Principal */}
                      <div className="flex-1 w-full">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {treatment.patient?.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base lg:text-lg truncate">
                              {treatment.treatment_name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs lg:text-sm text-gray-500">
                              <User className="w-3 h-3 lg:w-4 lg:h-4" />
                              <span className="truncate">{treatment.patient?.full_name}</span>
                              <span>•</span>
                              {getStatusBadge(treatment.status)}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {treatment.description && (
                            <p className="text-xs lg:text-sm text-gray-600 line-clamp-2">
                              {treatment.description}
                            </p>
                          )}

                          {treatment.protocol && (
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {treatment.protocol.protocol_name}
                              </Badge>
                              {treatment.protocol.category && (
                                <span className="text-xs text-gray-400">
                                  {treatment.protocol.category}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-xs lg:text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
                              {format(new Date(treatment.start_date), "dd/MM/yy")}
                            </span>
                            {treatment.end_date && (
                              <span className="flex items-center gap-1">
                                Fim: {format(new Date(treatment.end_date), "dd/MM/yy")}
                              </span>
                            )}
                            {treatment.professional && (
                              <span className="hidden sm:inline truncate">
                                {treatment.professional.full_name}
                              </span>
                            )}
                          </div>

                          {treatment.total_sessions && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs lg:text-sm">
                                <span className="text-gray-600">
                                  Sessões: {treatment.completed_sessions || 0}/{treatment.total_sessions}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {progress}%
                                </span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botões */}
                      <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 lg:flex-none gap-1 text-xs"
                          onClick={() => {
                            setSelectedTreatment(treatment);
                            setShowViewModal(true);
                          }}
                        >
                          <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span className="hidden sm:inline">Ver</span>
                        </Button>
                        {treatment.status === "active" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => handleComplete(treatment.treatment_id)}
                            >
                              <CheckCircle2 className="w-3 h-3 lg:w-4 lg:h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => handleCancel(treatment.treatment_id)}
                            >
                              <XCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleDelete(treatment.treatment_id)}
                        >
                          <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* New Treatment Modal */}
      <Dialog open={showNewTreatmentModal} onOpenChange={setShowNewTreatmentModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Tratamento</DialogTitle>
            <DialogDescription>
              Cadastre um novo tratamento para o paciente
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Paciente e Profissional */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Paciente <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.patient_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, patient_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.patient_id} value={p.patient_id}>
                          {p.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    Profissional <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.professional_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, professional_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionals.map((p) => (
                        <SelectItem key={p.professional_id} value={p.professional_id}>
                          {p.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Protocolo */}
              <div className="space-y-2">
                <Label>Protocolo (Opcional)</Label>
                <Select
                  value={formData.protocol_id}
                  onValueChange={(value) => {
                    const protocol = protocols.find(p => p.protocol_id === value);
                    setFormData({
                      ...formData,
                      protocol_id: value,
                      treatment_name: protocol?.protocol_name || formData.treatment_name,
                      description: protocol?.description || formData.description,
                      total_sessions: protocol?.estimated_sessions?.toString() || formData.total_sessions,
                      session_interval_days: protocol?.default_interval_days?.toString() || formData.session_interval_days,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um protocolo" />
                  </SelectTrigger>
                  <SelectContent>
                    {protocols.map((p) => (
                      <SelectItem key={p.protocol_id} value={p.protocol_id}>
                        {p.protocol_name}
                        {p.category && ` - ${p.category}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nome do Tratamento */}
              <div className="space-y-2">
                <Label>
                  Nome do Tratamento <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.treatment_name}
                  onChange={(e) =>
                    setFormData({ ...formData, treatment_name: e.target.value })
                  }
                  placeholder="Ex: Tratamento para Melasma"
                  required
                />
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descreva os objetivos e detalhes do tratamento..."
                  rows={3}
                />
              </div>

              {/* Data de Início, Sessões e Intervalo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total de Sessões</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.total_sessions}
                    onChange={(e) =>
                      setFormData({ ...formData, total_sessions: e.target.value })
                    }
                    placeholder="Ex: 10"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Intervalo (dias)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.session_interval_days}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        session_interval_days: e.target.value,
                      })
                    }
                    placeholder="Ex: 7"
                  />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Anotações adicionais..."
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewTreatmentModal(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Criar Tratamento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Treatment Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base lg:text-lg">Detalhes do Tratamento</DialogTitle>
          </DialogHeader>

          {selectedTreatment && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-semibold text-base lg:text-lg mb-2">
                  {selectedTreatment.treatment_name}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(selectedTreatment.status)}
                  {selectedTreatment.protocol && (
                    <Badge variant="outline" className="text-xs">
                      {selectedTreatment.protocol.protocol_name}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs lg:text-sm">
                <div>
                  <span className="text-gray-600">Paciente:</span>
                  <p className="font-medium">{selectedTreatment.patient?.full_name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Profissional:</span>
                  <p className="font-medium">{selectedTreatment.professional?.full_name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Data de Início:</span>
                  <p className="font-medium">
                    {format(new Date(selectedTreatment.start_date), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                {selectedTreatment.end_date && (
                  <div>
                    <span className="text-gray-600">Data de Término:</span>
                    <p className="font-medium">
                      {format(new Date(selectedTreatment.end_date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}
              </div>

              {selectedTreatment.description && (
                <div>
                  <span className="text-xs lg:text-sm text-gray-600">Descrição:</span>
                  <p className="text-xs lg:text-sm mt-1">{selectedTreatment.description}</p>
                </div>
              )}

              {selectedTreatment.total_sessions && (
                <div>
                  <span className="text-xs lg:text-sm text-gray-600">Progresso das Sessões:</span>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs lg:text-sm mb-1">
                      <span>
                        {selectedTreatment.completed_sessions || 0} de {selectedTreatment.total_sessions} sessões
                      </span>
                      <span className="font-medium">
                        {calculateProgress(
                          selectedTreatment.completed_sessions || 0,
                          selectedTreatment.total_sessions
                        )}%
                      </span>
                    </div>
                    <Progress
                      value={calculateProgress(
                        selectedTreatment.completed_sessions || 0,
                        selectedTreatment.total_sessions
                      )}
                    />
                  </div>
                </div>
              )}

              {selectedTreatment.notes && (
                <div>
                  <span className="text-xs lg:text-sm text-gray-600">Observações:</span>
                  <p className="text-xs lg:text-sm mt-1 whitespace-pre-wrap">
                    {selectedTreatment.notes}
                  </p>
                </div>
              )}
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

export default Treatments;
