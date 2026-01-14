import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardData {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon: LucideIcon;
  color: "primary" | "success" | "warning" | "secondary" | "accent";
}

interface StatsGridProps {
  stats: StatCardData[];
}

const colorVariants = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
  },
  success: {
    bg: "bg-success/10",
    text: "text-success",
    border: "border-success/20",
  },
  warning: {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/20",
  },
  secondary: {
    bg: "bg-secondary/10",
    text: "text-secondary",
    border: "border-secondary/20",
  },
  accent: {
    bg: "bg-accent/30",
    text: "text-accent-foreground",
    border: "border-accent/40",
  },
};

export const StatsGrid = ({ stats }: StatsGridProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const colors = colorVariants[stat.color];

        return (
          <div
            key={index}
            className={cn(
              "kpi-card relative overflow-hidden group",
              "animate-[fade-in-up_0.4s_ease-out_forwards]",
              `stagger-${index + 1}`
            )}
            style={{ opacity: 0, animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
          >
            {/* Background decoration */}
            <div className={cn(
              "absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-50 transition-transform group-hover:scale-110",
              colors.bg
            )} />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  "p-2.5 rounded-xl",
                  colors.bg
                )}>
                  <Icon className={cn("h-5 w-5", colors.text)} />
                </div>
                {stat.change !== undefined && (
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    stat.change >= 0 
                      ? "bg-success/10 text-success" 
                      : "bg-destructive/10 text-destructive"
                  )}>
                    {stat.change >= 0 ? "+" : ""}{stat.change}%
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground">
                    {stat.subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
