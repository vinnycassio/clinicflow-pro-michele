import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface ProtocolFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editData?: any;
}

export function ProtocolFormModal({ onClose, onSuccess, editData }: ProtocolFormProps) {
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
      const { data: userData } = await supabase
        .from('vl_clinic_core_users')
        .select('clinic_id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!userData?.clinic_id) {
        throw new Error('Clínica não identificada');
      }

      const protocolData = {
        clinic_id: userData.clinic_id,
        name: formData.name,
        description: formData.description,
        specialty: formData.specialty,
        sessions_count: parseInt(formData.sessions_count.toString()),
        session_duration_minutes: parseInt(formData.session_duration_minutes.toString()),
        goals: formData.goals.split('\n').filter(g => g.trim()),
        materials: formData.materials.split('\n').filter(m => m.trim()),
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
      onClose();
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
            className="text-gray-400 hover:text-gray-600"
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
                className="w-full px-3 py-2 border rounded-md"
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
                className="w-full px-3 py-2 border rounded-md"
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
                onChange={(e) => setFormData({ ...formData, sessions_count: parseInt(e.target.value) })}
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
                onChange={(e) => setFormData({ ...formData, session_duration_minutes: parseInt(e.target.value) })}
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
