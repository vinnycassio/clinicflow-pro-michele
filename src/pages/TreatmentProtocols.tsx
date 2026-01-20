import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Protocol {
  id: string;
  name: string;
  description: string;
  specialty: string;
  sessions_count: number;
  session_duration_minutes: number;
  goals: string[];
  materials: string[];
  is_active: boolean;
  created_at: string;
}

export default function TreatmentProtocols() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadProtocols();
  }, []);

  async function loadProtocols() {
    try {
      const { data, error } = await supabase
        .from('vl_clinic_treatment_protocols')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProtocols(data || []);
    } catch (error) {
      console.error('Erro ao carregar protocolos:', error);
      toast.error('Erro ao carregar protocolos');
    } finally {
      setLoading(false);
    }
  }

  async function deleteProtocol(id: string) {
    if (!confirm('Deseja realmente excluir este protocolo?')) return;

    try {
      const { error } = await supabase
        .from('vl_clinic_treatment_protocols')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Protocolo excluído com sucesso');
      loadProtocols();
    } catch (error) {
      console.error('Erro ao excluir protocolo:', error);
      toast.error('Erro ao excluir protocolo');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Protocolos de Tratamento
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie os protocolos terapêuticos da clínica
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Protocolo
        </Button>
      </div>

      {/* Lista de Protocolos */}
      <div className="grid gap-4">
        {protocols.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">
              Nenhum protocolo cadastrado ainda
            </p>
            <Button onClick={() => setShowForm(true)}>
              Criar Primeiro Protocolo
            </Button>
          </div>
        ) : (
          protocols.map((protocol) => (
            <div
              key={protocol.id}
              className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {protocol.name}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      protocol.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {protocol.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{protocol.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>
                      <strong>Especialidade:</strong> {protocol.specialty}
                    </span>
                    <span>
                      <strong>Sessões:</strong> {protocol.sessions_count}
                    </span>
                    <span>
                      <strong>Duração:</strong> {protocol.session_duration_minutes} min
                    </span>
                  </div>

                  {protocol.goals && protocol.goals.length > 0 && (
                    <div className="mt-3">
                      <strong className="text-sm text-gray-700">Objetivos:</strong>
                      <ul className="list-disc list-inside mt-1 text-sm text-gray-600">
                        {protocol.goals.map((goal, idx) => (
                          <li key={idx}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* Implementar edição */}}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteProtocol(protocol.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal/Form - Implementar depois */}
      {showForm && (
        <ProtocolFormModal 
          onClose={() => setShowForm(false)}
          onSuccess={loadProtocols}
        />
      )}
    </div>
  );
}
