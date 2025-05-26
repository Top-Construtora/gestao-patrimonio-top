// src/services/inventoryService.ts
import { Equipment, HistoryEntry, Attachment } from '../types';
import { supabase } from '../lib/supabase';

// Funções de mapeamento entre tipos TypeScript e banco de dados
const mapDbToEquipment = (dbRow: any): Equipment => ({
  id: dbRow.id,
  assetNumber: dbRow.asset_number,
  description: dbRow.description,
  brand: dbRow.brand,
  model: dbRow.model,
  specs: dbRow.specs,
  status: dbRow.status,
  location: dbRow.location,
  responsible: dbRow.responsible,
  acquisitionDate: dbRow.acquisition_date,
  value: dbRow.value
});

const mapEquipmentToDb = (equipment: Omit<Equipment, 'id'>) => ({
  asset_number: equipment.assetNumber,
  description: equipment.description,
  brand: equipment.brand,
  model: equipment.model,
  specs: equipment.specs,
  status: equipment.status,
  location: equipment.location,
  responsible: equipment.responsible,
  acquisition_date: equipment.acquisitionDate,
  value: equipment.value
});

const mapDbToHistory = (dbRow: any): HistoryEntry => ({
  id: dbRow.id,
  equipmentId: dbRow.equipment_id,
  timestamp: dbRow.timestamp,
  user: dbRow.user,
  changeType: dbRow.change_type,
  field: dbRow.field,
  oldValue: dbRow.old_value,
  newValue: dbRow.new_value
});

const mapDbToAttachment = (dbRow: any): Attachment => ({
  id: dbRow.id,
  equipmentId: dbRow.equipment_id,
  name: dbRow.name,
  size: dbRow.size,
  type: dbRow.type,
  url: dbRow.url,
  uploadedBy: dbRow.uploaded_by,
  uploadedAt: dbRow.uploaded_at
});

// Função para adicionar entrada de histórico
const addHistoryEntry = async (entry: Omit<HistoryEntry, 'id' | 'timestamp'>): Promise<void> => {
  const { error } = await supabase
    .from('history_entries')
    .insert({
      equipment_id: entry.equipmentId,
      user: entry.user,
      change_type: entry.changeType,
      field: entry.field,
      old_value: entry.oldValue,
      new_value: entry.newValue
    });

  if (error) {
    console.error('Erro ao adicionar entrada de histórico:', error);
    throw new Error('Erro ao registrar histórico');
  }
};

