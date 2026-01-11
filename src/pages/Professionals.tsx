import { useProfessionals } from "@/hooks/useProfessionals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
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
        alert("Profissional excluído com sucesso!");
      } else {
        alert("Erro ao excluir profissional");
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Profissionais</h1>
          <p className="text-gray-500 mt-1">
            {professionals.length} profissionais cadastrados
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Novo Profissional
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email ou especialidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredProfessionals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                Nenhum profissional encontrado
              </p>
              <p className="text-sm text-gray-400 mt-1">
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
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                      {professional.full_name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {professional.full_name}
                        </h3>
                        {professional.specialty && (
                          <Badge variant="secondary">
                            {professional.specialty}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1 mt-1">
                        {professional.email && (
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {professional.email}
                          </p>
                        )}
                        {professional.phone && (
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {professional.phone}
                          </p>
                        )}
                        {professional.registry_number && (
                          <p className="text-sm text-gray-500">
                            Registro: {professional.registry_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      Ver Detalhes
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() =>
                        handleDelete(
                          professional.professional_id,
                          professional.full_name
                        )
                      }
                    >
                      <Trash2 className="w-4 h-4" />
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
