import { supabase, STORAGE_BUCKET } from '../lib/supabase';
import { Equipment, HistoryEntry, Attachment, DatabaseEquipment, DatabaseHistoryEntry, DatabaseAttachment } from '../types';

// Converter dados do banco para interface da aplicação
const transformEquipment = (dbEquipment: DatabaseEquipment): Equipment => ({
  id: dbEquipment.id,
  assetNumber: dbEquipment.asset_number,
  description: dbEquipment.description,
  brand: dbEquipment.brand,
  model: dbEquipment.model,
  specs: dbEquipment.specs || undefined,
  status: dbEquipment.status,
  location: dbEquipment.location,
  responsible: dbEquipment.responsible,
  acquisitionDate: dbEquipment.acquisition_date,
  invoiceDate: dbEquipment.invoice_date || undefined,
  value: dbEquipment.value,
  maintenanceDescription: dbEquipment.maintenance_description || undefined,
  observacoesManutenção: dbEquipment.maintenance_description || undefined,
  createdAt: dbEquipment.created_at || undefined,
  updatedAt: dbEquipment.updated_at || undefined
});

const transformHistoryEntry = (dbHistory: DatabaseHistoryEntry): HistoryEntry => ({
  id: dbHistory.id,
  equipmentId: dbHistory.equipment_id,
  timestamp: dbHistory.timestamp,
  user: dbHistory.user_name,
  changeType: dbHistory.change_type,
  field: dbHistory.field || undefined,
  oldValue: dbHistory.old_value || undefined,
  newValue: dbHistory.new_value || undefined
});

const transformAttachment = (dbAttachment: DatabaseAttachment): Attachment => ({
  id: dbAttachment.id,
  equipmentId: dbAttachment.equipment_id,
  name: dbAttachment.name,
  size: dbAttachment.size,
  type: dbAttachment.type,
  url: `${supabase.storage.from(STORAGE_BUCKET).getPublicUrl(dbAttachment.file_path).data.publicUrl}`,
  uploadedBy: dbAttachment.uploaded_by,
  uploadedAt: dbAttachment.uploaded_at
});

// Converter dados da aplicação para o banco
const transformToDatabase = (equipment: Omit<Equipment, 'id'>): Omit<DatabaseEquipment, 'id' | 'created_at' | 'updated_at'> => ({
  asset_number: equipment.assetNumber,
  description: equipment.description,
  brand: equipment.brand,
  model: equipment.model,
  specs: equipment.specs || null,
  status: equipment.status,
  location: equipment.location,
  responsible: equipment.responsible,
  acquisition_date: equipment.acquisitionDate,
  invoice_date: equipment.invoiceDate || null,
  value: equipment.value,
  maintenance_description: equipment.maintenanceDescription || equipment.observacoesManutenção || null
});

// ================================
// SERVIÇO PRINCIPAL
// ================================

