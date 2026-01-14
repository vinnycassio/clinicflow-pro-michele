import { Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardHeaderProps {
  onRefresh: () => void;
  isLoading?: boolean;
  selectedPeriod: string;
  onPeriodChange: (value: string) => void;
}

export const DashboardHeader = ({
  onRefresh,
  isLoading,
  selectedPeriod,
  onPeriodChange,
}: DashboardHeaderProps) => {
  const { authUser } = useAuth();
  const today = new Date();
  const greeting = today.getHours() < 12 ? "Bom dia" : today.getHours() < 18 ? "Boa tarde" : "Boa noite";
  
  // Get first name from profile or email
  const firstName = authUser?.profile?.full_name?.split(' ')[0] || 
                    authUser?.email?.split('@')[0] || 
                    'Usuário';

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">
          {greeting}, {firstName}! 👋
        </h1>
        <p className="text-muted-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {today.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={selectedPeriod} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="quarter">Trimestre</SelectItem>
            <SelectItem value="year">Este Ano</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className="shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
};
