import { useState } from "react";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PatientAvatar } from "./PatientAvatar";
import { PatientStatusBadge } from "./PatientStatusBadge";
import { cn } from "@/lib/utils";

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  status: "active" | "inactive" | "pending";
  totalVisits: number;
}

interface PatientsTableProps {
  patients: Patient[];
  onView?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
  onSchedule?: (patient: Patient) => void;
}

export function PatientsTable({
  patients,
  onView,
  onEdit,
  onDelete,
  onSchedule,
}: PatientsTableProps) {
  return (
    <div className="card-premium overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border-subtle">
            <TableHead className="w-[300px] text-muted-foreground font-medium">
              Paciente
            </TableHead>
            <TableHead className="text-muted-foreground font-medium">
              Contato
            </TableHead>
            <TableHead className="text-muted-foreground font-medium">
              Última Consulta
            </TableHead>
            <TableHead className="text-muted-foreground font-medium">
              Status
            </TableHead>
            <TableHead className="text-muted-foreground font-medium text-right">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient, index) => (
            <TableRow
              key={patient.id}
              className={cn(
                "table-row-hover cursor-pointer border-b border-border-subtle/50",
                "opacity-0 animate-fade-in-up"
              )}
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
              onClick={() => onView?.(patient)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <PatientAvatar name={patient.name} />
                  <div>
                    <p className="font-medium text-foreground">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {patient.totalVisits} consulta{patient.totalVisits !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    {patient.phone}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    {patient.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {patient.lastVisit}
                </span>
              </TableCell>
              <TableCell>
                <PatientStatusBadge status={patient.status} />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 hover:bg-muted"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onView?.(patient);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver prontuário
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onSchedule?.(patient);
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar consulta
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(patient);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(patient);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
