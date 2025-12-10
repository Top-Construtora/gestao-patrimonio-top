import apiClient from './apiClient';
import { supabase, STORAGE_BUCKET } from '../lib/supabase';
import { Equipment, HistoryEntry, Attachment } from '../types';

// API response types
interface ApiEquipment {
  id: string;
  assetNumber: string;
  description: string;
  brand: string;
  model: string;
  specs: string | null;
  status: 'ativo' | 'manutenção' | 'desativado';
  location: string;
  responsible: string;
  acquisitionDate: string;
  invoiceDate: string | null;
  value: number;
  maintenanceDescription: string | null;
  createdAt: string;
  updatedAt: string;
  attachments?: ApiAttachment[];
}

interface ApiAttachment {
  id: string;
  equipmentId: string;
  name: string;
  size: number;
  type: string;
  filePath: string;
  url?: string;
  uploadedBy: string;
  uploadedAt: string;
  createdAt: string;
}

interface ApiHistoryEntry {
  id: string;
  equipmentId: string | null;
  entityType: string;
  entityId: string | null;
  userName: string;
  changeType: string;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  timestamp: string;
  createdAt: string;
}

interface EquipmentStats {
  total: number;
  active: number;
  maintenance: number;
  inactive: number;
  totalValue: number;
}

// Transform API equipment to frontend format
const transformEquipment = (api: ApiEquipment): Equipment => ({
  id: api.id,
  assetNumber: api.assetNumber,
  description: api.description,
  brand: api.brand,
  model: api.model,
  specs: api.specs || undefined,
  status: api.status,
  location: api.location,
  responsible: api.responsible,
  acquisitionDate: api.acquisitionDate,
  invoiceDate: api.invoiceDate || undefined,
  value: api.value,
  maintenanceDescription: api.maintenanceDescription || undefined,
  observacoesManutenção: api.maintenanceDescription || undefined,
  createdAt: api.createdAt,
  updatedAt: api.updatedAt,
});

// Transform API history to frontend format
const transformHistoryEntry = (api: ApiHistoryEntry): HistoryEntry => ({
  id: api.id,
  equipmentId: api.equipmentId || '',
  timestamp: api.timestamp,
  user: api.userName,
  changeType: api.changeType,
  field: api.field || undefined,
  oldValue: api.oldValue || undefined,
  newValue: api.newValue || undefined,
});

// Transform API attachment to frontend format
const transformAttachment = (api: ApiAttachment): Attachment => ({
  id: api.id,
  equipmentId: api.equipmentId,
  name: api.name,
  size: api.size,
  type: api.type,
  url: api.url || '',
  uploadedBy: api.uploadedBy,
  uploadedAt: api.uploadedAt,
});

