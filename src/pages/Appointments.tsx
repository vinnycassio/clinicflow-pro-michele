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
      notes: `Iniciado às ${format(new Date(), "HH:mm:ss")}`
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
      notes: `Concluído às ${format(new Date(), "HH:mm:ss")}`
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
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {/* Editar */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 sm:px-3 gap-1"
          onClick={() => handleEdit(appointment)}
        >
          <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden md:inline">Editar</span>
        </Button>

        {/* Confirmar (se agendado) */}
        {status === "scheduled" && (
          <Button
            size="sm"
            className="h-8 px-2 sm:px-3 gap-1"
            onClick={() => handleConfirm(appointment_id)}
          >
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline">Confirmar</span>
          </Button>
        )}

        {/* Iniciar (se confirmado) */}
        {status === "confirmed" && (
          <Button
            size="sm"
            variant="default"
            className="h-8 px-2 sm:px-3 gap-1"
            onClick={() => handleStart(appointment_id)}
          >
            <PlayCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline">Iniciar</span>
          </Button>
        )}

        {/* Concluir (se em progresso) */}
        {status === "in_progress" && (
          <Button
            size="sm"
            className="h-8 px-2 sm:px-3 gap-1"
            onClick={() => handleComplete(appointment_id)}
          >
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline">Concluir</span>
          </Button>
        )}

        {/* Cancelar (se não foi concluído ou cancelado) */}
        {!["completed", "cancelled", "no_show"].includes(status) && (
          <Button
            size="sm"
            variant="destructive"
            className="h-8 px-2 sm:px-3 gap-1"
            onClick={() => handleCancelClick(appointment)}
          >
            <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline">Cancelar</span>
          </Button>
        )}

        {/* Deletar (sempre disponível) */}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => handleDelete(appointment_id)}
        >
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
      <div className="p-4 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="p-4 lg:p-8">
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
      <div className="p-4 lg:p-8 space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Agenda</h1>
            <p className="text-sm lg:text-base text-gray-500 mt-1">
              {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </p>
          </div>
          <Button
            className="w-full lg:w-auto gap-2"
            onClick={() => setShowNewAppointmentModal(true)}
          >
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </Button>
        </div>

      {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Navegação de Data */}
          <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 sm:h-9 sm:w-auto sm:px-3" onClick={goToPrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-9 px-3" onClick={goToToday}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 sm:h-9 sm:w-auto sm:px-3" onClick={goToNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Filtro de Profissional */}
          <Select
            value={selectedProfessional}
            onValueChange={setSelectedProfessional}
          >
            <SelectTrigger className="w-full sm:w-56 lg:w-64">
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
        <Card className="overflow-hidden">
          <CardContent className="p-2 sm:p-3 lg:p-4">
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 lg:gap-2">
              {weekDays.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`p-1.5 sm:p-2 lg:p-3 rounded-md sm:rounded-lg text-center transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : isToday
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="text-[10px] sm:text-xs font-medium truncate">
                      {format(day, "EEEEE", { locale: ptBR }).toUpperCase()}
                    </div>
                    <div className="text-sm sm:text-lg lg:text-2xl font-bold mt-0.5 sm:mt-1">
                      {format(day, "d")}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
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
                Confirmados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold text-blue-600">
                {stats.confirmed}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-600">
                Realizados
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
                Cancelados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold text-red-600">
                {stats.cancelled}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Agendamentos */}
        <div>
          <h2 className="text-lg lg:text-xl font-semibold mb-4">
            Agendamentos do Dia ({todayAppointments.length})
          </h2>

          {todayAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 lg:p-12 text-center">
                <Calendar className="w-10 h-10 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-3" />
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
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex flex-col gap-3 sm:gap-4">
                        {/* Mobile: Linha superior com horário e status */}
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Horário */}
                          <div className="text-center min-w-[50px] sm:min-w-[60px] lg:min-w-[80px] shrink-0">
                            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">
                              {appointment.appointment_start_time.slice(0, 5)}
                            </div>
                            <div className="text-[10px] sm:text-xs text-muted-foreground">
                              {appointment.appointment_end_time.slice(0, 5)}
                            </div>
                          </div>

                          {/* Informações */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                              <h3 className="font-semibold text-sm sm:text-base lg:text-lg truncate max-w-[200px] sm:max-w-none">
                                {appointment.patient?.full_name ||
                                  "Paciente não identificado"}
                              </h3>
                              {getStatusBadge(appointment.status)}
                            </div>

                            <div className="space-y-0.5 sm:space-y-1">
                              {appointment.patient?.phone_main && (
                                <p className="text-[11px] sm:text-xs lg:text-sm text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                                  <Phone className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{appointment.patient.phone_main}</span>
                                </p>
                              )}
                              {appointment.professional && (
                                <p className="text-[11px] sm:text-xs lg:text-sm text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                                  <User className="w-3 h-3 shrink-0" />
                                  <span className="truncate">
                                    {appointment.professional.full_name}
                                    {appointment.professional.specialty && (
                                      <span className="hidden sm:inline text-muted-foreground/70">
                                        {" "}• {appointment.professional.specialty}
                                      </span>
                                    )}
                                  </span>
                                </p>
                              )}
                              {appointment.service_type && (
                                <p className="text-[11px] sm:text-xs lg:text-sm text-muted-foreground truncate">
                                  {appointment.service_type}
                                </p>
                              )}
                              {appointment.notes && (
                                <p className="text-[11px] sm:text-xs lg:text-sm text-muted-foreground/80 mt-1 sm:mt-2 line-clamp-2">
                                  {appointment.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Ações - sempre abaixo em mobile, ao lado em desktop */}
                        <div className="flex justify-end border-t pt-3 sm:border-t-0 sm:pt-0 lg:border-t-0">
                          {getActionButtons(appointment)}
                        </div>
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
