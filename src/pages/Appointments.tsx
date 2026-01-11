import { useState } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { useProfessionals } from "@/hooks/useProfessionals";
import { NewAppointmentModal } from "@/components/appointments/NewAppointmentModal";
import { EditAppointmentModal } from "@/components/appointments/EditAppointmentModal";
import { Button } from "@/components/ui/button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProfessional, setSelectedProfessional] = useState<string>("all");
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<any>(null);

  const dateString = format(selectedDate, "yyyy-MM-dd");
  const { appointments, loading, error, updateAppointment, cancelAppointment, deleteAppointment } = useAppointments(
    selectedProfessional === "all" ? undefined : selectedProfessional,
    dateString
  );
  const { professionals } = useProfessionals();

  // Gerar dias da semana
  const weekStart = startOfWeek(selectedDate, { locale: ptBR });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Filtrar agendamentos do dia
  const todayAppointments = appointments.filter((apt) => {
    const aptDate = parseISO(apt.appointment_date);
    return isSameDay(aptDate, selectedDate);
  });

  // Estatísticas do dia
  const stats = {
    total: todayAppointments.length,
    confirmed: todayAppointments.filter((a) => a.status === "confirmed").length,
    completed: todayAppointments.filter((a) => a.status === "completed").length,
    cancelled: todayAppointments.filter((a) => a.status === "cancelled").length,
  };

  // Confirmar agendamento
  const handleConfirm = async (appointmentId: string) => {
    const result = await updateAppointment(appointmentId, { status: "confirmed" });
    if (result) {
      toast.success("Agendamento confirmado!");
    } else {
      toast.error("Erro ao confirmar agendamento");
    }
  };

  // Iniciar atendimento
  const handleStart = async (appointmentId: string) => {
    const result = await updateAppointment(appointmentId, { 
      status: "in_progress",
      actual_start_time: format(new Date(), "HH:mm:ss")
    });
    if (result) {
      toast.success("Atendimento iniciado!");
    } else {
      toast.error("Erro ao iniciar atendimento");
    }
  };

  // Completar atendimento
  const handleComplete = async (appointmentId: string) => {
    const result = await updateAppointment(appointmentId, { 
      status: "completed",
      actual_end_time: format(new Date(), "HH:mm:ss")
    });
    if (result) {
      toast.success("Atendimento concluído!");
    } else {
      toast.error("Erro ao concluir atendimento");
    }
  };

  // Abrir modal de edição
  const handleEdit = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowEditModal(true);
  };

  // Abrir dialog de cancelamento
  const handleCancelClick = (appointment: any) => {
    setAppointmentToCancel(appointment);
    setShowCancelDialog(true);
  };

  // Confirmar cancelamento
  const handleConfirmCancel = async () => {
    if (!appointmentToCancel) return;

    const reason = "Cancelado pelo sistema";
    const result = await cancelAppointment(appointmentToCancel.appointment_id, reason);
    
    if (result) {
      toast.success("Agendamento cancelado!");
      setShowCancelDialog(false);
      setAppointmentToCancel(null);
    } else {
      toast.error("Erro ao cancelar agendamento");
    }
  };

  // Deletar agendamento
  const handleDelete = async (appointmentId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este agendamento?")) {
      const result = await deleteAppointment(appointmentId);
      if (result) {
        toast.success("Agendamento excluído!");
      } else {
        toast.error("Erro ao excluir agendamento");
      }
    }
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      scheduled: {
        variant: "secondary",
        icon: Clock,
        label: "Agendado",
      },
      confirmed: {
        variant: "default",
        icon: CheckCircle2,
        label: "Confirmado",
      },
      in_progress: {
        variant: "default",
        icon: PlayCircle,
        label: "Em Atendimento",
      },
      completed: {
        variant: "outline",
        icon: CheckCircle2,
        label: "Realizado",
      },
      cancelled: {
        variant: "destructive",
        icon: XCircle,
        label: "Cancelado",
      },
      no_show: {
        variant: "destructive",
        icon: AlertCircle,
        label: "Não Compareceu",
      },
    };

    const config = variants[status] || variants.scheduled;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  // Botões de ação por status
  const getActionButtons = (appointment: any) => {
    const { status, appointment_id } = appointment;

    return (
      <div className="flex gap-2">
        {/* Editar */}
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => handleEdit(appointment)}
        >
          <Edit className="w-4 h-4" />
          Editar
        </Button>

        {/* Confirmar (se agendado) */}
        {status === "scheduled" && (
          <Button
            size="sm"
            className="gap-1"
            onClick={() => handleConfirm(appointment_id)}
          >
            <CheckCircle2 className="w-4 h-4" />
            Confirmar
          </Button>
        )}

        {/* Iniciar (se confirmado) */}
        {status === "confirmed" && (
          <Button
            size="sm"
            variant="default"
            className="gap-1"
            onClick={() => handleStart(appointment_id)}
          >
            <PlayCircle className="w-4 h-4" />
            Iniciar
          </Button>
        )}

        {/* Concluir (se em progresso) */}
        {status === "in_progress" && (
          <Button
            size="sm"
            className="gap-1"
            onClick={() => handleComplete(appointment_id)}
          >
            <CheckCircle2 className="w-4 h-4" />
            Concluir
          </Button>
        )}

        {/* Cancelar (se não foi concluído ou cancelado) */}
        {!["completed", "cancelled", "no_show"].includes(status) && (
          <Button
            size="sm"
            variant="destructive"
            className="gap-1"
            onClick={() => handleCancelClick(appointment)}
          >
            <XCircle className="w-4 h-4" />
            Cancelar
          </Button>
        )}

        {/* Deletar (sempre disponível) */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleDelete(appointment_id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  // Navegar dias
  const goToToday = () => setSelectedDate(new Date());
  const goToPrevious = () => setSelectedDate(addDays(selectedDate, -1));
  const goToNext = () => setSelectedDate(addDays(selectedDate, 1));

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
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
            <p className="text-red-600 font-medium">Erro ao carregar agenda</p>
            <p className="text-sm text-red-500 mt-1">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Agenda</h1>
            <p className="text-gray-500 mt-1">
              {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={() => setShowNewAppointmentModal(true)}
          >
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </Button>
        </div>

        {/* Controles */}
        <div className="flex gap-4 items-center">
          {/* Navegação de Data */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={goToNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Filtro de Profissional */}
          <Select
            value={selectedProfessional}
            onValueChange={setSelectedProfessional}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Todos os profissionais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os profissionais</SelectItem>
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

        {/* Calendário Semanal */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`p-3 rounded-lg text-center transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : isToday
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="text-xs font-medium">
                      {format(day, "EEE", { locale: ptBR }).toUpperCase()}
                    </div>
                    <div className="text-2xl font-bold mt-1">
                      {format(day, "d")}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Confirmados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.confirmed}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Realizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.completed}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Cancelados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {stats.cancelled}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Agendamentos */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Agendamentos do Dia ({todayAppointments.length})
          </h2>

          {todayAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  Nenhum agendamento para este dia
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  A agenda está livre no momento
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {todayAppointments
                .sort((a, b) =>
                  a.appointment_start_time.localeCompare(b.appointment_start_time)
                )
                .map((appointment) => (
                  <Card
                    key={appointment.appointment_id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Horário */}
                          <div className="text-center min-w-[80px]">
                            <div className="text-2xl font-bold text-blue-600">
                              {appointment.appointment_start_time.slice(0, 5)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {appointment.appointment_end_time.slice(0, 5)}
                            </div>
                          </div>

                          {/* Informações */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">
                                {appointment.patient?.full_name ||
                                  "Paciente não identificado"}
                              </h3>
                              {getStatusBadge(appointment.status)}
                            </div>

                            <div className="space-y-1">
                              {appointment.patient?.phone_main && (
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  {appointment.patient.phone_main}
                                </p>
                              )}
                              {appointment.professional && (
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  {appointment.professional.full_name}
                                  {appointment.professional.specialty && (
                                    <span className="text-gray-400">
                                      • {appointment.professional.specialty}
                                    </span>
                                  )}
                                </p>
                              )}
                              {appointment.service_type && (
                                <p className="text-sm text-gray-500">
                                  {appointment.service_type}
                                </p>
                              )}
                              {appointment.notes && (
                                <p className="text-sm text-gray-500 mt-2">
                                  {appointment.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Ações */}
                        {getActionButtons(appointment)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <NewAppointmentModal
        open={showNewAppointmentModal}
        onOpenChange={setShowNewAppointmentModal}
        preSelectedDate={dateString}
        preSelectedProfessional={
          selectedProfessional === "all" ? undefined : selectedProfessional
        }
      />

      {selectedAppointment && (
        <EditAppointmentModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          appointment={selectedAppointment}
        />
      )}

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar o agendamento de{" "}
              <strong>{appointmentToCancel?.patient?.full_name}</strong> para{" "}
              <strong>
                {appointmentToCancel?.appointment_start_time.slice(0, 5)}
              </strong>
              ?
              <br />
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, manter agendamento</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>
              Sim, cancelar agendamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Appointments;
