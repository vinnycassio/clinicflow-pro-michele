import { AlertCircle, Calendar, FileText, CreditCard, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reminder {
  id: string;
  icon: React.ElementType;
  text: string;
  count?: number;
  type: "warning" | "info" | "success";
}

const reminders: Reminder[] = [
  {
    id: "1",
    icon: Calendar,
    text: "pacientes para confirmar consulta",
    count: 3,
    type: "warning",
  },
  {
    id: "2",
    icon: FileText,
    text: "prescrições para renovar",
    count: 2,
    type: "info",
  },
  {
    id: "3",
    icon: CreditCard,
    text: "orçamento aguardando aprovação",
    count: 1,
    type: "success",
  },
];

const typeConfig = {
  warning: {
    bg: "bg-warning/10",
    icon: "text-warning",
    border: "border-warning/20",
  },
  info: {
    bg: "bg-primary/10",
    icon: "text-primary",
    border: "border-primary/20",
  },
  success: {
    bg: "bg-success/10",
    icon: "text-success",
    border: "border-success/20",
  },
};

export function Reminders() {
  return (
    <div className="card-premium p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-warning" />
          <h3 className="font-semibold text-foreground">Lembretes</h3>
        </div>
      </div>

      <div className="space-y-3">
        {reminders.map((reminder, index) => {
          const config = typeConfig[reminder.type];
          const Icon = reminder.icon;

          return (
            <div
              key={reminder.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-premium-sm group",
                config.bg,
                config.border,
                "opacity-0 animate-fade-in-up"
              )}
              style={{ animationDelay: `${index * 80}ms`, animationFillMode: "forwards" }}
            >
              <div className={cn("p-2 rounded-lg", config.bg)}>
                <Icon className={cn("w-4 h-4", config.icon)} />
              </div>
              <p className="flex-1 text-sm text-foreground">
                <span className="font-semibold">{reminder.count}</span>{" "}
                {reminder.text}
              </p>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
