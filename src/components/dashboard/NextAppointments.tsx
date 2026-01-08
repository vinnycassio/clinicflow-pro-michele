import { Clock, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  patientName: string;
  patientInitials: string;
  time: string;
  type: string;
  status: "now" | "upcoming" | "soon";
  treatment?: string;
  phone?: string;
}

const appointments: Appointment[] = [
  {
    id: "1",
    patientName: "Maria Silva",
    patientInitials: "MS",
    time: "Agora",
    type: "Consulta de retorno",
    status: "now",
    phone: "(11) 99999-9999",
  },
  {
    id: "2",
    patientName: "João Santos",
    patientInitials: "JS",
    time: "14:30",
    type: "Procedimento",
    treatment: "Harmonização Facial (Sessão 2/5)",
    status: "upcoming",
    phone: "(11) 98888-8888",
  },
  {
    id: "3",
    patientName: "Ana Costa",
    patientInitials: "AC",
    time: "16:00",
    type: "Consulta",
    status: "upcoming",
    phone: "(11) 97777-7777",
  },
];

const statusConfig = {
  now: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    dot: "bg-destructive animate-pulse",
    text: "text-destructive",
  },
  soon: {
    bg: "bg-warning/10",
    border: "border-warning/30",
    dot: "bg-warning",
    text: "text-warning",
  },
  upcoming: {
    bg: "bg-muted",
    border: "border-border",
    dot: "bg-success",
    text: "text-muted-foreground",
  },
};

const avatarColors = [
  "bg-primary/80",
  "bg-secondary/80",
  "bg-success/80",
  "bg-warning/80",
  "bg-accent/80",
];

function getAvatarColor(name: string) {
  const charSum = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return avatarColors[charSum % avatarColors.length];
}

export function NextAppointments() {
  return (
    <div className="card-premium p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-display-2 text-foreground">
            Próximos Atendimentos
          </h3>
          <p className="text-caption text-muted-foreground mt-1">
            Sua agenda de hoje
          </p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
          Ver agenda
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="space-y-3">
        {appointments.map((appointment, index) => {
          const config = statusConfig[appointment.status];

          return (
            <div
              key={appointment.id}
              className={cn(
                "p-4 rounded-xl border transition-all duration-200 hover:shadow-premium-sm cursor-pointer group",
                config.bg,
                config.border,
                "opacity-0 animate-fade-in-up"
              )}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
            >
              <div className="flex items-start gap-4">
                <Avatar className={cn("w-11 h-11 border-2 border-card", getAvatarColor(appointment.patientName))}>
                  <AvatarFallback className="text-sm font-semibold text-white">
                    {appointment.patientInitials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", config.dot)} />
                    <span className={cn("text-sm font-semibold", config.text)}>
                      {appointment.time}
                    </span>
                  </div>
                  <h4 className="font-medium text-foreground mt-1 truncate">
                    {appointment.patientName}
                  </h4>
                  <p className="text-sm text-muted-foreground">{appointment.type}</p>
                  {appointment.treatment && (
                    <p className="text-xs text-muted-foreground/80 mt-0.5">
                      {appointment.treatment}
                    </p>
                  )}
                </div>

                <Button
                  variant={appointment.status === "now" ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "shrink-0 transition-all duration-200",
                    appointment.status === "now"
                      ? "bg-primary hover:bg-primary/90"
                      : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  {appointment.status === "now" ? "Iniciar" : "Ver"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