const inventoryService = {
  // Buscar todos os equipamentos
  getAllEquipment: async (): Promise<Equipment[]> => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(mapDbToEquipment) || [];
    } catch (error) {
      console.error('Erro ao buscar equipamentos:', error);
      throw new Error('Erro ao carregar equipamentos');
    }
  },

  // Buscar equipamento por ID
  getEquipmentById: async (id: string): Promise<Equipment | null> => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Não encontrado
        throw error;
      }

      return data ? mapDbToEquipment(data) : null;
    } catch (error) {
      console.error('Erro ao buscar equipamento:', error);
      throw new Error('Erro ao carregar equipamento');
    }
  },

  // Criar novo equipamento
  createEquipment: async (data: Omit<Equipment, 'id'>, user: string): Promise<Equipment> => {
    try {
      // Verificar se o número do patrimônio já existe
      const { data: existing } = await supabase
        .from('equipment')
        .select('id')
        .eq('asset_number', data.assetNumber)
        .single();

      if (existing) {
        throw new Error('Número de patrimônio já existe');
      }

      const { data: newEquipment, error } = await supabase
        .from('equipment')
        .insert(mapEquipmentToDb(data))
        .select()
        .single();

      if (error) throw error;

      const equipment = mapDbToEquipment(newEquipment);

      // Adicionar entrada de histórico
      await addHistoryEntry({
        equipmentId: equipment.id,
        user,
        changeType: 'criou'
      });

      return equipment;
    } catch (error) {
      console.error('Erro ao criar equipamento:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao criar equipamento');
    }
  },

  // Atualizar equipamento
  updateEquipment: async (id: string, data: Partial<Equipment>, user: string): Promise<Equipment> => {
    try {
      // Buscar equipamento atual para comparação
      const currentEquipment = await inventoryService.getEquipmentById(id);
      if (!currentEquipment) {
        throw new Error('Equipamento não encontrado');
      }

      // Preparar dados para atualização
      const updateData: any = {};
      if (data.assetNumber !== undefined) updateData.asset_number = data.assetNumber;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.brand !== undefined) updateData.brand = data.brand;
      if (data.model !== undefined) updateData.model = data.model;
      if (data.specs !== undefined) updateData.specs = data.specs;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.responsible !== undefined) updateData.responsible = data.responsible;
      if (data.acquisitionDate !== undefined) updateData.acquisition_date = data.acquisitionDate;
      if (data.value !== undefined) updateData.value = data.value;

      const { data: updatedEquipment, error } = await supabase
        .from('equipment')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const equipment = mapDbToEquipment(updatedEquipment);

      // Criar entradas de histórico para campos alterados
      const fieldMap: Record<string, string> = {
        assetNumber: 'asset_number',
        description: 'description',
        brand: 'brand',
        model: 'model',
        specs: 'specs',
        status: 'status',
        location: 'location',
        responsible: 'responsible',
        acquisitionDate: 'acquisition_date',
        value: 'value'
      };

      for (const [key, value] of Object.entries(data)) {
        if (key === 'id') continue;
        
        const oldValue = currentEquipment[key as keyof Equipment];
        if (oldValue !== value) {
          await addHistoryEntry({
            equipmentId: id,
            user,
            changeType: 'editou',
            field: key,
            oldValue: String(oldValue),
            newValue: String(value)
          });
        }
      }

      return equipment;
    } catch (error) {
      console.error('Erro ao atualizar equipamento:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao atualizar equipamento');
    }
  },

  // Excluir equipamento
  deleteEquipment: async (id: string, user: string): Promise<void> => {
    try {
      const equipment = await inventoryService.getEquipmentById(id);
      if (!equipment) {
        throw new Error('Equipamento não encontrado');
      }

      // Adicionar entrada de histórico antes de excluir
      await addHistoryEntry({
        equipmentId: id,
        user,
        changeType: 'excluiu',
        oldValue: equipment.assetNumber
      });

      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao excluir equipamento:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao excluir equipamento');
    }
  },

  // Buscar atividades recentes
  getRecentActivities: async (limit: number = 10): Promise<HistoryEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('history_entries')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(mapDbToHistory) || [];
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      throw new Error('Erro ao carregar atividades');
    }
  },

  // Buscar histórico de um equipamento
  getEquipmentHistory: async (equipmentId: string): Promise<HistoryEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('history_entries')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return data?.map(mapDbToHistory) || [];
    } catch (error) {
      console.error('Erro ao buscar histórico do equipamento:', error);
      throw new Error('Erro ao carregar histórico');
    }
  },

  // Buscar anexos de um equipamento
  getEquipmentAttachments: async (equipmentId: string): Promise<Attachment[]> => {
    try {
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      return data?.map(mapDbToAttachment) || [];
    } catch (error) {
      console.error('Erro ao buscar anexos:', error);
      throw new Error('Erro ao carregar anexos');
    }
  },

  // Fazer upload de anexo
  uploadAttachment: async (equipmentId: string, file: File, user: string): Promise<Attachment> => {
    try {
      // Upload do arquivo para o Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${equipmentId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(fileName);

      // Salvar informações do anexo no banco
      const { data: attachment, error } = await supabase
        .from('attachments')
        .insert({
          equipment_id: equipmentId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: urlData.publicUrl,
          uploaded_by: user
        })
        .select()
        .single();

      if (error) throw error;

      // Adicionar entrada de histórico
      await addHistoryEntry({
        equipmentId,
        user,
        changeType: 'anexou arquivo',
        newValue: file.name
      });

      return mapDbToAttachment(attachment);
    } catch (error) {
      console.error('Erro ao fazer upload do anexo:', error);
      throw new Error('Erro ao fazer upload do arquivo');
    }
  },

  // Excluir anexo
  deleteAttachment: async (attachmentId: string, user: string): Promise<void> => {
    try {
      // Buscar informações do anexo
      const { data: attachment, error: fetchError } = await supabase
        .from('attachments')
        .select('*')
        .eq('id', attachmentId)
        .single();

      if (fetchError) throw fetchError;
      if (!attachment) throw new Error('Anexo não encontrado');

      // Excluir arquivo do storage
      const fileName = attachment.url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('attachments')
          .remove([`${attachment.equipment_id}/${fileName}`]);
      }

      // Excluir registro do banco
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;

      // Adicionar entrada de histórico
      await addHistoryEntry({
        equipmentId: attachment.equipment_id,
        user,
        changeType: 'removeu arquivo',
        oldValue: attachment.name
      });
    } catch (error) {
      console.error('Erro ao excluir anexo:', error);
      throw new Error('Erro ao excluir anexo');
    }
  },

  // Download de anexo
  downloadAttachment: async (attachment: Attachment): Promise<void> => {
    try {
      // Criar link de download
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      throw new Error('Erro ao fazer download do arquivo');
    }
  },

  // Popular com dados de exemplo (só se não houver dados)
  populateSampleData: async (user: string): Promise<void> => {
    try {
      // Verificar se já existem dados
      const { data: existingData } = await supabase
        .from('equipment')
        .select('id')
        .limit(1);

      if (existingData && existingData.length > 0) {
        return; // Já tem dados, não precisa popular
      }

      // Os dados de exemplo já estão no script SQL
      console.log('Dados de exemplo já foram inseridos via SQL');
    } catch (error) {
      console.error('Erro ao verificar dados de exemplo:', error);
    }
  }
};

export default inventoryService;