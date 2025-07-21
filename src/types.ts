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
  serial_number?: string;
  asset_tag?: string;
  model?: string;
  manufacturer?: string;
  purchase_value?: number;
  notes?: string;
}

export type ChangeType = 
  | 'criou' 
  | 'editou' 
  | 'excluiu' 
  | 'manutenção' 
  | 'alterou status' 
  | 'anexou arquivo' 
  | 'removeu arquivo' 
  | 'transferiu';

export interface HistoryEntry {
  id: string;
  equipmentId: string;
  timestamp: string;
  user: string;
  changeType: ChangeType;
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
  change_type: ChangeType;
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
  url?: string;
  file_path: string; // Caminho do arquivo no bucket
  uploaded_by: string;
  uploaded_at: string;
  created_at: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  category: 'invoice' | 'purchase_order' | 'manual' | 'other';
}

export interface ResponsibilityTerm {
  id: string;
  equipmentId: string;
  responsiblePerson: string;
  responsibleEmail: string;
  responsiblePhone: string;
  responsibleCPF: string;
  responsibleDepartment: string;
  termDate: string;
  status: 'signed'; 
  observations?: string;
  manualSignature: string;
  pdfUrl?: string; 
}

export interface DatabaseResponsibilityTerm {
  id: string;
  equipment_id: string;
  responsible_person: string;
  responsible_email: string;
  responsible_phone: string;
  responsible_cpf: string;
  responsible_department: string;
  term_date: string;
  status: 'signed';
  observations: string | null;
  manual_signature: string; // Assinatura em base64
  pdf_url: string | null; // URL do PDF no storage
  created_at: string;
  updated_at: string;
}