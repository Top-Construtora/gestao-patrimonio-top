// src/services/inventoryService.ts
import { Equipment, HistoryEntry, Attachment } from '../types';
import { supabase } from '../lib/supabase';

// Função para converter dados do banco para o formato da aplicação
const convertEquipmentFromDB = (dbEquipment: any): Equipment => ({
  id: dbEquipment.id,
  assetNumber: dbEquipment.asset_number,
  description: dbEquipment.description,
  brand: dbEquipment.brand,
  model: dbEquipment.model,
  specs: dbEquipment.specs,
  status: dbEquipment.status,
  location: dbEquipment.location,
  responsible: dbEquipment.responsible,
  acquisitionDate: dbEquipment.acquisition_date,
  value: dbEquipment.value,
  maintenanceDescription: dbEquipment.maintenance_description
});

// Função para converter dados da aplicação para o formato do banco
const convertEquipmentToDB = (equipment: Omit<Equipment, 'id'>) => ({
  asset_number: equipment.assetNumber,
  description: equipment.description,
  brand: equipment.brand,
  model: equipment.model,
  specs: equipment.specs,
  status: equipment.status,
  location: equipment.location,
  responsible: equipment.responsible,
  acquisition_date: equipment.acquisitionDate,
  value: equipment.value,
  maintenance_description: equipment.maintenanceDescription
});

// Função para converter histórico do banco para a aplicação
const convertHistoryFromDB = (dbHistory: any): HistoryEntry => ({
  id: dbHistory.id,
  equipmentId: dbHistory.equipment_id,
  timestamp: dbHistory.timestamp,
  user: dbHistory.user,
  changeType: dbHistory.change_type,
  field: dbHistory.field,
  oldValue: dbHistory.old_value,
  newValue: dbHistory.new_value
});

// Função para converter anexos do banco para a aplicação
const convertAttachmentFromDB = (dbAttachment: any): Attachment => ({
  id: dbAttachment.id,
  equipmentId: dbAttachment.equipment_id,
  name: dbAttachment.name,
  size: dbAttachment.size,
  type: dbAttachment.type,
  url: dbAttachment.url,
  uploadedBy: dbAttachment.uploaded_by,
  uploadedAt: dbAttachment.uploaded_at
});

// Função para adicionar entrada no histórico
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
    console.error('Error adding history entry:', error);
    throw error;
  }
};