const inventoryService = {
  // Verificar conexão
  checkConnection: async (): Promise<boolean> => {
    try {
      const { error } = await supabase.from('equipments').select('count').limit(1);
      
      if (error) {
        console.error('❌ Erro na verificação de conexão:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro crítico de conexão:', error);
      return false;
    }
  },

  // Obter próximo número de patrimônio
  getNextAssetNumber: async (): Promise<string> => {
    try {      
      // Buscar TODOS os equipamentos para análise completa
      const { data: allEquipment, error } = await supabase
        .from('equipments')
        .select('asset_number')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar equipamentos:', error);
        throw new Error(`Erro ao gerar número de patrimônio: ${error.message}`);
      }

      // Filtrar apenas os que seguem o padrão TOP-XXXX ou TOP - XXXX
      const topNumbers: number[] = [];
      
      if (allEquipment && allEquipment.length > 0) {
        allEquipment.forEach(item => {
          // Regex flexível para capturar TOP-XXXX ou TOP - XXXX (com ou sem espaços)
          const match = item.asset_number.match(/^TOP\s*[-–]\s*(\d+)$/i);
          if (match) {
            const num = parseInt(match[1], 10);
            topNumbers.push(num);
          }
        });
      }

      let nextNumber: number;
      
      if (topNumbers.length === 0) {
        // Se não há nenhum equipamento TOP, começar do 1
        nextNumber = 1;
      } else {
        // Encontrar o maior número atual
        const maxNumber = Math.max(...topNumbers);
        nextNumber = maxNumber + 1;
      }

      // Formatar com 4 dígitos (sem espaços)
      const nextAssetNumber = `TOP-${nextNumber.toString().padStart(4, '0')}`;
      
      return nextAssetNumber;
    } catch (error) {
      throw error;
    }
  },

  // Função auxiliar para validar número de patrimônio
  validateAssetNumber: async (assetNumber: string, excludeId?: string): Promise<{ valid: boolean; message?: string }> => {
    try {
      // Verificar formato (aceitar TOP-XXXX ou TOP - XXXX durante transição)
      if (!assetNumber.match(/^TOP\s*[-–]\s*\d{4}$/i)) {
        return { 
          valid: false, 
          message: 'Formato inválido. Use TOP-0000' 
        };
      }

      // Normalizar o número para busca
      const normalizedNumber = assetNumber.replace(/\s+/g, '').toUpperCase();
      
      // Verificar se já existe (buscar ambos os formatos)
      let query = supabase
        .from('equipments')
        .select('id, asset_number')
        .or(`asset_number.eq.${assetNumber},asset_number.eq.${normalizedNumber}`);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao validar número:', error);
        return { 
          valid: false, 
          message: 'Erro ao verificar número' 
        };
      }

      if (data && data.length > 0) {
        return { 
          valid: false, 
          message: 'Este número de patrimônio já está em uso' 
        };
      }

      return { valid: true };
    } catch (error) {
      console.error('Erro na validação:', error);
      return { 
        valid: false, 
        message: 'Erro ao validar número de patrimônio' 
      };
    }
  },

  getAllEquipment: async (): Promise<Equipment[]> => {
    try {
      const { data, error } = await supabase
        .from('equipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar equipamentos:', error);
        throw new Error(`Erro ao carregar equipamentos: ${error.message}`);
      }

      // Se data for null, retorna array vazio
      const equipment = data ? data.map(transformEquipment) : [];
      
      if (equipment.length === 0) {
        console.log('ℹ️ Nenhum equipamento encontrado');
      }
      
      return equipment;
    } catch (error) {
      console.error('❌ Erro no getAllEquipment:', error);
      throw error;
    }
  },

  // Obter equipamento por ID
  getEquipmentById: async (id: string): Promise<Equipment | null> => {
    try {      
      const { data, error } = await supabase
        .from('equipments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('❌ Erro ao buscar equipamento:', error);
        throw new Error(`Erro ao buscar equipamento: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      const equipment = transformEquipment(data);
      return equipment;
    } catch (error) {
      console.error('❌ Erro no getEquipmentById:', error);
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
      // Converter dados para formato do banco
      const dbData = transformToDatabase(equipmentData);
      
      // Inserir equipamento
      const { data, error } = await supabase
        .from('equipments')
        .insert(dbData)
        .select()
        .single();

      if (error || !data) {
        console.error('❌ Erro ao criar equipamento:', error);
        throw new Error(`Erro ao criar equipamento: ${error?.message}`);
      }

      // Registrar criação no histórico
      await supabase
        .from('history_entries')
        .insert({
          equipment_id: data.id,
          timestamp: new Date().toISOString(),
          user_name: user,
          change_type: 'criou'
        });

      // Upload de anexos, se houver
      if (attachmentFiles && attachmentFiles.length > 0) {
        for (const file of attachmentFiles) {
          try {
            await inventoryService.uploadAttachment(data.id, file, user);
          } catch (err) {
            console.error('Erro ao fazer upload de anexo:', err);
          }
        }
      }

      return transformEquipment(data);
    } catch (error) {
      console.error('❌ Erro no createEquipment:', error);
      throw error;
    }
  },

  // Atualizar equipamento
  updateEquipment: async (
    id: string, 
    updates: Partial<Omit<Equipment, 'id'>>, 
    user: string,
    observations?: string
  ): Promise<Equipment> => {
    try {
      // Buscar dados atuais para comparação
      const { data: currentData, error: fetchError } = await supabase
        .from('equipments')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !currentData) {
        throw new Error('Equipamento não encontrado');
      }

      // Preparar dados para atualização
      const updateData: any = {};
      const historyEntries: any[] = [];

      // Mapear campos e registrar mudanças
      const fieldMap: Record<string, { dbField: string; label: string }> = {
        assetNumber: { dbField: 'asset_number', label: 'número do patrimônio' },
        description: { dbField: 'description', label: 'descrição' },
        brand: { dbField: 'brand', label: 'marca' },
        model: { dbField: 'model', label: 'modelo' },
        specs: { dbField: 'specs', label: 'especificações' },
        status: { dbField: 'status', label: 'status' },
        location: { dbField: 'location', label: 'localização' },
        responsible: { dbField: 'responsible', label: 'responsável' },
        acquisitionDate: { dbField: 'acquisition_date', label: 'data de aquisição' },
        invoiceDate: { dbField: 'invoice_date', label: 'data da nota fiscal' },
        value: { dbField: 'value', label: 'valor' },
        maintenanceDescription: { dbField: 'maintenance_description', label: 'observações de manutenção' }
      };

      // Verificar mudanças e preparar histórico
      Object.entries(updates).forEach(([key, newValue]) => {
        const field = fieldMap[key];
        if (field && newValue !== undefined) {
          const oldValue = currentData[field.dbField];
          
          // Só registrar se houver mudança real
          if (oldValue !== newValue) {
            updateData[field.dbField] = newValue;
            
            // Criar entrada no histórico
            const changeType = key === 'status' ? 'alterou status' : 'editou';
            
            historyEntries.push({
              equipment_id: id,
              timestamp: new Date().toISOString(),
              user_name: user,
              change_type: changeType,
              field: field.label,
              old_value: String(oldValue || ''),
              new_value: String(newValue || '')
            });
          }
        }
      });

      // Se não houver mudanças, retornar dados atuais
      if (Object.keys(updateData).length === 0) {
        return transformEquipment(currentData);
      }

      // Adicionar timestamp de atualização
      updateData.updated_at = new Date().toISOString();

      // Executar atualização
      const { data: updatedData, error: updateError } = await supabase
        .from('equipments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError || !updatedData) {
        throw new Error(`Erro ao atualizar: ${updateError?.message}`);
      }

      // Inserir entradas no histórico
      if (historyEntries.length > 0) {
        const { error: historyError } = await supabase
          .from('history_entries')
          .insert(historyEntries);

        if (historyError) {
          console.error('Erro ao criar histórico:', historyError);
        }
      }

      // Se houver observações adicionais, criar entrada separada
      if (observations && observations.trim()) {
        await supabase
          .from('history_entries')
          .insert({
            equipment_id: id,
            timestamp: new Date().toISOString(),
            user_name: user,
            change_type: 'editou',
            field: 'observações',
            new_value: observations
          });
      }

      return transformEquipment(updatedData);
    } catch (error) {
      console.error('❌ Erro no updateEquipment:', error);
      throw error;
    }
  },

  // Excluir equipamento
  deleteEquipment: async (id: string, user: string): Promise<void> => {
    try {
      // Buscar dados do equipamento antes de excluir
      const { data: equipment, error: fetchError } = await supabase
        .from('equipments')
        .select('asset_number')
        .eq('id', id)
        .single();

      if (fetchError || !equipment) {
        throw new Error('Equipamento não encontrado');
      }

      // Deletar anexos do storage primeiro
      const { data: attachments } = await supabase
        .from('attachments')
        .select('file_path')
        .eq('equipment_id', id);

      if (attachments && attachments.length > 0) {
        const filePaths = attachments.map(a => a.file_path);
        await supabase.storage.from(STORAGE_BUCKET).remove(filePaths);
      }

      // Deletar registros relacionados (cascata)
      await supabase.from('attachments').delete().eq('equipment_id', id);
      await supabase.from('history_entries').delete().eq('equipment_id', id);

      // Deletar equipamento
      const { error: deleteError } = await supabase
        .from('equipments')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw new Error(`Erro ao excluir: ${deleteError.message}`);
      }

      console.log(`✅ Equipamento ${equipment.asset_number} excluído com sucesso`);
    } catch (error) {
      console.error('❌ Erro no deleteEquipment:', error);
      throw error;
    }
  },

  // ================================
  // OPERAÇÕES DE ANEXOS
  // ================================

  uploadAttachment: async (
    equipmentId: string,
    file: File,
    uploadedBy: string
  ): Promise<Attachment> => {
    try {
      // Validar tamanho (10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 10MB');
      }

      // Gerar nome único
      const fileExt = file.name.split('.').pop();
      const fileName = `${equipmentId}_${Date.now()}.${fileExt}`;
      const filePath = `attachments/${fileName}`;

      // Upload para o storage
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      // Criar registro no banco
      const attachmentData: Omit<DatabaseAttachment, 'id' | 'created_at'> = {
        equipment_id: equipmentId,
        name: file.name,
        size: file.size,
        type: file.type,
        file_path: filePath,
        uploaded_by: uploadedBy,
        uploaded_at: new Date().toISOString()
      };

      const { data, error: dbError } = await supabase
        .from('attachments')
        .insert(attachmentData)
        .select()
        .single();

      if (dbError || !data) {
        // Se falhar, remover arquivo do storage
        await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
        throw new Error(`Erro ao salvar anexo: ${dbError?.message}`);
      }

      // Registrar no histórico
      await supabase
        .from('history_entries')
        .insert({
          equipment_id: equipmentId,
          timestamp: new Date().toISOString(),
          user_name: uploadedBy,
          change_type: 'anexou arquivo',
          field: 'anexo',
          new_value: file.name
        });

      return transformAttachment(data);
    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error);
      throw error;
    }
  },

  deleteAttachment: async (attachmentId: string, deletedBy: string = 'Sistema'): Promise<void> => {
    try {
      // Buscar anexo para obter o caminho e nome
      const { data: attachment, error: fetchError } = await supabase
        .from('attachments')
        .select('*')
        .eq('id', attachmentId)
        .single();

      if (fetchError || !attachment) {
        throw new Error('Anexo não encontrado');
      }

      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([attachment.file_path]);

      if (storageError) {
        console.error('Erro ao deletar arquivo do storage:', storageError);
      }

      // Deletar do banco
      const { error: dbError } = await supabase
        .from('attachments')
        .delete()
        .eq('id', attachmentId);

      if (dbError) {
        throw new Error(`Erro ao deletar anexo: ${dbError.message}`);
      }

      // Registrar no histórico
      await supabase
        .from('history_entries')
        .insert({
          equipment_id: attachment.equipment_id,
          timestamp: new Date().toISOString(),
          user_name: deletedBy,
          change_type: 'removeu arquivo',
          field: 'anexo',
          old_value: attachment.name
        });

    } catch (error) {
      console.error('❌ Erro ao deletar anexo:', error);
      throw error;
    }
  },

  getEquipmentAttachments: async (equipmentId: string): Promise<Attachment[]> => {
    try {
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar anexos: ${error.message}`);
      }

      return data ? data.map(transformAttachment) : [];
    } catch (error) {
      console.error('❌ Erro no getEquipmentAttachments:', error);
      throw error;
    }
  },

  downloadAttachment: async (attachment: Attachment): Promise<void> => {
    try {
      // Criar link temporário e clicar
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('❌ Erro ao baixar anexo:', error);
      throw error;
    }
  },

  // ================================
  // OPERAÇÕES DE HISTÓRICO
  // ================================

  getRecentActivities: async (limit: number = 10): Promise<HistoryEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('history_entries')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Erro ao carregar atividades:', error);
        throw new Error(`Erro ao carregar atividades: ${error.message}`);
      }

      // Se data for null, retorna array vazio
      const activities = data ? data.map(transformHistoryEntry) : [];
      
      return activities;
    } catch (error) {
      console.error('❌ Erro no getRecentActivities:', error);
      throw error;
    }
  },

  getEquipmentHistory: async (equipmentId: string): Promise<HistoryEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('history_entries')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar histórico:', error);
        throw new Error(`Erro ao carregar histórico: ${error.message}`);
      }

      // Se data for null, retorna array vazio
      const history = data ? data.map(transformHistoryEntry) : [];
      
      return history;
    } catch (error) {
      console.error('❌ Erro no getEquipmentHistory:', error);
      throw error;
    }
  },

  // ================================
  // OPERAÇÕES ESPECÍFICAS
  // ================================

  // Registrar entrada em manutenção
  registerMaintenance: async (
    equipmentId: string,
    maintenanceDescription: string,
    user: string
  ): Promise<void> => {
    try {
      // Buscar status atual
      const { data: currentEquipment, error: fetchError } = await supabase
        .from('equipments')
        .select('status')
        .eq('id', equipmentId)
        .single();

      if (fetchError || !currentEquipment) {
        throw new Error('Equipamento não encontrado');
      }

      // Atualizar status para manutenção
      const { error: updateError } = await supabase
        .from('equipments')
        .update({ 
          status: 'manutenção',
          maintenance_description: maintenanceDescription,
          updated_at: new Date().toISOString()
        })
        .eq('id', equipmentId);

      if (updateError) {
        throw new Error(`Erro ao atualizar status: ${updateError.message}`);
      }

      // Registrar no histórico
      await supabase
        .from('history_entries')
        .insert({
          equipment_id: equipmentId,
          timestamp: new Date().toISOString(),
          user_name: user,
          change_type: 'manutenção',
          field: 'status',
          old_value: currentEquipment.status,
          new_value: maintenanceDescription
        });

    } catch (error) {
      console.error('❌ Erro ao registrar manutenção:', error);
      throw error;
    }
  },

  // Registrar transferência de equipamento
  transferEquipment: async (
    equipmentId: string,
    newLocation: string,
    transferDate: string,
    responsiblePerson: string,
    observations?: string
  ): Promise<void> => {
    try {
      // Buscar equipamento atual
      const { data: currentEquipment, error: fetchError } = await supabase
        .from('equipments')
        .select('*')
        .eq('id', equipmentId)
        .single();

      if (fetchError || !currentEquipment) {
        throw new Error('Equipamento não encontrado');
      }

      const oldLocation = currentEquipment.location;

      // Atualizar localização
      const { error: updateError } = await supabase
        .from('equipments')
        .update({ 
          location: newLocation,
          updated_at: new Date().toISOString()
        })
        .eq('id', equipmentId);

      if (updateError) {
        throw new Error(`Erro ao atualizar localização: ${updateError.message}`);
      }

      // Criar entrada no histórico
      const historyEntry = {
        equipment_id: equipmentId,
        timestamp: new Date().toISOString(),
        user_name: responsiblePerson,
        change_type: 'transferiu',
        field: 'location',
        old_value: oldLocation,
        new_value: newLocation
      };

      const { error: historyError } = await supabase
        .from('history_entries')
        .insert(historyEntry);

      if (historyError) {
        console.error('Erro ao criar histórico de transferência:', historyError);
      }

      // Se houver observações, criar entrada adicional
      if (observations && observations.trim()) {
        const observationEntry = {
          equipment_id: equipmentId,
          timestamp: new Date().toISOString(),
          user_name: responsiblePerson,
          change_type: 'editou' as const,
          field: 'observações_transferência',
          new_value: `Transferência em ${new Date(transferDate).toLocaleDateString('pt-BR')}: ${observations}`
        };

        await supabase
          .from('history_entries')
          .insert(observationEntry);
      }

      console.log(`✅ Equipamento ${currentEquipment.asset_number} transferido de "${oldLocation}" para "${newLocation}"`);
    } catch (error) {
      console.error('❌ Erro ao transferir equipamento:', error);
      throw error;
    }
  },

  // ================================
  // RELATÓRIOS E ESTATÍSTICAS
  // ================================

  getEquipmentStats: async () => {
    try {
      const { data: equipment, error } = await supabase
        .from('equipments')
        .select('status');

      if (error) throw error;

      const stats = {
        total: equipment?.length || 0,
        active: 0,
        maintenance: 0,
        inactive: 0
      };

      equipment?.forEach(item => {
        switch (item.status) {
          case 'ativo':
            stats.active++;
            break;
          case 'manutenção':
            stats.maintenance++;
            break;
          case 'desativado':
            stats.inactive++;
            break;
        }
      });

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }
};

export default inventoryService;