import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { usePatients } from "@/hooks/usePatients";
import { Loader2, User, Mail, Phone, Calendar, FileText, MapPin } from "lucide-react";

interface NewPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewPatientModal = ({ open, onOpenChange }: NewPatientModalProps) => {
  const { createPatient } = usePatients();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    birth_date: "",
    email: "",
    phone_main: "",
    phone_secondary: "",
    document_cpf: "",
    document_rg: "",
    gender: "",
    address_street: "",
    address_number: "",
    address_complement: "",
    address_neighborhood: "",
    address_city: "",
    address_state: "",
    address_zipcode: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    notes: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (!formData.full_name.trim()) {
      toast.error("Nome completo é obrigatório");
      return;
    }

    if (!formData.phone_main.trim()) {
      toast.error("Telefone principal é obrigatório");
      return;
    }

    if (!formData.birth_date) {
      toast.error("Data de nascimento é obrigatória");
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar dados para o Supabase
      const patientData = {
        full_name: formData.full_name.trim(),
        birth_date: formData.birth_date,
        email: formData.email.trim() || null,
        phone_main: formData.phone_main.replace(/\D/g, ""),
        phone_secondary: formData.phone_secondary ? formData.phone_secondary.replace(/\D/g, "") : null,
        document_cpf: formData.document_cpf ? formData.document_cpf.replace(/\D/g, "") : null,
        document_rg: formData.document_rg.trim() || null,
        gender: formData.gender || null,
        address_street: formData.address_street.trim() || null,
        address_number: formData.address_number.trim() || null,
        address_complement: formData.address_complement.trim() || null,
        address_neighborhood: formData.address_neighborhood.trim() || null,
        address_city: formData.address_city.trim() || null,
        address_state: formData.address_state || null,
        address_zipcode: formData.address_zipcode ? formData.address_zipcode.replace(/\D/g, "") : null,
        emergency_contact_name: formData.emergency_contact_name.trim() || null,
        emergency_contact_phone: formData.emergency_contact_phone ? formData.emergency_contact_phone.replace(/\D/g, "") : null,
        emergency_contact_relationship: formData.emergency_contact_relationship.trim() || null,
        notes: formData.notes.trim() || null,
        status: "active" as const,
      };

      const newPatient = await createPatient(patientData);

      if (newPatient) {
        toast.success("Paciente cadastrado com sucesso!");
        onOpenChange(false);
        
        // Resetar formulário
        setFormData({
          full_name: "",
          birth_date: "",
          email: "",
          phone_main: "",
          phone_secondary: "",
          document_cpf: "",
          document_rg: "",
          gender: "",
          address_street: "",
          address_number: "",
          address_complement: "",
          address_neighborhood: "",
          address_city: "",
          address_state: "",
          address_zipcode: "",
          emergency_contact_name: "",
          emergency_contact_phone: "",
          emergency_contact_relationship: "",
          notes: "",
        });
      } else {
        toast.error("Erro ao cadastrar paciente");
      }
    } catch (error: any) {
      console.error("Erro ao cadastrar paciente:", error);
      toast.error(error.message || "Erro ao cadastrar paciente");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Novo Paciente
          </DialogTitle>
          <DialogDescription>
            Cadastre um novo paciente no sistema. Campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">
                Dados Pessoais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="full_name">
                    Nome Completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    placeholder="Ex: Maria Silva Santos"
                    value={formData.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth_date">
                    Data de Nascimento <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => handleChange("birth_date", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Sexo</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document_cpf">CPF</Label>
                  <Input
                    id="document_cpf"
                    placeholder="000.000.000-00"
                    value={formData.document_cpf}
                    onChange={(e) => handleChange("document_cpf", e.target.value)}
                    maxLength={14}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document_rg">RG</Label>
                  <Input
                    id="document_rg"
                    placeholder="00.000.000-0"
                    value={formData.document_rg}
                    onChange={(e) => handleChange("document_rg", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">
                Contato
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone_main">
                    Telefone Principal <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone_main"
                      placeholder="(00) 00000-0000"
                      value={formData.phone_main}
                      onChange={(e) => handleChange("phone_main", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_secondary">Telefone Secundário</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone_secondary"
                      placeholder="(00) 00000-0000"
                      value={formData.phone_secondary}
                      onChange={(e) => handleChange("phone_secondary", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">
                Endereço
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address_street">Rua/Avenida</Label>
                  <Input
                    id="address_street"
                    placeholder="Ex: Rua das Flores"
                    value={formData.address_street}
                    onChange={(e) => handleChange("address_street", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_number">Número</Label>
                  <Input
                    id="address_number"
                    placeholder="Ex: 123"
                    value={formData.address_number}
                    onChange={(e) => handleChange("address_number", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_complement">Complemento</Label>
                  <Input
                    id="address_complement"
                    placeholder="Ex: Apto 45"
                    value={formData.address_complement}
                    onChange={(e) => handleChange("address_complement", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_neighborhood">Bairro</Label>
                  <Input
                    id="address_neighborhood"
                    placeholder="Ex: Centro"
                    value={formData.address_neighborhood}
                    onChange={(e) => handleChange("address_neighborhood", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_city">Cidade</Label>
                  <Input
                    id="address_city"
                    placeholder="Ex: São Paulo"
                    value={formData.address_city}
                    onChange={(e) => handleChange("address_city", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_state">Estado</Label>
                  <Select value={formData.address_state} onValueChange={(value) => handleChange("address_state", value)}>
                    <SelectTrigger id="address_state">
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">AC</SelectItem>
                      <SelectItem value="AL">AL</SelectItem>
                      <SelectItem value="AP">AP</SelectItem>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="BA">BA</SelectItem>
                      <SelectItem value="CE">CE</SelectItem>
                      <SelectItem value="DF">DF</SelectItem>
                      <SelectItem value="ES">ES</SelectItem>
                      <SelectItem value="GO">GO</SelectItem>
                      <SelectItem value="MA">MA</SelectItem>
                      <SelectItem value="MT">MT</SelectItem>
                      <SelectItem value="MS">MS</SelectItem>
                      <SelectItem value="MG">MG</SelectItem>
                      <SelectItem value="PA">PA</SelectItem>
                      <SelectItem value="PB">PB</SelectItem>
                      <SelectItem value="PR">PR</SelectItem>
                      <SelectItem value="PE">PE</SelectItem>
                      <SelectItem value="PI">PI</SelectItem>
                      <SelectItem value="RJ">RJ</SelectItem>
                      <SelectItem value="RN">RN</SelectItem>
                      <SelectItem value="RS">RS</SelectItem>
                      <SelectItem value="RO">RO</SelectItem>
                      <SelectItem value="RR">RR</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="SP">SP</SelectItem>
                      <SelectItem value="SE">SE</SelectItem>
                      <SelectItem value="TO">TO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_zipcode">CEP</Label>
                  <Input
                    id="address_zipcode"
                    placeholder="00000-000"
                    value={formData.address_zipcode}
                    onChange={(e) => handleChange("address_zipcode", e.target.value)}
                    maxLength={9}
                  />
                </div>
              </div>
            </div>

            {/* Contato de Emergência */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">
                Contato de Emergência
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">Nome</Label>
                  <Input
                    id="emergency_contact_name"
                    placeholder="Ex: João Silva"
                    value={formData.emergency_contact_name}
                    onChange={(e) => handleChange("emergency_contact_name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">Telefone</Label>
                  <Input
                    id="emergency_contact_phone"
                    placeholder="(00) 00000-0000"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => handleChange("emergency_contact_phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_relationship">Parentesco</Label>
                  <Input
                    id="emergency_contact_relationship"
                    placeholder="Ex: Esposo, Mãe, Irmão"
                    value={formData.emergency_contact_relationship}
                    onChange={(e) => handleChange("emergency_contact_relationship", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">
                Observações
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Anotações Gerais</Label>
                <Textarea
                  id="notes"
                  placeholder="Observações importantes sobre o paciente..."
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar Paciente"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
