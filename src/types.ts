// src/types.ts
export interface Equipment {
  id: string;
  assetNumber: string;
  description: string;
  brand: string;
  model: string;
  specs?: string;
  status: 'ativo' | 'manutenção' | 'desativado';
  location: string;
  responsible: string;
  acquisitionDate: string;
  value: number;
  maintenanceDescription?: string;
}

export interface HistoryEntry {
  id: string;
  equipmentId: string;
  timestamp: string;
  user: string;
  changeType: 'criou' | 'editou' | 'excluiu' | 'manutenção' | 'alterou status' | 'anexou arquivo' | 'removeu arquivo';
  field?: string;
  oldValue?: string;
  newValue?: string;
}

export interface Attachment {
  id: string;
  equipmentId: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

// Tipos adicionais para o Supabase
export interface DatabaseEquipment {
  id: string;
  asset_number: string;
  description: string;
  brand: string;
  model: string;
  specs: string | null;
  status: 'ativo' | 'manutenção' | 'desativado';
  location: string;
  responsible: string;
  acquisition_date: string;
  value: number;
  maintenance_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseHistoryEntry {
  id: string;
  equipment_id: string;
  timestamp: string;
  user: string;
  change_type: 'criou' | 'editou' | 'excluiu' | 'manutenção' | 'alterou status' | 'anexou arquivo' | 'removeu arquivo';
  field: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface DatabaseAttachment {
  id: string;
  equipment_id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploaded_by: string;
  uploaded_at: string;
  created_at: string;
}