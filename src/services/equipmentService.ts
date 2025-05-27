import { supabase } from '../lib/supabase';
import type { Equipment, EquipmentHistory, EquipmentAttachment, CreateEquipmentData, UpdateEquipmentData } from '../types/database';

export class EquipmentService {
  // Buscar todos os equipamentos
  async getAllEquipment(): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar equipamentos:', error);
      throw new Error(`Erro ao buscar equipamentos: ${error.message}`);
    }

    return data || [];
  }

  // Buscar equipamento por ID
  async getEquipmentById(id: string): Promise<Equipment | null> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Não encontrado
      console.error('Erro ao buscar equipamento:', error);
      throw new Error(`Erro ao buscar equipamento: ${error.message}`);
    }

    return data;
  }

  // Criar novo equipamento
  async createEquipment(data: CreateEquipmentData, userName: string): Promise<Equipment> {
    const { data: equipment, error } = await supabase
      .from('equipment')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar equipamento:', error);
      throw new Error(`Erro ao criar equipamento: ${error.message}`);
    }

    // Adicionar ao histórico
    await this.addHistoryEntry(equipment.id, userName, 'created', undefined, undefined, data.asset_number);

    return equipment;
  }

  // Atualizar equipamento
  async updateEquipment(id: string, updates: UpdateEquipmentData, userName: string): Promise<Equipment> {
    // Buscar dados atuais para comparação
    const currentEquipment = await this.getEquipmentById(id);
    if (!currentEquipment) {
      throw new Error('Equipamento não encontrado');
    }

    const { data: equipment, error } = await supabase
      .from('equipment')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar equipamento:', error);
      throw new Error(`Erro ao atualizar equipamento: ${error.message}`);
    }

    // Registrar mudanças no histórico
    for (const [field, newValue] of Object.entries(updates)) {
      const oldValue = currentEquipment[field as keyof Equipment];
      if (oldValue !== newValue) {
        await this.addHistoryEntry(id, userName, 'updated', field, String(oldValue), String(newValue));
      }
    }

    return equipment;
  }

  // Excluir equipamento
  async deleteEquipment(id: string, userName: string): Promise<void> {
    const equipment = await this.getEquipmentById(id);
    if (!equipment) {
      throw new Error('Equipamento não encontrado');
    }

    // Registrar exclusão no histórico antes de excluir
    await this.addHistoryEntry(id, userName, 'deleted', undefined, equipment.asset_number, undefined);

    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir equipamento:', error);
      throw new Error(`Erro ao excluir equipamento: ${error.message}`);
    }
  }

  // Buscar histórico de um equipamento
  async getEquipmentHistory(equipmentId: string): Promise<EquipmentHistory[]> {
    const { data, error } = await supabase
      .from('equipment_history')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Erro ao buscar histórico:', error);
      throw new Error(`Erro ao buscar histórico: ${error.message}`);
    }

    return data || [];
  }

  // Buscar histórico recente
  async getRecentHistory(limit = 10): Promise<EquipmentHistory[]> {
    const { data, error } = await supabase
      .from('equipment_history')
      .select(`
        *,
        equipment:equipment_id (
          asset_number,
          description
        )
      `)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar histórico recente:', error);
      throw new Error(`Erro ao buscar histórico recente: ${error.message}`);
    }

    return data || [];
  }

  // Adicionar entrada no histórico
  private async addHistoryEntry(
    equipmentId: string,
    userName: string,
    action: string,
    fieldChanged?: string,
    oldValue?: string,
    newValue?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('equipment_history')
      .insert([{
        equipment_id: equipmentId,
        user_name: userName,
        action,
        field_changed: fieldChanged,
        old_value: oldValue,
        new_value: newValue
      }]);

    if (error) {
      console.error('Erro ao adicionar histórico:', error);
      // Não lance erro aqui para não interromper operação principal
    }
  }

  // Upload de arquivo
  async uploadFile(equipmentId: string, file: File, userName: string): Promise<EquipmentAttachment> {
    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${equipmentId}/${Date.now()}.${fileExt}`;

    // Upload do arquivo
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('equipment-files')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      throw new Error(`Erro no upload: ${uploadError.message}`);
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('equipment-files')
      .getPublicUrl(fileName);

    // Salvar informações no banco
    const { data: attachment, error: dbError } = await supabase
      .from('equipment_attachments')
      .insert([{
        equipment_id: equipmentId,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_url: urlData.publicUrl,
        uploaded_by: userName
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao salvar anexo:', dbError);
      throw new Error(`Erro ao salvar anexo: ${dbError.message}`);
    }

    // Adicionar ao histórico
    await this.addHistoryEntry(equipmentId, userName, 'file_uploaded', undefined, undefined, file.name);

    return attachment;
  }

  // Buscar anexos de um equipamento
  async getEquipmentAttachments(equipmentId: string): Promise<EquipmentAttachment[]> {
    const { data, error } = await supabase
      .from('equipment_attachments')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar anexos:', error);
      throw new Error(`Erro ao buscar anexos: ${error.message}`);
    }

    return data || [];
  }

  // Excluir anexo
  async deleteAttachment(attachmentId: string, userName: string): Promise<void> {
    // Buscar informações do anexo
    const { data: attachment, error: fetchError } = await supabase
      .from('equipment_attachments')
      .select('*')
      .eq('id', attachmentId)
      .single();

    if (fetchError) {
      throw new Error(`Erro ao buscar anexo: ${fetchError.message}`);
    }

    // Extrair caminho do arquivo da URL
    const url = new URL(attachment.file_url);
    const filePath = url.pathname.split('/').slice(-2).join('/'); // equipmentId/filename

    // Excluir arquivo do storage
    const { error: storageError } = await supabase.storage
      .from('equipment-files')
      .remove([filePath]);

    if (storageError) {
      console.warn('Erro ao excluir arquivo do storage:', storageError);
    }

    // Excluir registro do banco
    const { error: dbError } = await supabase
      .from('equipment_attachments')
      .delete()
      .eq('id', attachmentId);

    if (dbError) {
      throw new Error(`Erro ao excluir anexo: ${dbError.message}`);
    }

    // Adicionar ao histórico
    await this.addHistoryEntry(attachment.equipment_id, userName, 'file_deleted', undefined, attachment.file_name, undefined);
  }
}

// Instância singleton
export const equipmentService = new EquipmentService();