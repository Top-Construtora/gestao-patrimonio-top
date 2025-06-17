// services/purchaseService.ts
import { supabase } from '../lib/supabase';
import { 
  EquipmentPurchase, 
  DatabaseEquipmentPurchase, 
  PurchaseStatus 
} from '../types/purchaseTypes';
import { Equipment } from '../types';
import inventoryService from './inventoryService';

// Função para transformar dados do banco para o formato da aplicação
const transformPurchase = (dbPurchase: DatabaseEquipmentPurchase): EquipmentPurchase => {
  return {
    id: dbPurchase.id,
    description: dbPurchase.description,
    brand: dbPurchase.brand || undefined,
    model: dbPurchase.model || undefined,
    specifications: dbPurchase.specifications || undefined,
    location: dbPurchase.location || undefined,
    urgency: dbPurchase.urgency,
    status: dbPurchase.status,
    requestedBy: dbPurchase.requested_by,
    requestDate: dbPurchase.request_date,
    expectedDate: dbPurchase.expected_date || undefined,
    supplier: dbPurchase.supplier || undefined,
    observations: dbPurchase.observations || undefined,
    approvedBy: dbPurchase.approved_by || undefined,
    approvalDate: dbPurchase.approval_date || undefined,
    rejectionReason: dbPurchase.rejection_reason || undefined,
    createdAt: dbPurchase.created_at,
    updatedAt: dbPurchase.updated_at
  };
};

// Função para transformar dados da aplicação para o formato do banco
const transformToDatabase = (purchase: Partial<EquipmentPurchase>): Partial<DatabaseEquipmentPurchase> => {
  const dbPurchase: Partial<DatabaseEquipmentPurchase> = {};
  
  if (purchase.description !== undefined) dbPurchase.description = purchase.description;
  if (purchase.brand !== undefined) dbPurchase.brand = purchase.brand || null;
  if (purchase.model !== undefined) dbPurchase.model = purchase.model || null;
  if (purchase.specifications !== undefined) dbPurchase.specifications = purchase.specifications || null;
  if (purchase.location !== undefined) dbPurchase.location = purchase.location || null;
  if (purchase.urgency !== undefined) dbPurchase.urgency = purchase.urgency;
  if (purchase.status !== undefined) dbPurchase.status = purchase.status;
  if (purchase.requestedBy !== undefined) dbPurchase.requested_by = purchase.requestedBy;
  if (purchase.requestDate !== undefined) dbPurchase.request_date = purchase.requestDate;
  if (purchase.expectedDate !== undefined) dbPurchase.expected_date = purchase.expectedDate || null;
  if (purchase.supplier !== undefined) dbPurchase.supplier = purchase.supplier || null;
  if (purchase.observations !== undefined) dbPurchase.observations = purchase.observations || null;
  if (purchase.approvedBy !== undefined) dbPurchase.approved_by = purchase.approvedBy || null;
  if (purchase.approvalDate !== undefined) dbPurchase.approval_date = purchase.approvalDate || null;
  if (purchase.rejectionReason !== undefined) dbPurchase.rejection_reason = purchase.rejectionReason || null;
  
  return dbPurchase;
};

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

  // Obter todas as solicitações
  getAllPurchases: async (): Promise<EquipmentPurchase[]> => {
    try {
      const { data, error } = await supabase
        .from('equipment_purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar solicitações: ${error.message}`);
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
    purchaseData: Omit<EquipmentPurchase, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'approvedBy' | 'approvalDate' | 'rejectionReason'>,
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

      // REMOVIDO: Registro no histórico para evitar conflito com foreign key

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

      const updateData = transformToDatabase(updates);

      const { data, error } = await supabase
        .from('equipment_purchases')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar solicitação: ${error.message}`);
      }

      // REMOVIDO: Registro no histórico para evitar conflito com foreign key

      return transformPurchase(data);
    } catch (error) {
      console.error('❌ Erro no updatePurchase:', error);
      throw error;
    }
  },

  // Aprovar solicitação
  approvePurchase: async (id: string, user: string): Promise<void> => {
    await purchaseService.updatePurchase(
      id,
      {
        status: 'aprovado',
        approvedBy: user,
        approvalDate: new Date().toISOString()
      },
      user
    );
  },

  // Rejeitar solicitação
  rejectPurchase: async (id: string, reason: string, user: string): Promise<void> => {
    await purchaseService.updatePurchase(
      id,
      {
        status: 'rejeitado',
        rejectionReason: reason
      },
      user
    );
  },

  // Marcar como adquirido
  markAsAcquired: async (id: string, user: string): Promise<void> => {
    await purchaseService.updatePurchase(
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
      // REMOVIDO: Registro no histórico para evitar conflito com foreign key

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
        approved: purchases.filter(p => p.status === 'aprovado').length,
        rejected: purchases.filter(p => p.status === 'rejeitado').length,
        acquired: purchases.filter(p => p.status === 'adquirido').length,
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
      
      // 3. Adicionar entrada no histórico DO EQUIPAMENTO (não da purchase)
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