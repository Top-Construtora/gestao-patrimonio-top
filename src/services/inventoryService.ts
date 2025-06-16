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
  invoiceDate: dbEquipment.invoice_date || undefined, // NOVO CAMPO
  value: dbEquipment.value,
  maintenanceDescription: dbEquipment.maintenance_description || undefined,
  observacoesManutenção: dbEquipment.maintenance_description || undefined,
  createdAt: dbEquipment.created_at,
  updatedAt: dbEquipment.updated_at
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
  invoice_date: equipment.invoiceDate || null, // NOVO CAMPO
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

  // NOVA FUNÇÃO: Obter próximo número de patrimônio
  getNextAssetNumber: async (): Promise<string> => {
    try {
      console.log('🔢 Buscando próximo número de patrimônio...');
      
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
            console.log(`   Encontrado: ${item.asset_number} -> Número: ${num}`);
          }
        });
      }

      let nextNumber: number;
      
      if (topNumbers.length === 0) {
        // Se não há nenhum equipamento TOP, começar do 1
        nextNumber = 1;
        console.log('📝 Nenhum equipamento TOP encontrado, iniciando em TOP-0001');
      } else {
        // Encontrar o maior número atual
        const maxNumber = Math.max(...topNumbers);
        nextNumber = maxNumber + 1;
        
        console.log(`📊 Análise dos números TOP:`);
        console.log(`   - Total de equipamentos no banco: ${allEquipment?.length || 0}`);
        console.log(`   - Total de equipamentos TOP encontrados: ${topNumbers.length}`);
        console.log(`   - Maior número atual: ${maxNumber}`);
        console.log(`   - Últimos números: ${topNumbers.sort((a, b) => b - a).slice(0, 5).join(', ')}`);
      }

      // Formatar com 4 dígitos (sem espaços)
      const nextAssetNumber = `TOP-${nextNumber.toString().padStart(4, '0')}`;
      
      console.log(`✅ Próximo número disponível: ${nextAssetNumber}`);
      return nextAssetNumber;
    } catch (error) {
      console.error('❌ Erro no getNextAssetNumber:', error);
      throw error;
    }
  },

  // Função para padronizar números de patrimônio existentes
  standardizeAssetNumbers: async (): Promise<{ updated: number; errors: number }> => {
    try {
      console.log('🔧 Iniciando padronização dos números de patrimônio...');
      
      // Buscar todos os equipamentos
      const { data: equipment, error } = await supabase
        .from('equipments')
        .select('id, asset_number');

      if (error) {
        throw new Error(`Erro ao buscar equipamentos: ${error.message}`);
      }

      if (!equipment || equipment.length === 0) {
        console.log('Nenhum equipamento encontrado');
        return { updated: 0, errors: 0 };
      }

      let updated = 0;
      let errors = 0;

      // Processar cada equipamento
      for (const item of equipment) {
        // Verificar se precisa padronização
        const match = item.asset_number.match(/^TOP\s*[-–]\s*(\d+)$/i);
        
        if (match) {
          const number = match[1];
          const standardized = `TOP-${number.padStart(4, '0')}`;
          
          // Se é diferente do formato padrão, atualizar
          if (item.asset_number !== standardized) {
            console.log(`   Atualizando: "${item.asset_number}" → "${standardized}"`);
            
            const { error: updateError } = await supabase
              .from('equipments')
              .update({ asset_number: standardized })
              .eq('id', item.id);

            if (updateError) {
              console.error(`   ❌ Erro ao atualizar ${item.asset_number}:`, updateError);
              errors++;
            } else {
              updated++;
            }
          }
        }
      }

      console.log(`✅ Padronização concluída:`);
      console.log(`   - Equipamentos atualizados: ${updated}`);
      console.log(`   - Erros encontrados: ${errors}`);
      
      return { updated, errors };
    } catch (error) {
      console.error('❌ Erro na padronização:', error);
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
        console.log('📝 Banco de equipamentos está vazio - Sistema pronto para novos cadastros');
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
      console.log(`🔍 Buscando equipamento ${id}...`);
      
      const { data, error } = await supabase
        .from('equipments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('⚠️ Equipamento não encontrado');
          return null;
        }
        console.error('❌ Erro ao buscar equipamento:', error);
        throw new Error(`Erro ao buscar equipamento: ${error.message}`);
      }

      if (!data) {
        console.log('⚠️ Equipamento não encontrado (data null)');
        return null;
      }

      const equipment = transformEquipment(data);
      console.log(`✅ Equipamento encontrado: ${equipment.assetNumber}`);
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
      console.log('➕ Criando equipamento:', equipmentData.assetNumber);
      
      // Inserir equipamento
      const { data, error } = await supabase
        .from('equipments')
        .insert(transformToDatabase(equipmentData))
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar equipamento:', error);
        throw new Error(`Erro ao criar equipamento: ${error.message}`);
      }

      if (!data) {
        throw new Error('Erro: Equipamento não foi criado corretamente');
      }

      const newEquipment = transformEquipment(data);

      // Registrar no histórico
      const { error: historyError } = await supabase.from('history_entries').insert({
        equipment_id: newEquipment.id,
        user_name: user,
        change_type: 'criou'
      });

      if (historyError) {
        console.warn('⚠️ Erro ao registrar histórico:', historyError);
      }

      // Upload de anexos se houver
      if (attachmentFiles && attachmentFiles.length > 0) {
        console.log(`📎 Processando ${attachmentFiles.length} anexo(s)...`);
        for (const file of attachmentFiles) {
          try {
            await inventoryService.uploadAttachment(newEquipment.id, file, user);
          } catch (attachError) {
            console.warn('⚠️ Erro no upload de anexo:', attachError);
          }
        }
      }

      console.log('✅ Equipamento criado com sucesso:', newEquipment.assetNumber);
      return newEquipment;
    } catch (error) {
      console.error('❌ Erro no createEquipment:', error);
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
      console.log('📝 Atualizando equipamento:', id);
      
      // Buscar dados atuais para comparação
      const currentEquipment = await inventoryService.getEquipmentById(id);
      if (!currentEquipment) {
        throw new Error('Equipamento não encontrado');
      }

      // Preparar dados para atualização
      const updateData: any = {};
      
      if (updates.assetNumber !== undefined) updateData.asset_number = updates.assetNumber;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.brand !== undefined) updateData.brand = updates.brand;
      if (updates.model !== undefined) updateData.model = updates.model;
      if (updates.specs !== undefined) updateData.specs = updates.specs || null;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.responsible !== undefined) updateData.responsible = updates.responsible;
      if (updates.acquisitionDate !== undefined) updateData.acquisition_date = updates.acquisitionDate;
      if (updates.invoiceDate !== undefined) updateData.invoice_date = updates.invoiceDate || null; // NOVO CAMPO
      if (updates.value !== undefined) updateData.value = updates.value;
      if (updates.maintenanceDescription !== undefined) updateData.maintenance_description = updates.maintenanceDescription || null;
      if (updates.observacoesManutenção !== undefined) updateData.maintenance_description = updates.observacoesManutenção || null;

      // Atualizar no banco
      const { data, error } = await supabase
        .from('equipments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar equipamento:', error);
        throw new Error(`Erro ao atualizar equipamento: ${error.message}`);
      }

      if (!data) {
        throw new Error('Erro: Equipamento não foi atualizado corretamente');
      }

      // Registrar mudanças no histórico
      for (const [key, value] of Object.entries(updates)) {
        if (key === 'id') continue;
        
        const currentValue = currentEquipment[key as keyof Equipment];
        if (currentValue !== value) {
          // Entrada especial para manutenção
          if (key === 'status' && value === 'manutenção' && updates.observacoesManutenção) {
            await supabase.from('history_entries').insert({
              equipment_id: id,
              user_name: user,
              change_type: 'manutenção',
              new_value: updates.observacoesManutenção
            });
          } else {
            await supabase.from('history_entries').insert({
              equipment_id: id,
              user_name: user,
              change_type: 'editou',
              field: key,
              old_value: String(currentValue || ''),
              new_value: String(value || '')
            });
          }
        }
      }

      const updatedEquipment = transformEquipment(data);
      console.log('✅ Equipamento atualizado:', updatedEquipment.assetNumber);
      return updatedEquipment;
    } catch (error) {
      console.error('❌ Erro no updateEquipment:', error);
      throw error;
    }
  },

  // Excluir equipamento
  deleteEquipment: async (id: string, user: string): Promise<void> => {
    try {
      console.log('🗑️ Excluindo equipamento:', id);
      
      // Buscar equipamento para obter informações
      const equipment = await inventoryService.getEquipmentById(id);
      if (!equipment) {
        throw new Error('Equipamento não encontrado');
      }

      // Excluir anexos do storage
      const attachments = await inventoryService.getEquipmentAttachments(id);
      if (attachments.length > 0) {
        const filePaths = attachments.map(att => att.url.split('/').pop()!);
        const { error: storageError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove(filePaths);
          
        if (storageError) {
          console.warn('⚠️ Erro ao excluir arquivos do storage:', storageError);
        }
      }

      // Registrar no histórico antes de excluir
      const { error: historyError } = await supabase.from('history_entries').insert({
        equipment_id: id,
        user_name: user,
        change_type: 'excluiu'
      });

      if (historyError) {
        console.warn('⚠️ Erro ao registrar histórico:', historyError);
      }

      // Excluir equipamento (cascata excluirá anexos e histórico)
      const { error } = await supabase
        .from('equipments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao excluir equipamento:', error);
        throw new Error(`Erro ao excluir equipamento: ${error.message}`);
      }

      console.log('✅ Equipamento excluído:', equipment.assetNumber);
    } catch (error) {
      console.error('❌ Erro no deleteEquipment:', error);
      throw error;
    }
  },

  // Obter estatísticas dos números de patrimônio
  getAssetNumberStats: async (): Promise<{
    total: number;
    topCount: number;
    lastNumber: string;
    gaps: number[];
  }> => {
    try {
      const { data, error } = await supabase
        .from('equipments')
        .select('asset_number')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        topCount: 0,
        lastNumber: '',
        gaps: [] as number[]
      };

      if (!data || data.length === 0) return stats;

      const topNumbers: number[] = [];
      
      data.forEach(item => {
        const match = item.asset_number.match(/^TOP-(\d+)$/i);
        if (match) {
          topNumbers.push(parseInt(match[1], 10));
        }
      });

      if (topNumbers.length > 0) {
        stats.topCount = topNumbers.length;
        const sortedNumbers = topNumbers.sort((a, b) => a - b);
        const maxNumber = sortedNumbers[sortedNumbers.length - 1];
        stats.lastNumber = `TOP-${maxNumber.toString().padStart(4, '0')}`;

        // Encontrar gaps na sequência
        for (let i = 1; i <= maxNumber; i++) {
          if (!sortedNumbers.includes(i)) {
            stats.gaps.push(i);
          }
        }
      }

      console.log('📊 Estatísticas dos números de patrimônio:', stats);
      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  },

  // ================================
  // OPERAÇÕES DE RELATÓRIOS
  // ================================

  // Obter atividades recentes
  getRecentActivities: async (limit: number = 10): Promise<HistoryEntry[]> => {
    try {
      console.log(`📊 Carregando ${limit} atividades recentes...`);
      
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
      
      console.log(`✅ ${activities.length} atividade(s) carregada(s)`);
      return activities;
    } catch (error) {
      console.error('❌ Erro no getRecentActivities:', error);
      throw error;
    }
  },

  // Obter histórico de um equipamento
  getEquipmentHistory: async (equipmentId: string): Promise<HistoryEntry[]> => {
    try {
      console.log(`📜 Carregando histórico do equipamento ${equipmentId}...`);
      
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
      
      console.log(`✅ ${history.length} entrada(s) de histórico carregada(s)`);
      return history;
    } catch (error) {
      console.error('❌ Erro no getEquipmentHistory:', error);
      throw error;
    }
  },

  // ================================
  // OPERAÇÕES DE ANEXOS
  // ================================

  // Obter anexos de um equipamento
  getEquipmentAttachments: async (equipmentId: string): Promise<Attachment[]> => {
    try {
      console.log(`📎 Carregando anexos do equipamento ${equipmentId}...`);
      
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar anexos:', error);
        throw new Error(`Erro ao carregar anexos: ${error.message}`);
      }

      // Se data for null, retorna array vazio
      const attachments = data ? data.map(transformAttachment) : [];
      
      console.log(`✅ ${attachments.length} anexo(s) carregado(s)`);
      return attachments;
    } catch (error) {
      console.error('❌ Erro no getEquipmentAttachments:', error);
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
      console.log(`📤 Enviando anexo: ${file.name}...`);
      
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${equipmentId}/${Date.now()}.${fileExt}`;
      
      // Upload para o Storage
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file);

      if (uploadError) {
        console.error('❌ Erro no upload:', uploadError);
        throw new Error(`Erro ao fazer upload: ${uploadError.message}`);
      }

      // Registrar no banco de dados
      const { data, error } = await supabase
        .from('attachments')
        .insert({
          equipment_id: equipmentId,
          name: file.name,
          size: file.size,
          type: file.type,
          file_path: fileName,
          uploaded_by: user
        })
        .select()
        .single();

      if (error) {
        // Se falhar ao registrar, remover arquivo do storage
        await supabase.storage.from(STORAGE_BUCKET).remove([fileName]);
        console.error('❌ Erro ao registrar anexo:', error);
        throw new Error(`Erro ao registrar anexo: ${error.message}`);
      }

      // Registrar no histórico
      await supabase.from('history_entries').insert({
        equipment_id: equipmentId,
        user_name: user,
        change_type: 'anexou arquivo',
        new_value: file.name
      });

      const attachment = transformAttachment(data);
      console.log('✅ Anexo enviado:', file.name);
      return attachment;
    } catch (error) {
      console.error('❌ Erro no uploadAttachment:', error);
      throw error;
    }
  },

  // Excluir anexo
  deleteAttachment: async (attachmentId: string, user: string): Promise<void> => {
    try {
      console.log('🗑️ Excluindo anexo:', attachmentId);
      
      // Buscar anexo para obter informações
      const { data: attachment, error: fetchError } = await supabase
        .from('attachments')
        .select('*')
        .eq('id', attachmentId)
        .single();

      if (fetchError || !attachment) {
        throw new Error('Anexo não encontrado');
      }

      // Excluir do Storage
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([attachment.file_path]);

      if (storageError) {
        console.warn('⚠️ Erro ao excluir arquivo do storage:', storageError);
      }

      // Registrar no histórico
      await supabase.from('history_entries').insert({
        equipment_id: attachment.equipment_id,
        user_name: user,
        change_type: 'removeu arquivo',
        old_value: attachment.name
      });

      // Excluir do banco de dados
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) {
        console.error('❌ Erro ao excluir anexo:', error);
        throw new Error(`Erro ao excluir anexo: ${error.message}`);
      }

      console.log('✅ Anexo excluído:', attachment.name);
    } catch (error) {
      console.error('❌ Erro no deleteAttachment:', error);
      throw error;
    }
  },

  // Download de anexo
  downloadAttachment: async (attachment: Attachment): Promise<void> => {
    try {
      console.log('📥 Baixando anexo:', attachment.name);
      
      // Criar link temporário e clicar
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Download iniciado:', attachment.name);
    } catch (error) {
      console.error('❌ Erro no downloadAttachment:', error);
      throw error;
    }
  }
};

// Exportar o serviço
export default inventoryService;