import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Protocol {
  protocol_id: string;
  protocol_name: string;
  description: string | null;
  category: string | null;
  estimated_sessions: number | null;
  estimated_duration_days: number | null;
  default_interval_days: number | null;
  instructions: string | null;
  contraindications: string | null;
  expected_results: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  clinic_id: string | null;
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
        .eq('protocol_id', id);

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
              key={protocol.protocol_id}
              className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {protocol.protocol_name}
                    </h3>
                    {protocol.category && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        {protocol.category}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      protocol.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {protocol.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  {protocol.description && (
                    <p className="text-gray-600 mb-3">{protocol.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {protocol.estimated_sessions && (
                      <span>
                        <strong>Sessões:</strong> {protocol.estimated_sessions}
                      </span>
                    )}
                    {protocol.estimated_duration_days && (
                      <span>
                        <strong>Duração:</strong> {protocol.estimated_duration_days} dias
                      </span>
                    )}
                    {protocol.default_interval_days && (
                      <span>
                        <strong>Intervalo:</strong> {protocol.default_interval_days} dias
                      </span>
                    )}
                  </div>

                  {protocol.expected_results && (
                    <div className="mt-3">
                      <strong className="text-sm text-gray-700">Resultados Esperados:</strong>
                      <p className="text-sm text-gray-600 mt-1">{protocol.expected_results}</p>
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
                    onClick={() => deleteProtocol(protocol.protocol_id)}
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
    protocol_name: editData?.protocol_name || '',
    description: editData?.description || '',
    category: editData?.category || 'fonoaudiologia',
    estimated_sessions: editData?.estimated_sessions || 12,
    estimated_duration_days: editData?.estimated_duration_days || 90,
    default_interval_days: editData?.default_interval_days || 7,
    instructions: editData?.instructions || '',
    contraindications: editData?.contraindications || '',
    expected_results: editData?.expected_results || '',
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
        protocol_name: formData.protocol_name.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        estimated_sessions: parseInt(formData.estimated_sessions.toString()) || null,
        estimated_duration_days: parseInt(formData.estimated_duration_days.toString()) || null,
        default_interval_days: parseInt(formData.default_interval_days.toString()) || null,
        instructions: formData.instructions.trim() || null,
        contraindications: formData.contraindications.trim() || null,
        expected_results: formData.expected_results.trim() || null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      };

      if (editData) {
        const { error } = await supabase
          .from('vl_clinic_treatment_protocols')
          .update(protocolData)
          .eq('protocol_id', editData.protocol_id);

        if (error) throw error;
        toast.success('Protocolo atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('vl_clinic_treatment_protocols')
          .insert({
            ...protocolData,
            created_at: new Date().toISOString(),
          });

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
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
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
          {/* Nome do Protocolo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Protocolo *
            </label>
            <Input
              required
              value={formData.protocol_name}
              onChange={(e) => setFormData({ ...formData, protocol_name: e.target.value })}
              placeholder="Ex: Protocolo de Apraxia de Fala Infantil"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <Textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o protocolo de tratamento..."
            />
          </div>

          {/* Categoria e Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria / Especialidade
              </label>
              <select
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="fonoaudiologia">Fonoaudiologia</option>
                <option value="psicologia">Psicologia</option>
                <option value="fisioterapia">Fisioterapia</option>
                <option value="terapia_ocupacional">Terapia Ocupacional</option>
                <option value="nutricao">Nutrição</option>
                <option value="outros">Outros</option>
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

          {/* Estimativas */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sessões Estimadas
              </label>
              <Input
                type="number"
                min="1"
                value={formData.estimated_sessions}
                onChange={(e) => setFormData({ ...formData, estimated_sessions: parseInt(e.target.value) || 0 })}
                placeholder="12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duração (dias)
              </label>
              <Input
                type="number"
                min="1"
                value={formData.estimated_duration_days}
                onChange={(e) => setFormData({ ...formData, estimated_duration_days: parseInt(e.target.value) || 0 })}
                placeholder="90"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intervalo (dias)
              </label>
              <Input
                type="number"
                min="1"
                value={formData.default_interval_days}
                onChange={(e) => setFormData({ ...formData, default_interval_days: parseInt(e.target.value) || 0 })}
                placeholder="7"
              />
            </div>
          </div>

          {/* Instruções */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instruções de Aplicação
            </label>
            <Textarea
              rows={4}
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Descreva como aplicar este protocolo, passo a passo..."
            />
          </div>

          {/* Contraindicações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraindicações
            </label>
            <Textarea
              rows={3}
              value={formData.contraindications}
              onChange={(e) => setFormData({ ...formData, contraindications: e.target.value })}
              placeholder="Liste as contraindicações deste protocolo..."
            />
          </div>

          {/* Resultados Esperados */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resultados Esperados
            </label>
            <Textarea
              rows={4}
              value={formData.expected_results}
              onChange={(e) => setFormData({ ...formData, expected_results: e.target.value })}
              placeholder="Descreva os resultados esperados com este tratamento..."
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
