// services/purchaseService.ts
import { supabase } from '../lib/supabase';
import { EquipmentPurchase, DatabaseEquipmentPurchase } from '../types/purchaseTypes';
import { Equipment } from '../types';
import inventoryService from './inventoryService';

// Converter dados do banco para interface da aplicação
const transformPurchase = (dbPurchase: DatabaseEquipmentPurchase): EquipmentPurchase => ({
  id: dbPurchase.id,
  description: dbPurchase.description,
  justification: dbPurchase.justification,
  category: dbPurchase.category,
  estimatedQuantity: dbPurchase.estimated_quantity,
  estimatedUnitValue: dbPurchase.estimated_unit_value,
  estimatedTotalValue: dbPurchase.estimated_total_value,
  urgency: dbPurchase.urgency,
  status: dbPurchase.status,
  requestedBy: dbPurchase.requested_by,
  requestDate: dbPurchase.request_date,
  expectedDate: dbPurchase.expected_date || undefined,
  supplier: dbPurchase.supplier || undefined,
  observations: dbPurchase.observations || undefined,
  createdAt: dbPurchase.created_at,
  updatedAt: dbPurchase.updated_at
});

// Converter dados da aplicação para o banco
const transformToDatabase = (
  purchase: Omit<EquipmentPurchase, 'id' | 'createdAt' | 'updatedAt'>
): Omit<DatabaseEquipmentPurchase, 'id' | 'created_at' | 'updated_at'> => ({
  description: purchase.description,
  justification: purchase.justification,
  category: purchase.category,
  estimated_quantity: purchase.estimatedQuantity,
  estimated_unit_value: purchase.estimatedUnitValue,
  estimated_total_value: purchase.estimatedTotalValue,
  urgency: purchase.urgency,
  status: purchase.status,
  requested_by: purchase.requestedBy,
  request_date: purchase.requestDate,
  expected_date: purchase.expectedDate || null,
  supplier: purchase.supplier || null,
  observations: purchase.observations || null,
  approved_by: purchase.approvedBy || null,
  approval_date: purchase.approvalDate || null,
  rejection_reason: purchase.rejectionReason || null
});