const inventoryService = {
  // Check connection
  checkConnection: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get('/health');
      return response.success;
    } catch {
      return false;
    }
  },

  // Get next asset number
  getNextAssetNumber: async (): Promise<string> => {
    const response = await apiClient.get<{ assetNumber: string }>('/equipment/next-asset-number');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get next asset number');
    }
    return response.data.assetNumber;
  },

  // Validate asset number
  validateAssetNumber: async (assetNumber: string, excludeId?: string): Promise<{ valid: boolean; message?: string }> => {
    // Validate format
    if (!assetNumber.match(/^TOP\s*[-–]\s*\d{4}$/i)) {
      return {
        valid: false,
        message: 'Formato inválido. Use TOP-0000'
      };
    }

    // Check if exists using Supabase directly (for now)
    const normalizedNumber = assetNumber.replace(/\s+/g, '').toUpperCase();

    let query = supabase
      .from('equipments')
      .select('id, asset_number')
      .or(`asset_number.eq.${assetNumber},asset_number.eq.${normalizedNumber}`);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error && error.code !== 'PGRST116') {
      return { valid: false, message: 'Erro ao verificar número' };
    }

    if (data && data.length > 0) {
      return { valid: false, message: 'Este número de patrimônio já está em uso' };
    }

    return { valid: true };
  },

  // Get all equipment
  getAllEquipment: async (): Promise<Equipment[]> => {
    const response = await apiClient.get<ApiEquipment[]>('/equipment');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get equipment');
    }
    return response.data.map(transformEquipment);
  },

  // Get equipment by ID
  getEquipmentById: async (id: string): Promise<Equipment | null> => {
    const response = await apiClient.get<ApiEquipment>(`/equipment/${id}`);
    if (!response.success) {
      if (response.error === 'Equipment not found') return null;
      throw new Error(response.error || 'Failed to get equipment');
    }
    return response.data ? transformEquipment(response.data) : null;
  },

  // Create equipment
  createEquipment: async (
    equipmentData: Omit<Equipment, 'id'>,
    user: string,
    attachmentFiles?: File[]
  ): Promise<Equipment> => {
    const response = await apiClient.post<ApiEquipment>('/equipment', {
      assetNumber: equipmentData.assetNumber,
      description: equipmentData.description,
      brand: equipmentData.brand,
      model: equipmentData.model,
      specs: equipmentData.specs,
      status: equipmentData.status,
      location: equipmentData.location,
      responsible: equipmentData.responsible,
      acquisitionDate: equipmentData.acquisitionDate,
      invoiceDate: equipmentData.invoiceDate,
      value: equipmentData.value,
      maintenanceDescription: equipmentData.maintenanceDescription || equipmentData.observacoesManutenção,
      userName: user,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create equipment');
    }

    const equipment = transformEquipment(response.data);

    // Upload attachments if any
    if (attachmentFiles && attachmentFiles.length > 0) {
      for (const file of attachmentFiles) {
        try {
          await inventoryService.uploadAttachment(equipment.id, file, user);
        } catch (err) {
          console.error('Error uploading attachment:', err);
        }
      }
    }

    return equipment;
  },

  // Update equipment
  updateEquipment: async (
    id: string,
    updates: Partial<Omit<Equipment, 'id'>>,
    user: string,
    _observations?: string
  ): Promise<Equipment> => {
    const response = await apiClient.put<ApiEquipment>(`/equipment/${id}`, {
      ...updates,
      userName: user,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update equipment');
    }

    return transformEquipment(response.data);
  },

  // Delete equipment
  deleteEquipment: async (id: string, user: string): Promise<void> => {
    const response = await apiClient.delete(`/equipment/${id}`, { userName: user });
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete equipment');
    }
  },

  // Upload attachment
  uploadAttachment: async (
    equipmentId: string,
    file: File,
    uploadedBy: string
  ): Promise<Attachment> => {
    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Arquivo muito grande. Tamanho máximo: 10MB');
    }

    const response = await apiClient.uploadFile<ApiAttachment>(
      `/equipment/${equipmentId}/attachments`,
      file,
      { userName: uploadedBy }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to upload attachment');
    }

    return transformAttachment(response.data);
  },

  // Delete attachment
  deleteAttachment: async (attachmentId: string, deletedBy: string = 'Sistema'): Promise<void> => {
    const response = await apiClient.delete(`/equipment/attachments/${attachmentId}`, { userName: deletedBy });
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete attachment');
    }
  },

  // Get equipment attachments
  getEquipmentAttachments: async (equipmentId: string): Promise<Attachment[]> => {
    const response = await apiClient.get<ApiAttachment[]>(`/equipment/${equipmentId}/attachments`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get attachments');
    }
    return response.data.map(transformAttachment);
  },

  // Download attachment
  downloadAttachment: async (attachment: Attachment): Promise<void> => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Get recent activities
  getRecentActivities: async (limit: number = 10): Promise<HistoryEntry[]> => {
    const response = await apiClient.get<ApiHistoryEntry[]>(`/history/recent?limit=${limit}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get activities');
    }
    return response.data.map(transformHistoryEntry);
  },

  // Get equipment history
  getEquipmentHistory: async (equipmentId: string): Promise<HistoryEntry[]> => {
    const response = await apiClient.get<ApiHistoryEntry[]>(`/equipment/${equipmentId}/history`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get history');
    }
    return response.data.map(transformHistoryEntry);
  },

  // Register maintenance
  registerMaintenance: async (
    equipmentId: string,
    maintenanceDescription: string,
    user: string
  ): Promise<void> => {
    const response = await apiClient.post(`/equipment/${equipmentId}/maintenance`, {
      description: maintenanceDescription,
      userName: user,
    });
    if (!response.success) {
      throw new Error(response.error || 'Failed to register maintenance');
    }
  },

  // Transfer equipment
  transferEquipment: async (
    equipmentId: string,
    newLocation: string,
    transferDate: string,
    responsiblePerson: string,
    observations?: string
  ): Promise<void> => {
    const response = await apiClient.post(`/equipment/${equipmentId}/transfer`, {
      location: newLocation,
      responsible: responsiblePerson,
      transferDate,
      observations,
      userName: responsiblePerson,
    });
    if (!response.success) {
      throw new Error(response.error || 'Failed to transfer equipment');
    }
  },

  // Get equipment statistics
  getEquipmentStats: async (): Promise<{ total: number; active: number; maintenance: number; inactive: number }> => {
    const response = await apiClient.get<EquipmentStats>('/equipment/stats');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get stats');
    }
    return {
      total: response.data.total,
      active: response.data.active,
      maintenance: response.data.maintenance,
      inactive: response.data.inactive,
    };
  },
};

export default inventoryService;
