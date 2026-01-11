import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePatients } from "@/hooks/usePatients";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useAppointments } from "@/hooks/useAppointments";
import { toast } from "sonner";
import { Calendar, Clock, User, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NewAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedDate?: string;
  preSelectedProfessional?: string;
}

export const NewAppointmentModal = ({
  open,
  onOpenChange,
  preSelectedDate,
  preSelectedProfessional,
}: NewAppointmentModalProps) => {
  const { patients } = usePatients();
  const { professionals } = useProfessionals();
  const { createAppointment } = useAppointments();
  
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const [formData, setFormData] = useState({
    patient_id: "",
    professional_id: preSelectedProfessional || "",
    appointment_date: preSelectedDate || format(new Date(), "yyyy-MM-dd"),
    appointment_start_time: "09:00",
    appointment_end_time: "10:00",
    service_type: "",
    status: "scheduled",
    notes: "",
    channel_origin: "presencial",
  });

  // Atualizar quando props mudarem
  useEffect(() => {
    if (preSelectedDate) {
      setFormData((prev) => ({ ...prev, appointment_date: preSelectedDate }));
    }
    if (preSelectedProfessional) {
      setFormData((prev) => ({ ...prev, professional_id: preSelectedProfessional }));
    }
  }, [preSelectedDate, preSelectedProfessional]);

  // Buscar dados do paciente selecionado
  useEffect(() => {
    if (formData.patient_id) {
      const patient = patients.find((p) => p.patient_id === formData.patient_id);
      setSelectedPatient(patient);
    } else {
      setSelectedPatient(null);
    }
  }, [formData.patient_id, patients]);

  // Calcular horário de término automaticamente
  const handleStartTimeChange = (startTime: string) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHours = hours + 1;
    const endTime = `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    
    setFormData({
      ...formData,
      appointment_start_time: startTime,
      appointment_end_time: endTime,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patient_id || !formData.professional_id) {
      toast.error("Selecione o paciente e o profissional");
      return;
    }

    if (!formData.appointment_start_time || !formData.appointment_end_time) {
      toast.error("Preencha os horários de início e fim");
      return;
    }

    // Validar horários
    if (formData.appointment_start_time >= formData.appointment_end_time) {
      toast.error("O horário de término deve ser após o horário de início");
      return;
    }

    setLoading(true);

    try {
      const result = await createAppointment(formData);

      if (result) {
        toast.success("Agendamento criado com sucesso!");
        onOpenChange(false);
        
        // Resetar formulário
        setFormData({
          patient_id: "",
          professional_id: preSelectedProfessional || "",
          appointment_date: preSelectedDate || format(new Date(), "yyyy-MM-dd"),
          appointment_start_time: "09:00",
          appointment_end_time: "10:00",
          service_type: "",
          status: "scheduled",
          notes: "",
          channel_origin: "presencial",
        });
        setSelectedPatient(null);
      } else {
        toast.error("Erro ao criar agendamento");
      }
    } catch (error: any) {
      console.error("Erro:", error);
      toast.error(error.message || "Erro ao criar agendamento");
    } finally {
      setLoading(false);
    }
  };

  // Gerar horários disponíveis (8h às 20h)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo agendamento
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Paciente */}
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
                    <SelectItem key={patient.patient_id} value={patient.patient_id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{patient.full_name}</span>
                        {patient.phone_main && (
                          <span className="text-xs text-gray-500">
                            {patient.phone_main}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Info do Paciente Selecionado */}
              {selectedPatient && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {selectedPatient.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-gray-900">
                        {selectedPatient.full_name}
                      </p>
                      {selectedPatient.phone_main && (
                        <p className="text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {selectedPatient.phone_main}
                        </p>
                      )}
                      {selectedPatient.email && (
                        <p className="text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {selectedPatient.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profissional */}
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
                    <SelectItem key={prof.professional_id} value={prof.professional_id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{prof.full_name}</span>
                        {prof.specialty && (
                          <span className="text-xs text-gray-500">
                            {prof.specialty}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="appointment_date">
                Data <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="appointment_date"
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) =>
                    setFormData({ ...formData, appointment_date: e.target.value })
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Horários */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointment_start_time">
                  Horário de Início <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Select
                    value={formData.appointment_start_time}
                    onValueChange={handleStartTimeChange}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointment_end_time">
                  Horário de Término <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Select
                    value={formData.appointment_end_time}
                    onValueChange={(value) =>
                      setFormData({ ...formData, appointment_end_time: value })
                    }
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots
                        .filter((time) => time > formData.appointment_start_time)
                        .map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Tipo de Serviço */}
            <div className="space-y-2">
              <Label htmlFor="service_type">Tipo de Serviço</Label>
              <Input
                id="service_type"
                value={formData.service_type}
                onChange={(e) =>
                  setFormData({ ...formData, service_type: e.target.value })
                }
                placeholder="Ex: Consulta de Avaliação, Limpeza de Pele..."
              />
            </div>

            {/* Status e Canal */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status Inicial</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="channel_origin">Canal de Origem</Label>
                <Select
                  value={formData.channel_origin}
                  onValueChange={(value) =>
                    setFormData({ ...formData, channel_origin: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="site">Site</SelectItem>
                    <SelectItem value="indicacao">Indicação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Observações sobre o agendamento..."
                rows={3}
              />
            </div>

            {/* Resumo */}
            {formData.patient_id && formData.professional_id && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                <h4 className="font-semibold text-sm mb-2">Resumo do Agendamento:</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-600">Paciente:</span>{" "}
                    <span className="font-medium">{selectedPatient?.full_name}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Profissional:</span>{" "}
                    <span className="font-medium">
                      {professionals.find((p) => p.professional_id === formData.professional_id)?.full_name}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Data:</span>{" "}
                    <span className="font-medium">
                      {format(new Date(formData.appointment_date + "T00:00:00"), "dd/MM/yyyy (EEEE)", { locale: ptBR })}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Horário:</span>{" "}
                    <span className="font-medium">
                      {formData.appointment_start_time} às {formData.appointment_end_time}
                    </span>
                  </p>
                  {formData.service_type && (
                    <p>
                      <span className="text-gray-600">Serviço:</span>{" "}
                      <span className="font-medium">{formData.service_type}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Agendamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
