import { useProfessionals } from "@/hooks/useProfessionals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { Search, UserPlus, Eye, Trash2, Users, Mail, Phone } from "lucide-react";

const Professionals = () => {
  const { professionals, loading, error, deleteProfessional } = useProfessionals();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProfessionals = professionals.filter((prof) =>
    prof.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prof.email && prof.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (prof.specialty && prof.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir ${name}?`)) {
      const success = await deleteProfessional(id);
      if (success) {
        toast.success("Profissional excluído com sucesso!");
      } else {
        toast.error("Erro ao excluir profissional");
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 lg:h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 lg:p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600 font-medium">Erro ao carregar profissionais</p>
            <p className="text-sm text-red-500 mt-1">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Profissionais</h1>
          <p className="text-sm lg:text-base text-gray-500 mt-1">
            {professionals.length} profissionais cadastrados
          </p>
        </div>
        <Button className="w-full lg:w-auto gap-2">
          <UserPlus className="w-4 h-4" />
          Novo Profissional
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-3 lg:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email ou especialidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 lg:pl-10 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Professionals List */}
      <div className="space-y-3">
        {filteredProfessionals.length === 0 ? (
          <Card>
            <CardContent className="p-8 lg:p-12 text-center">
              <Users className="w-10 h-10 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-sm lg:text-base">
                Nenhum profissional encontrado
              </p>
              <p className="text-xs lg:text-sm text-gray-400 mt-1">
                {searchTerm
                  ? "Tente buscar com outros termos"
                  : "Comece adicionando seu primeiro profissional"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProfessionals.map((professional) => (
            <Card
              key={professional.professional_id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row items-start gap-4">
                  {/* Avatar e Info */}
                  <div className="flex items-start gap-3 lg:gap-4 flex-1 w-full">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-base lg:text-lg flex-shrink-0">
                      {professional.full_name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base lg:text-lg truncate">
                          {professional.full_name}
                        </h3>
                        {professional.specialty && (
                          <Badge variant="secondary" className="text-xs">
                            {professional.specialty}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1 mt-1">
                        {professional.email && (
                          <p className="text-xs lg:text-sm text-gray-600 flex items-center gap-2 truncate">
                            <Mail className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                            <span className="truncate">{professional.email}</span>
                          </p>
                        )}
                        {professional.phone && (
                          <p className="text-xs lg:text-sm text-gray-600 flex items-center gap-2">
                            <Phone className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                            {professional.phone}
                          </p>
                        )}
                        {professional.registry_number && (
                          <p className="text-xs lg:text-sm text-gray-500">
                            Registro: {professional.registry_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2 w-full lg:w-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 lg:flex-none gap-1 lg:gap-2 text-xs"
                    >
                      <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span className="hidden sm:inline">Ver Detalhes</span>
                      <span className="sm:hidden">Ver</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="text-xs"
                      onClick={() =>
                        handleDelete(
                          professional.professional_id,
                          professional.full_name
                        )
                      }
                    >
                      <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Professionals;
