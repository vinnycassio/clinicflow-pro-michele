import { useState } from "react";
import { X, Upload, User } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface NewPatientModalProps {
  open: boolean;
  onClose: () => void;
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
}

export function NewPatientModal({ open, onClose, onSubmit }: NewPatientModalProps) {
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
  });

  const handleChange = (field: keyof PatientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-border-subtle">
          <DialogTitle className="font-display text-display-2">
            Novo Paciente
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Preencha os dados do paciente
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-4 border-b border-border-subtle">
              <TabsList className="grid w-full grid-cols-3 h-10 bg-muted/50">
                <TabsTrigger
                  value="basic"
                  className="data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  📋 Dados Básicos
                </TabsTrigger>
                <TabsTrigger
                  value="clinical"
                  className="data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  🏥 Dados Clínicos
                </TabsTrigger>
                <TabsTrigger
                  value="address"
                  className="data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  📍 Endereço
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <TabsContent value="basic" className="mt-0 space-y-6">
                {/* Photo Upload */}
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer">
                      <User className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Foto do Paciente
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Arraste uma imagem ou clique para fazer upload
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Nome Completo <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Digite o nome completo"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      className="input-focus-ring"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="socialName">Nome Social (opcional)</Label>
                    <Input
                      id="socialName"
                      placeholder="Nome pelo qual prefere ser chamado"
                      value={formData.socialName}
                      onChange={(e) => handleChange("socialName", e.target.value)}
                      className="input-focus-ring"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">
                        Data de Nascimento <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleChange("birthDate", e.target.value)}
                        className="input-focus-ring"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">
                        Gênero <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleChange("gender", value)}
                      >
                        <SelectTrigger className="input-focus-ring">
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        placeholder="000.000.000-00"
                        value={formData.cpf}
                        onChange={(e) => handleChange("cpf", e.target.value)}
                        className="input-focus-ring"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rg">RG</Label>
                      <Input
                        id="rg"
                        placeholder="00.000.000-0"
                        value={formData.rg}
                        onChange={(e) => handleChange("rg", e.target.value)}
                        className="input-focus-ring"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Telefone <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        placeholder="(00) 00000-0000"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="input-focus-ring"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        E-mail <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="input-focus-ring"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="clinical" className="mt-0">
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  <p>Dados clínicos - Em desenvolvimento</p>
                </div>
              </TabsContent>

              <TabsContent value="address" className="mt-0">
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  <p>Dados de endereço - Em desenvolvimento</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-subtle bg-muted/30">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Salvar Paciente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
