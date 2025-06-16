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
  invoiceDate?: string;
  value: number;
  maintenanceDescription?: string;
  observacoesManutenção?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UrgencyLevel = 'baixa' | 'média' | 'alta' | 'crítica';

export interface EquipmentPurchase {
  id: string;
  equipment_name: string;
  purchase_reason: string;
  urgency: UrgencyLevel;
  estimated_date: string;
  created_at: string;
  created_by: string;
  updated_at: string;
}

export interface CreateEquipmentPurchaseDto {
  equipment_name: string;
  purchase_reason: string;
  urgency: UrgencyLevel;
  estimated_date: string;
}

export interface CompleteEquipmentPurchaseDto {
  responsible_person: string;
  acquisition_date: string;
  // Campos adicionais do equipamento principal
  serial_number?: string;
  asset_tag?: string;
  model?: string;
  manufacturer?: string;
  purchase_value?: number;
  notes?: string;
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
  invoice_date: string | null;
  value: number;
  maintenance_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseHistoryEntry {
  id: string;
  equipment_id: string;
  timestamp: string;
  user_name: string;
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
  file_path: string; // Caminho do arquivo no bucket
  uploaded_by: string;
  uploaded_at: string;
  created_at: string;
}