const purchaseService = {
  // Verificar conexão
  checkConnection: async (): Promise<boolean> => {
    try {
      const { error } = await supabase.from('equipment_purchases').select('count').limit(1);
      return !error;
    } catch (error) {
      console.error('❌ Erro de conexão:', error);
      return false;
    }
  },

  // Obter todas as solicitações de compra
  getAllPurchases: async (): Promise<EquipmentPurchase[]> => {
    try {
      const { data, error } = await supabase
        .from('equipment_purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar solicitações:', error);
        throw new Error(`Erro ao carregar solicitações: ${error.message}`);
      }

      return data ? data.map(transformPurchase) : [];
    } catch (error) {
      console.error('❌ Erro no getAllPurchases:', error);
      throw error;
    }
  },

  // Obter solicitação por ID
  getPurchaseById: async (id: string): Promise<EquipmentPurchase | null> => {
    try {
      const { data, error } = await supabase
        .from('equipment_purchases')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Erro ao buscar solicitação: ${error.message}`);
      }

      return data ? transformPurchase(data) : null;
    } catch (error) {
      console.error('❌ Erro no getPurchaseById:', error);
      throw error;
    }
  },

  // Criar nova solicitação
  createPurchase: async (
    purchaseData: Omit<EquipmentPurchase, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
    user: string
  ): Promise<EquipmentPurchase> => {
    try {
      const newPurchase = {
        ...purchaseData,
        status: 'pendente' as const,
        requestedBy: user,
        requestDate: purchaseData.requestDate || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('equipment_purchases')
        .insert(transformToDatabase(newPurchase))
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar solicitação: ${error.message}`);
      }

      // Registrar no histórico geral
      await supabase.from('history_entries').insert({
        equipment_id: data.id,
        user_name: user,
        change_type: 'criou',
        new_value: 'Solicitação de compra criada'
      });

      return transformPurchase(data);
    } catch (error) {
      console.error('❌ Erro no createPurchase:', error);
      throw error;
    }
  },

  // Atualizar solicitação
  updatePurchase: async (
    id: string,
    updates: Partial<EquipmentPurchase>,
    user: string
  ): Promise<EquipmentPurchase> => {
    try {
      const currentPurchase = await purchaseService.getPurchaseById(id);
      if (!currentPurchase) {
        throw new Error('Solicitação não encontrada');
      }

      const updateData: any = {};
      
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.justification !== undefined) updateData.justification = updates.justification;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.estimatedQuantity !== undefined) updateData.estimated_quantity = updates.estimatedQuantity;
      if (updates.estimatedUnitValue !== undefined) updateData.estimated_unit_value = updates.estimatedUnitValue;
      if (updates.estimatedTotalValue !== undefined) updateData.estimated_total_value = updates.estimatedTotalValue;
      if (updates.urgency !== undefined) updateData.urgency = updates.urgency;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.expectedDate !== undefined) updateData.expected_date = updates.expectedDate || null;
      if (updates.supplier !== undefined) updateData.supplier = updates.supplier || null;
      if (updates.observations !== undefined) updateData.observations = updates.observations || null;

      const { data, error } = await supabase
        .from('equipment_purchases')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar solicitação: ${error.message}`);
      }

      // Registrar mudanças no histórico
      for (const [key, value] of Object.entries(updates)) {
        if (key === 'id') continue;
        
        const currentValue = currentPurchase[key as keyof EquipmentPurchase];
        if (currentValue !== value) {
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

      return transformPurchase(data);
    } catch (error) {
      console.error('❌ Erro no updatePurchase:', error);
      throw error;
    }
  },

  // Marcar como adquirido
  markAsAcquired: async (id: string, user: string): Promise<EquipmentPurchase> => {
    return purchaseService.updatePurchase(
      id,
      {
        status: 'adquirido'
      },
      user
    );
  },

  // Excluir solicitação
  deletePurchase: async (id: string, user: string): Promise<void> => {
    try {
      // Registrar no histórico antes de excluir
      await supabase.from('history_entries').insert({
        equipment_id: id,
        user_name: user,
        change_type: 'excluiu',
        old_value: 'Solicitação de compra excluída'
      });

      const { error } = await supabase
        .from('equipment_purchases')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao excluir solicitação: ${error.message}`);
      }
    } catch (error) {
      console.error('❌ Erro no deletePurchase:', error);
      throw error;
    }
  },

  // Obter estatísticas
  getPurchaseStats: async () => {
    try {
      const { data: purchases } = await supabase
        .from('equipment_purchases')
        .select('*');

      if (!purchases) return null;

      const stats = {
        total: purchases.length,
        pending: purchases.filter(p => p.status === 'pendente').length,
        acquired: purchases.filter(p => p.status === 'adquirido').length,
        totalValue: purchases.reduce((sum, p) => sum + (p.estimated_total_value || 0), 0),
        byUrgency: {
          baixa: purchases.filter(p => p.urgency === 'baixa').length,
          média: purchases.filter(p => p.urgency === 'média').length,
          alta: purchases.filter(p => p.urgency === 'alta').length,
          crítica: purchases.filter(p => p.urgency === 'crítica').length
        }
      };

      return stats;
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return null;
    }
  },

  // Converter solicitação em equipamento
  convertToEquipment: async (
    purchaseId: string,
    equipmentData: Omit<Equipment, 'id'>,
    user: string
  ): Promise<void> => {
    try {
      // 1. Criar o equipamento
      const newEquipment = await inventoryService.createEquipment(equipmentData, user);
      
      // 2. Marcar a solicitação como adquirida
      await purchaseService.markAsAcquired(purchaseId, user);
      
      // 3. Adicionar entrada no histórico
      await supabase.from('history_entries').insert({
        equipment_id: newEquipment.id,
        user_name: user,
        change_type: 'criou',
        new_value: `Convertido da solicitação de compra #${purchaseId.substring(0, 8)}`
      });
      
      console.log('✅ Solicitação convertida em equipamento com sucesso');
    } catch (error) {
      console.error('❌ Erro ao converter solicitação:', error);
      throw error;
    }
  }
};

export default purchaseService;