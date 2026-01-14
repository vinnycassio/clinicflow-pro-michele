import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Link, Unlink, User, Mail, Phone } from "lucide-react";
import { SystemUser } from "@/hooks/useUsers";
import { AppRole, ROLE_LABELS } from "@/types/auth";

interface Professional {
  professional_id: string;
  full_name: string;
  user_id: string | null;
}

interface UserCardProps {
  user: SystemUser;
  professionals: Professional[];
  onUpdateRole: (userId: string, role: AppRole) => Promise<boolean>;
  onLinkProfessional: (userId: string, professionalId: string | null) => Promise<boolean>;
  onDelete: (userId: string) => Promise<boolean>;
  currentUserId: string;
}

const ROLE_COLORS: Record<AppRole, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  professional: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  receptionist: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export const UserCard = ({
  user,
  professionals,
  onUpdateRole,
  onLinkProfessional,
  onDelete,
  currentUserId,
}: UserCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<string>(
    user.linked_professional_id || ""
  );

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const handleRoleChange = async (newRole: AppRole) => {
    setIsUpdating(true);
    await onUpdateRole(user.id, newRole);
    setIsUpdating(false);
  };

  const handleLinkProfessional = async () => {
    setIsUpdating(true);
    await onLinkProfessional(user.id, selectedProfessional || null);
    setShowLinkDialog(false);
    setIsUpdating(false);
  };

  const handleUnlinkProfessional = async () => {
    setIsUpdating(true);
    await onLinkProfessional(user.id, null);
    setIsUpdating(false);
  };

  // Available professionals (not linked to other users)
  const availableProfessionals = professionals.filter(
    (p) => !p.user_id || p.user_id === user.id
  );

  const isCurrentUser = user.id === currentUserId;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
          {/* Avatar + Info Section */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm sm:text-base">
                {getInitials(user.full_name, user.email)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">
                  {user.full_name || "Sem nome"}
                </h3>
                {isCurrentUser && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    Você
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>

              {user.phone && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">
                  <Phone className="h-3 w-3 shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}

              {user.linked_professional_name && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">
                  <User className="h-3 w-3 shrink-0" />
                  <span className="truncate">Vinculado a: {user.linked_professional_name}</span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-2 sm:mt-3">
                <Badge className={`${ROLE_COLORS[user.role]} text-xs`}>
                  {ROLE_LABELS[user.role]}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex flex-row sm:flex-col gap-2 mt-2 sm:mt-0 border-t sm:border-t-0 pt-3 sm:pt-0">
            <Select
              value={user.role}
              onValueChange={(value) => handleRoleChange(value as AppRole)}
              disabled={isUpdating || isCurrentUser}
            >
              <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="professional">Profissional</SelectItem>
                <SelectItem value="receptionist">Recepcionista</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-1 shrink-0">
              {user.linked_professional_id ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnlinkProfessional}
                  disabled={isUpdating}
                  title="Desvincular profissional"
                >
                  <Unlink className="h-4 w-4" />
                </Button>
              ) : (
                <AlertDialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUpdating || availableProfessionals.length === 0}
                      title="Vincular a profissional"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Vincular a Profissional</AlertDialogTitle>
                      <AlertDialogDescription>
                        Selecione o profissional que será vinculado a este usuário.
                        O usuário terá acesso apenas aos dados deste profissional.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <Select
                        value={selectedProfessional}
                        onValueChange={setSelectedProfessional}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um profissional" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProfessionals.map((prof) => (
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
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLinkProfessional}
                        disabled={!selectedProfessional}
                      >
                        Vincular
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={isUpdating || isCurrentUser}
                    title="Excluir usuário"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o usuário{" "}
                      <strong>{user.full_name || user.email}</strong>? Esta ação
                      não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(user.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
