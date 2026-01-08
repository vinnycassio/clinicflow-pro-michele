import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  icon: LucideIcon;
  iconColor?: "primary" | "secondary" | "success" | "warning" | "accent";
  delay?: number;
}

const iconColorClasses = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  accent: "bg-accent/30 text-accent-foreground",
};

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconColor = "primary",
  delay = 0,
}: KPICardProps) {
  return (
    <div
      className="kpi-card opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl",
            iconColorClasses[iconColor]
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full",
              trend.positive
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="text-3xl font-bold text-foreground tracking-tight animate-count-up">
          {value}
        </div>
        <p className="text-sm font-medium text-muted-foreground mt-1">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
