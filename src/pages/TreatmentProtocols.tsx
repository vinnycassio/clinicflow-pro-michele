import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, X, FileText } from 'lucide-react';
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
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null);

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

  function handleEdit(protocol: Protocol) {
    setEditingProtocol(protocol);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingProtocol(null);
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
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4 text-lg">
              Nenhum protocolo cadastrado ainda
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
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
                        {protocol.goals.slice(0, 3).map((goal, idx) => (
                          <li key={idx}>{goal}</li>
                        ))}
                        {protocol.goals.length > 3 && (
                          <li className="text-blue-600">+{protocol.goals.length - 3} objetivos</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(protocol)}
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

      {/* Modal de Formulário */}
      {showForm && (
        <ProtocolFormModal 
          onClose={handleCloseForm}
          onSuccess={() => {
            loadProtocols();
            handleCloseForm();
          }}
          editData={editingProtocol}
        />
      )}
    </div>
  );
}

// Componente de Formulário
interface ProtocolFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editData?: Protocol | null;
}

function ProtocolFormModal({ onClose, onSuccess, editData }: ProtocolFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: editData?.name || '',
    description: editData?.description || '',
    specialty: editData?.specialty || 'fonoaudiologia',
    sessions_count: editData?.sessions_count || 12,
    session_duration_minutes: editData?.session_duration_minutes || 50,
    goals: editData?.goals?.join('\n') || '',
    materials: editData?.materials?.join('\n') || '',
    is_active: editData?.is_active ?? true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Pegar clinic_id do usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: userData } = await supabase
        .from('vl_clinic_core_users')
        .select('clinic_id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData?.clinic_id) {
        throw new Error('Clínica não identificada');
      }

      const protocolData = {
        clinic_id: userData.clinic_id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        specialty: formData.specialty,
        sessions_count: parseInt(formData.sessions_count.toString()),
        session_duration_minutes: parseInt(formData.session_duration_minutes.toString()),
        goals: formData.goals.split('\n').filter(g => g.trim()).map(g => g.trim()),
        materials: formData.materials.split('\n').filter(m => m.trim()).map(m => m.trim()),
        is_active: formData.is_active,
      };

      if (editData) {
        const { error } = await supabase
          .from('vl_clinic_treatment_protocols')
          .update(protocolData)
          .eq('id', editData.id);

        if (error) throw error;
        toast.success('Protocolo atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('vl_clinic_treatment_protocols')
          .insert(protocolData);

        if (error) throw error;
        toast.success('Protocolo criado com sucesso!');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Erro ao salvar protocolo:', error);
      toast.error(error.message || 'Erro ao salvar protocolo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {editData ? 'Editar Protocolo' : 'Novo Protocolo'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Protocolo *
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Protocolo de Apraxia de Fala Infantil"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <Textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o protocolo de tratamento..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialidade
              </label>
              <select
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              >
                <option value="fonoaudiologia">Fonoaudiologia</option>
                <option value="psicologia">Psicologia</option>
                <option value="fisioterapia">Fisioterapia</option>
                <option value="terapia_ocupacional">Terapia Ocupacional</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.is_active ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Sessões
              </label>
              <Input
                type="number"
                min="1"
                value={formData.sessions_count}
                onChange={(e) => setFormData({ ...formData, sessions_count: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duração (minutos)
              </label>
              <Input
                type="number"
                min="15"
                step="15"
                value={formData.session_duration_minutes}
                onChange={(e) => setFormData({ ...formData, session_duration_minutes: parseInt(e.target.value) || 30 })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objetivos (um por linha)
            </label>
            <Textarea
              rows={4}
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              placeholder="Melhorar articulação dos fonemas&#10;Desenvolver consciência fonológica&#10;Ampliar vocabulário expressivo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Materiais Necessários (um por linha)
            </label>
            <Textarea
              rows={4}
              value={formData.materials}
              onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
              placeholder="Espelho de mesa&#10;Cartões ilustrados&#10;Jogos de consciência fonológica"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : editData ? 'Atualizar' : 'Criar Protocolo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