const inventoryService = {
  // Obter todos os equipamentos
  getAllEquipment: async (): Promise<Equipment[]> => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(convertEquipmentFromDB) || [];
    } catch (error) {
      console.error('Error fetching equipment:', error);
      throw error;
    }
  },

  // Obter equipamento por ID
  getEquipmentById: async (id: string): Promise<Equipment | null> => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data ? convertEquipmentFromDB(data) : null;
    } catch (error) {
      console.error('Error fetching equipment by ID:', error);
      throw error;
    }
  },

  // Criar novo equipamento
  createEquipment: async (
    equipmentData: Omit<Equipment, 'id'>, 
    user: string, 
    attachmentFiles?: File[]
  ): Promise<Equipment> => {
    try {
      // Inserir equipamento
      const { data, error } = await supabase
        .from('equipment')
        .insert(convertEquipmentToDB(equipmentData))
        .select()
        .single();

      if (error) throw error;

      const newEquipment = convertEquipmentFromDB(data);

      // Adicionar entrada no histórico
      await addHistoryEntry({
        equipmentId: newEquipment.id,
        user,
        changeType: 'criou'
      });

      // Upload de anexos se fornecidos
      if (attachmentFiles && attachmentFiles.length > 0) {
        await Promise.all(
          attachmentFiles.map(file => 
            inventoryService.uploadAttachment(newEquipment.id, file, user)
          )
        );
      }

      return newEquipment;
    } catch (error) {
      console.error('Error creating equipment:', error);
      throw error;
    }
  },

  // Atualizar equipamento
  updateEquipment: async (
    id: string, 
    updates: Partial<Equipment>, 
    user: string
  ): Promise<Equipment> => {
    try {
      // Buscar dados atuais para comparação
      const currentEquipment = await inventoryService.getEquipmentById(id);
      if (!currentEquipment) {
        throw new Error('Equipamento não encontrado');
      }

      // Preparar dados para atualização
      const updateData: any = {};
      let maintenanceNote: string | undefined;

      Object.entries(updates).forEach(([key, value]) => {
        if (key === 'id') return;
        if (key === 'maintenanceNote') {
          maintenanceNote = value as string;
          return;
        }
        
        // Converter nomes de campos
        const dbFieldName = key === 'assetNumber' ? 'asset_number' :
                           key === 'acquisitionDate' ? 'acquisition_date' :
                           key === 'maintenanceDescription' ? 'maintenance_description' :
                           key.replace(/([A-Z])/g, '_$1').toLowerCase();
        
        updateData[dbFieldName] = value;
      });

      // Atualizar no banco
      const { data, error } = await supabase
        .from('equipment')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedEquipment = convertEquipmentFromDB(data);

      // Criar entradas de histórico para cada campo alterado
      for (const [key, newValue] of Object.entries(updates)) {
        if (key === 'id' || key === 'maintenanceNote') continue;
        
        const oldValue = currentEquipment[key as keyof Equipment];
        
        if (oldValue !== newValue) {
          await addHistoryEntry({
            equipmentId: id,
            user,
            changeType: 'editou',
            field: key,
            oldValue: String(oldValue),
            newValue: String(newValue)
          });

          // Se mudou para manutenção e há nota, adicionar entrada específica
          if (key === 'status' && newValue === 'manutenção' && maintenanceNote) {
            await addHistoryEntry({
              equipmentId: id,
              user,
              changeType: 'manutenção',
              field: 'Observações de Manutenção',
              newValue: maintenanceNote
            });
          }
        }
      }

      return updatedEquipment;
    } catch (error) {
      console.error('Error updating equipment:', error);
      throw error;
    }
  },

  // Excluir equipamento
  deleteEquipment: async (id: string, user: string): Promise<void> => {
    try {
      // Buscar equipamento para obter asset_number
      const equipment = await inventoryService.getEquipmentById(id);
      if (!equipment) {
        throw new Error('Equipamento não encontrado');
      }

      // Adicionar entrada no histórico antes de excluir
      await addHistoryEntry({
        equipmentId: id,
        user,
        changeType: 'excluiu',
        oldValue: equipment.assetNumber
      });

      // Excluir equipamento (cascata vai excluir histórico e anexos)
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting equipment:', error);
      throw error;
    }
  },

  // Obter atividades recentes
  getRecentActivities: async (limit: number = 10): Promise<HistoryEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('history_entries')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(convertHistoryFromDB) || [];
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  },

  // Obter histórico de um equipamento
  getEquipmentHistory: async (equipmentId: string): Promise<HistoryEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('history_entries')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return data?.map(convertHistoryFromDB) || [];
    } catch (error) {
      console.error('Error fetching equipment history:', error);
      throw error;
    }
  },

  // Obter anexos de um equipamento
  getEquipmentAttachments: async (equipmentId: string): Promise<Attachment[]> => {
    try {
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      return data?.map(convertAttachmentFromDB) || [];
    } catch (error) {
      console.error('Error fetching attachments:', error);
      throw error;
    }
  },

  // Upload de anexo
  uploadAttachment: async (
    equipmentId: string, 
    file: File, 
    user: string
  ): Promise<Attachment> => {
    try {
      // Upload do arquivo para o Storage do Supabase
      const fileExt = file.name.split('.').pop();
      const fileName = `${equipmentId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('equipment-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obter URL pública do arquivo
      const { data: publicUrlData } = supabase.storage
        .from('equipment-attachments')
        .getPublicUrl(fileName);

      // Salvar informações do anexo no banco
      const { data, error } = await supabase
        .from('attachments')
        .insert({
          equipment_id: equipmentId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: publicUrlData.publicUrl,
          uploaded_by: user
        })
        .select()
        .single();

      if (error) throw error;

      const attachment = convertAttachmentFromDB(data);

      // Adicionar entrada no histórico
      await addHistoryEntry({
        equipmentId,
        user,
        changeType: 'anexou arquivo',
        newValue: file.name
      });

      return attachment;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  },

  // Excluir anexo
  deleteAttachment: async (attachmentId: string, user: string): Promise<void> => {
    try {
      // Buscar anexo para obter informações
      const { data: attachment, error: fetchError } = await supabase
        .from('attachments')
        .select('*')
        .eq('id', attachmentId)
        .single();

      if (fetchError) throw fetchError;

      // Extrair nome do arquivo da URL para excluir do storage
      const urlParts = attachment.url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${attachment.equipment_id}/${fileName}`;

      // Excluir arquivo do storage
      const { error: storageError } = await supabase.storage
        .from('equipment-attachments')
        .remove([filePath]);

      if (storageError) {
        console.warn('Warning: Could not delete file from storage:', storageError);
      }

      // Excluir registro do banco
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;

      // Adicionar entrada no histórico
      await addHistoryEntry({
        equipmentId: attachment.equipment_id,
        user,
        changeType: 'removeu arquivo',
        oldValue: attachment.name
      });
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw error;
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
      console.error('Error downloading attachment:', error);
      throw error;
    }
  },

  // Popular com dados de exemplo (apenas se não houver dados)
  populateSampleData: async (user: string): Promise<void> => {
    try {
      // Verificar se já existem equipamentos
      const { count } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true });

      if (count && count > 0) {
        console.log('Database already has data, skipping sample data insertion');
        return;
      }

      console.log('No data found, inserting sample data...');
      
      // Os dados de exemplo já estão no SQL, então apenas confirmamos
      // que foram inseridos corretamente
      const { data } = await supabase
        .from('equipment')
        .select('*')
        .limit(1);

      if (!data || data.length === 0) {
        throw new Error('Sample data was not inserted correctly');
      }

      console.log('Sample data confirmed in database');
    } catch (error) {
      console.error('Error with sample data:', error);
      throw error;
    }
  }
};

export default inventoryService;