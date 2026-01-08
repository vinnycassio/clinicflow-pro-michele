import { cn } from "@/lib/utils";

type PatientStatus = "active" | "inactive" | "pending";

interface PatientStatusBadgeProps {
  status: PatientStatus;
}

const statusConfig: Record<PatientStatus, { label: string; className: string }> = {
  active: {
    label: "Ativo",
    className: "badge-success",
  },
  inactive: {
    label: "Inativo",
    className: "badge-error",
  },
  pending: {
    label: "Pendente",
    className: "badge-warning",
  },
};

export function PatientStatusBadge({ status }: PatientStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
