import { useState, useEffect } from "react";
import { User, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Patient } from "@/types/database";

interface EditPatientModalProps {
  open: boolean;
  onClose: () => void;
  patient: Patient;
  onSubmit?: (data: PatientFormData) => void;
}

interface PatientFormData {
  fullName: string;
  socialName?: string;
  birthDate: string;
  gender: string;
  cpf: string;
  rg?: string;
  phone: string;
  email: string;
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressDistrict?: string;
  addressCity?: string;
  addressState?: string;
  addressZipcode?: string;
}

export function EditPatientModal({ open, onClose, patient, onSubmit }: EditPatientModalProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<PatientFormData>({
    fullName: "",
    socialName: "",
    birthDate: "",
    gender: "",
    cpf: "",
    rg: "",
    phone: "",
    email: "",
    addressStreet: "",
    addressNumber: "",
    addressComplement: "",
    addressDistrict: "",
    addressCity: "",
    addressState: "",
    addressZipcode: "",
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        fullName: patient.full_name || "",
        socialName: patient.social_name || "",
        birthDate: patient.birth_date || "",
        gender: patient.gender || "",
        cpf: patient.document_cpf || "",
        rg: patient.document_rg || "",
        phone: patient.phone_main || "",
        email: patient.email || "",
        addressStreet: patient.address_street || "",
        addressNumber: patient.address_number || "",
        addressComplement: patient.address_complement || "",
        addressDistrict: patient.address_district || "",
        addressCity: patient.address_city || "",
        addressState: patient.address_state || "",
        addressZipcode: patient.address_zipcode || "",
      });
    }
  }, [patient]);

  const handleChange = (field: keyof PatientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border-subtle">
          <DialogTitle className="font-display text-lg sm:text-display-2">
            Editar Paciente
          </DialogTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Atualize os dados do paciente
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 sm:px-6 pt-4 border-b border-border-subtle overflow-x-auto">
              <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10 bg-muted/50 min-w-[300px]">
                <TabsTrigger
                  value="basic"
                  className="text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  📋 Básicos
                </TabsTrigger>
                <TabsTrigger
                  value="clinical"
                  className="text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  🏥 Clínicos
                </TabsTrigger>
                <TabsTrigger
                  value="address"
                  className="text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  📍 Endereço
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 sm:p-6 max-h-[50vh] overflow-y-auto">
              <TabsContent value="basic" className="mt-0 space-y-4 sm:space-y-6">
                {/* Photo Upload */}
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="relative group">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl bg-muted flex items-center justify-center border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer">
                      <User className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-foreground">
                      Foto do Paciente
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                      Arraste uma imagem ou clique para fazer upload
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs sm:text-sm">
                      Nome Completo <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Digite o nome completo"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      className="input-focus-ring text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="socialName" className="text-xs sm:text-sm">Nome Social (opcional)</Label>
                    <Input
                      id="socialName"
                      placeholder="Nome pelo qual prefere ser chamado"
                      value={formData.socialName}
                      onChange={(e) => handleChange("socialName", e.target.value)}
                      className="input-focus-ring text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthDate" className="text-xs sm:text-sm">
                        Data de Nascimento
                      </Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleChange("birthDate", e.target.value)}
                        className="input-focus-ring text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-xs sm:text-sm">
                        Gênero
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleChange("gender", value)}
                      >
                        <SelectTrigger className="input-focus-ring text-sm">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="female">Feminino</SelectItem>
                          <SelectItem value="male">Masculino</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                          <SelectItem value="prefer-not">Prefiro não dizer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cpf" className="text-xs sm:text-sm">CPF</Label>
                      <Input
                        id="cpf"
                        placeholder="000.000.000-00"
                        value={formData.cpf}
                        onChange={(e) => handleChange("cpf", e.target.value)}
                        className="input-focus-ring text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rg" className="text-xs sm:text-sm">RG</Label>
                      <Input
                        id="rg"
                        placeholder="00.000.000-0"
                        value={formData.rg}
                        onChange={(e) => handleChange("rg", e.target.value)}
                        className="input-focus-ring text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs sm:text-sm">
                        Telefone
                      </Label>
                      <Input
                        id="phone"
                        placeholder="(00) 00000-0000"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="input-focus-ring text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs sm:text-sm">
                        E-mail
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="input-focus-ring text-sm"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="clinical" className="mt-0">
                <div className="flex items-center justify-center h-32 sm:h-40 text-muted-foreground text-sm">
                  <p>Dados clínicos - Em desenvolvimento</p>
                </div>
              </TabsContent>

              <TabsContent value="address" className="mt-0 space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="addressZipcode" className="text-xs sm:text-sm">CEP</Label>
                  <Input
                    id="addressZipcode"
                    placeholder="00000-000"
                    value={formData.addressZipcode}
                    onChange={(e) => handleChange("addressZipcode", e.target.value)}
                    className="input-focus-ring text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="addressStreet" className="text-xs sm:text-sm">Rua</Label>
                    <Input
                      id="addressStreet"
                      placeholder="Nome da rua"
                      value={formData.addressStreet}
                      onChange={(e) => handleChange("addressStreet", e.target.value)}
                      className="input-focus-ring text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressNumber" className="text-xs sm:text-sm">Número</Label>
                    <Input
                      id="addressNumber"
                      placeholder="Nº"
                      value={formData.addressNumber}
                      onChange={(e) => handleChange("addressNumber", e.target.value)}
                      className="input-focus-ring text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressComplement" className="text-xs sm:text-sm">Complemento</Label>
                  <Input
                    id="addressComplement"
                    placeholder="Apto, bloco, etc."
                    value={formData.addressComplement}
                    onChange={(e) => handleChange("addressComplement", e.target.value)}
                    className="input-focus-ring text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressDistrict" className="text-xs sm:text-sm">Bairro</Label>
                  <Input
                    id="addressDistrict"
                    placeholder="Nome do bairro"
                    value={formData.addressDistrict}
                    onChange={(e) => handleChange("addressDistrict", e.target.value)}
                    className="input-focus-ring text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressCity" className="text-xs sm:text-sm">Cidade</Label>
                    <Input
                      id="addressCity"
                      placeholder="Nome da cidade"
                      value={formData.addressCity}
                      onChange={(e) => handleChange("addressCity", e.target.value)}
                      className="input-focus-ring text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressState" className="text-xs sm:text-sm">Estado</Label>
                    <Select
                      value={formData.addressState}
                      onValueChange={(value) => handleChange("addressState", value)}
                    >
                      <SelectTrigger className="input-focus-ring text-sm">
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
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-border-subtle bg-muted/30">
            <Button type="button" variant="outline" onClick={onClose} size="sm" className="text-sm">
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" size="sm">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
