import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Users, Search, Shield, Settings as SettingsIcon, Bell } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useAuth } from "@/contexts/AuthContext";
import { UserCard } from "@/components/settings/UserCard";
import { NewUserModal } from "@/components/settings/NewUserModal";
import { NotificationsTab } from "@/components/settings/notifications/NotificationsTab";
import { toast } from "@/hooks/use-toast";
import { AppRole } from "@/types/auth";

const Settings = () => {
  const { user } = useAuth();
  const { users, loading, fetchUsers, updateUserRole, linkUserToProfessional, deleteUser } = useUsers();
  const { professionals } = useProfessionals();
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleUpdateRole = async (userId: string, role: AppRole): Promise<boolean> => {
    const success = await updateUserRole(userId, role);
    if (success) {
      toast({
        title: "Perfil atualizado",
        description: "O perfil do usuário foi atualizado com sucesso.",
      });
    }
    return success;
  };

  const handleLinkProfessional = async (userId: string, professionalId: string | null): Promise<boolean> => {
    const success = await linkUserToProfessional(userId, professionalId);
    if (success) {
      toast({
        title: professionalId ? "Profissional vinculado" : "Profissional desvinculado",
        description: professionalId 
          ? "O usuário foi vinculado ao profissional com sucesso."
          : "O usuário foi desvinculado do profissional.",
      });
    }
    return success;
  };

  const handleDeleteUser = async (userId: string): Promise<boolean> => {
    const success = await deleteUser(userId);
    if (success) {
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso.",
      });
    }
    return success;
  };

  const filteredUsers = users.filter((u) => {
    const search = searchTerm.toLowerCase();
    return (
      u.email.toLowerCase().includes(search) ||
      u.full_name?.toLowerCase().includes(search)
    );
  });

  const professionalsList = professionals.map((p) => ({
    professional_id: p.professional_id,
    full_name: p.full_name,
    user_id: p.user_id || null,
  }));

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <PageHeader
        title="Configurações"
        subtitle="Gerencie usuários e configurações do sistema"
      />

      <Tabs defaultValue="users" className="space-y-4 md:space-y-6">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="users" className="flex items-center gap-1.5 text-xs sm:text-sm flex-1 min-w-0">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">Usuários</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1.5 text-xs sm:text-sm flex-1 min-w-0">
            <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1.5 text-xs sm:text-sm flex-1 min-w-0">
            <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-1.5 text-xs sm:text-sm flex-1 min-w-0">
            <SettingsIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">Geral</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 space-y-0 pb-4 px-4 md:px-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                Gerenciamento de Usuários
              </CardTitle>
              <Button onClick={() => setShowNewUserModal(true)} className="w-full sm:w-auto" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 px-4 md:px-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum usuário encontrado</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredUsers.map((u) => (
                    <UserCard
                      key={u.id}
                      user={u}
                      professionals={professionalsList}
                      onUpdateRole={handleUpdateRole}
                      onLinkProfessional={handleLinkProfessional}
                      onDelete={handleDeleteUser}
                      currentUserId={user?.id || ""}
                    />
                  ))}
                </div>
              )}

              <div className="text-sm text-muted-foreground mt-4">
                Total: {filteredUsers.length} usuário(s)
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configurações de segurança em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configurações gerais em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NewUserModal
        open={showNewUserModal}
        onOpenChange={setShowNewUserModal}
        professionals={professionalsList}
        onUserCreated={fetchUsers}
      />
    </div>
  );
};

export default Settings;
