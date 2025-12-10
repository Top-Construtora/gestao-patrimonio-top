import apiClient from './apiClient';
import { EquipmentPurchase } from '../types/purchaseTypes';
import { Equipment } from '../types';
import inventoryService from './inventoryService';

// API response types
interface ApiPurchase {
  id: string;
  description: string;
  brand: string | null;
  model: string | null;
  specifications: string | null;
  location: string | null;
  urgency: 'baixa' | 'média' | 'alta' | 'crítica';
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'adquirido';
  requestedBy: string;
  requestDate: string;
  expectedDate: string | null;
  supplier: string | null;
  observations: string | null;
  approvedBy: string | null;
  approvalDate: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PurchaseStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  acquired: number;
}

// Transform API purchase to frontend format
const transformPurchase = (api: ApiPurchase): EquipmentPurchase => ({
  id: api.id,
  description: api.description,
  brand: api.brand || undefined,
  model: api.model || undefined,
  specifications: api.specifications || undefined,
  location: api.location || undefined,
  urgency: api.urgency,
  status: api.status,
  requestedBy: api.requestedBy,
  requestDate: api.requestDate,
  expectedDate: api.expectedDate || undefined,
  supplier: api.supplier || undefined,
  observations: api.observations || undefined,
  approvedBy: api.approvedBy || undefined,
  approvalDate: api.approvalDate || undefined,
  rejectionReason: api.rejectionReason || undefined,
  createdAt: api.createdAt,
  updatedAt: api.updatedAt,
});

const purchaseService = {
  // Check connection
  checkConnection: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get('/health');
      return response.success;
    } catch {
      return false;
    }
  },

  // Get all purchases
  getAllPurchases: async (): Promise<EquipmentPurchase[]> => {
    const response = await apiClient.get<ApiPurchase[]>('/purchases');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get purchases');
    }
    return response.data.map(transformPurchase);
  },

  // Get purchase by ID
  getPurchaseById: async (id: string): Promise<EquipmentPurchase | null> => {
    const response = await apiClient.get<ApiPurchase>(`/purchases/${id}`);
    if (!response.success) {
      if (response.error === 'Purchase not found') return null;
      throw new Error(response.error || 'Failed to get purchase');
    }
    return response.data ? transformPurchase(response.data) : null;
  },

  // Create purchase
  createPurchase: async (
    purchaseData: Omit<EquipmentPurchase, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'approvedBy' | 'approvalDate' | 'rejectionReason'>,
    user: string
  ): Promise<EquipmentPurchase> => {
    const response = await apiClient.post<ApiPurchase>('/purchases', {
      description: purchaseData.description,
      brand: purchaseData.brand,
      model: purchaseData.model,
      specifications: purchaseData.specifications,
      location: purchaseData.location,
      urgency: purchaseData.urgency,
      requestedBy: user,
      requestDate: purchaseData.requestDate || new Date().toISOString().split('T')[0],
      expectedDate: purchaseData.expectedDate,
      supplier: purchaseData.supplier,
      observations: purchaseData.observations,
      userName: user,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create purchase');
    }

    return transformPurchase(response.data);
  },

  // Update purchase
  updatePurchase: async (
    id: string,
    updates: Partial<EquipmentPurchase>,
    user: string
  ): Promise<EquipmentPurchase> => {
    const response = await apiClient.put<ApiPurchase>(`/purchases/${id}`, {
      ...updates,
      userName: user,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update purchase');
    }

    return transformPurchase(response.data);
  },

  // Approve purchase
  approvePurchase: async (id: string, user: string): Promise<void> => {
    const response = await apiClient.post(`/purchases/${id}/approve`, { userName: user });
    if (!response.success) {
      throw new Error(response.error || 'Failed to approve purchase');
    }
  },

  // Reject purchase
  rejectPurchase: async (id: string, reason: string, user: string): Promise<void> => {
    const response = await apiClient.post(`/purchases/${id}/reject`, { reason, userName: user });
    if (!response.success) {
      throw new Error(response.error || 'Failed to reject purchase');
    }
  },

  // Mark as acquired
  markAsAcquired: async (id: string, user: string): Promise<void> => {
    const response = await apiClient.post(`/purchases/${id}/acquire`, { userName: user });
    if (!response.success) {
      throw new Error(response.error || 'Failed to mark as acquired');
    }
  },

  // Delete purchase
  deletePurchase: async (id: string, user: string): Promise<void> => {
    const response = await apiClient.delete(`/purchases/${id}`, { userName: user });
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete purchase');
    }
  },

  // Get purchase statistics
  getPurchaseStats: async () => {
    const response = await apiClient.get<PurchaseStats>('/purchases/stats');
    if (!response.success || !response.data) {
      return null;
    }
    return {
      total: response.data.total,
      pending: response.data.pending,
      approved: response.data.approved,
      rejected: response.data.rejected,
      acquired: response.data.acquired,
      byUrgency: {
        baixa: 0,
        média: 0,
        alta: 0,
        crítica: 0,
      },
    };
  },

  // Convert purchase to equipment
  convertToEquipment: async (
    purchaseId: string,
    equipmentData: Omit<Equipment, 'id'>,
    user: string
  ): Promise<void> => {
    // Create the equipment
    await inventoryService.createEquipment(equipmentData, user);

    // Mark the purchase as acquired
    await purchaseService.markAsAcquired(purchaseId, user);
  },
};

export default purchaseService;
