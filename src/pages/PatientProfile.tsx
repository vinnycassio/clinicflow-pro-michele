import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronRight,
  Camera,
  Stethoscope,
  FileCheck,
  Upload,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientAvatar } from "@/components/patients/PatientAvatar";
import { PatientStatusBadge } from "@/components/patients/PatientStatusBadge";
import { cn } from "@/lib/utils";

// Mock patient data
const patientData = {
  id: "1",
  name: "Maria Silva",
  email: "maria.silva@email.com",
  phone: "(11) 99999-9999",
  birthDate: "15/03/1989",
  age: 35,
  gender: "Feminino",
  status: "active" as const,
  address: "Rua das Flores, 123 - São Paulo, SP",
  lastVisit: "15/12/2024",
  nextVisit: "22/01/2025 às 14:30",
  totalVisits: 8,
  totalSpent: "R$ 12.450,00",
};

const timelineEvents = [
  {
    id: "1",
    type: "appointment",
    title: "Agendamento confirmado",
    description: "Para 22/01/2025 às 14:30 com Dr. Rafael Martins",
    date: "Hoje",
    icon: Calendar,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "2",
    type: "visit",
    title: "Consulta realizada",
    description: "Harmonização Facial - Sessão 2",
    date: "15/12/2024",
    icon: Stethoscope,
    color: "text-success",
    bgColor: "bg-success/10",
    duration: "1h 30min",
  },
  {
    id: "3",
    type: "payment",
    title: "Pagamento recebido",
    description: "R$ 2.500,00 via PIX",
    date: "15/12/2024",
    icon: CreditCard,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    id: "4",
    type: "anamnesis",
    title: "Anamnese preenchida",
    description: "Estética Facial - Protocolo completo",
    date: "01/12/2024",
    icon: FileText,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "5",
    type: "photos",
    title: "Fotos de evolução",
    description: "4 fotos adicionadas (antes)",
    date: "20/11/2024",
    icon: Camera,
    color: "text-accent-foreground",
    bgColor: "bg-accent/30",
  },
];

export default function PatientProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("resumo");

  return (
    <AppLayout>
      <PageHeader
        title=""
        breadcrumbs={[
          { label: "Pacientes", href: "/pacientes" },
          { label: patientData.name },
        ]}
      />

      <div className="px-6 lg:px-8 py-6">
        {/* Patient Header Card */}
        <div className="card-premium p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-start gap-4">
              <PatientAvatar name={patientData.name} size="lg" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-display-1 text-foreground">
                    {patientData.name}
                  </h1>
                  <PatientStatusBadge status={patientData.status} />
                </div>
                <p className="text-muted-foreground mt-1">
                  {patientData.age} anos • {patientData.gender}
                </p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    {patientData.phone}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {patientData.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 flex flex-wrap gap-6 lg:justify-end">
              <div className="text-center lg:text-right">
                <p className="text-sm text-muted-foreground">Consultas</p>
                <p className="text-2xl font-bold text-foreground">{patientData.totalVisits}</p>
              </div>
              <div className="text-center lg:text-right">
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-foreground">{patientData.totalSpent}</p>
              </div>
              <div className="text-center lg:text-right">
                <p className="text-sm text-muted-foreground">Última Visita</p>
                <p className="text-lg font-semibold text-foreground">{patientData.lastVisit}</p>
              </div>
              <div className="text-center lg:text-right">
                <p className="text-sm text-muted-foreground">Próxima</p>
                <p className="text-lg font-semibold text-primary">{patientData.nextVisit}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border-subtle">
            <Button className="bg-primary hover:bg-primary/90">
              <Calendar className="w-4 h-4 mr-2" />
              Agendar
            </Button>
            <Button variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              Novo Orçamento
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start h-12 bg-transparent border-b border-border-subtle rounded-none p-0 gap-0">
            {[
              { value: "resumo", label: "📋 Resumo", icon: null },
              { value: "anamnese", label: "🏥 Anamnese", icon: null },
              { value: "fotos", label: "📸 Fotos", icon: null },
              { value: "tratamentos", label: "💊 Tratamentos", icon: null },
              { value: "historico", label: "📅 Histórico", icon: null },
              { value: "documentos", label: "📄 Documentos", icon: null },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-12 px-4"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="resumo" className="mt-6">
            <div className="card-premium p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-display-2 text-foreground">
                  Linha do Tempo
                </h3>
                <Button variant="outline" size="sm">
                  Filtros
                </Button>
              </div>

              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

                {/* Timeline Events */}
                <div className="space-y-6">
                  {timelineEvents.map((event, index) => {
                    const Icon = event.icon;
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "relative pl-12 opacity-0 animate-fade-in-up"
                        )}
                        style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
                      >
                        {/* Icon */}
                        <div
                          className={cn(
                            "absolute left-0 w-10 h-10 rounded-full flex items-center justify-center",
                            event.bgColor
                          )}
                        >
                          <Icon className={cn("w-5 h-5", event.color)} />
                        </div>

                        {/* Content */}
                        <div className="group p-4 rounded-xl border border-border-subtle hover:shadow-premium-sm transition-all cursor-pointer">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                {event.date}
                              </p>
                              <h4 className="font-semibold text-foreground mt-1">
                                {event.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {event.description}
                              </p>
                              {event.duration && (
                                <p className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                  <Clock className="w-3 h-3" />
                                  Duração: {event.duration}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button variant="ghost" className="w-full mt-6 text-primary hover:text-primary/80">
                Carregar mais
              </Button>
            </div>
          </TabsContent>

          {/* Anamnese Tab */}
          <TabsContent value="anamnese" className="mt-6">
            <div className="card-premium p-6">
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <div className="text-center">
                  <FileCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="font-medium">Anamnese</p>
                  <p className="text-sm">Em desenvolvimento</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="fotos" className="mt-6">
            <div className="card-premium p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-display-2 text-foreground">
                  Galeria de Fotos
                </h3>
                <Button className="bg-primary hover:bg-primary/90">
                  <Upload className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="font-medium">Nenhuma foto ainda</p>
                  <p className="text-sm">Adicione fotos de evolução do paciente</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Treatments Tab */}
          <TabsContent value="tratamentos" className="mt-6">
            <div className="card-premium p-6">
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <div className="text-center">
                  <Stethoscope className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="font-medium">Tratamentos</p>
                  <p className="text-sm">Em desenvolvimento</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="historico" className="mt-6">
            <div className="card-premium p-6">
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <div className="text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="font-medium">Histórico de Consultas</p>
                  <p className="text-sm">Em desenvolvimento</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documentos" className="mt-6">
            <div className="card-premium p-6">
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="font-medium">Documentos</p>
                  <p className="text-sm">Em desenvolvimento</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
