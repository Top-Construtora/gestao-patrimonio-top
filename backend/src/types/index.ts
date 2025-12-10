// Database types (snake_case)
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
  equipment_id: string | null;
  entity_type: string;
  entity_id: string | null;
  user_name: string;
  change_type: string;
  field: string | null;
  old_value: string | null;
  new_value: string | null;
  timestamp: string;
  created_at: string;
}

export interface DatabaseAttachment {
  id: string;
  equipment_id: string;
  name: string;
  size: number;
  type: string;
  file_path: string;
  uploaded_by: string;
  uploaded_at: string;
  created_at: string;
}

export interface DatabasePurchase {
  id: string;
  description: string;
  brand: string | null;
  model: string | null;
  specifications: string | null;
  location: string | null;
  urgency: 'baixa' | 'média' | 'alta' | 'crítica';
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'adquirido';
  requested_by: string;
  request_date: string;
  expected_date: string | null;
  supplier: string | null;
  observations: string | null;
  approved_by: string | null;
  approval_date: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseResponsibilityTerm {
  id: string;
  equipment_id: string;
  responsible_person: string;
  responsible_email: string;
  responsible_phone: string;
  responsible_department: string;
  term_date: string;
  observations: string | null;
  pdf_url: string | null;
  status: 'draft' | 'sent' | 'signed' | 'cancelled';
  manual_signature: string | null;
  created_at: string;
  updated_at: string;
}

// API types (camelCase)
export interface Equipment {
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
  attachments?: Attachment[];
}

export interface HistoryEntry {
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

export interface Attachment {
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

export interface Purchase {
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

export interface ResponsibilityTerm {
  id: string;
  equipmentId: string;
  responsiblePerson: string;
  responsibleEmail: string;
  responsiblePhone: string;
  responsibleDepartment: string;
  termDate: string;
  observations: string | null;
  pdfUrl: string | null;
  status: 'draft' | 'sent' | 'signed' | 'cancelled';
  manualSignature: string | null;
  createdAt: string;
  updatedAt: string;
}

// Request/Response types
export interface CreateEquipmentRequest {
  assetNumber?: string;
  description: string;
  brand: string;
  model: string;
  specs?: string;
  status?: 'ativo' | 'manutenção' | 'desativado';
  location: string;
  responsible: string;
  acquisitionDate: string;
  invoiceDate?: string;
  value: number;
  maintenanceDescription?: string;
  userName: string;
}

export interface UpdateEquipmentRequest {
  description?: string;
  brand?: string;
  model?: string;
  specs?: string;
  status?: 'ativo' | 'manutenção' | 'desativado';
  location?: string;
  responsible?: string;
  acquisitionDate?: string;
  invoiceDate?: string;
  value?: number;
  maintenanceDescription?: string;
  userName: string;
}

export interface TransferEquipmentRequest {
  location: string;
  responsible: string;
  transferDate: string;
  observations?: string;
  userName: string;
}

export interface CreatePurchaseRequest {
  description: string;
  brand?: string;
  model?: string;
  specifications?: string;
  location?: string;
  urgency: 'baixa' | 'média' | 'alta' | 'crítica';
  requestedBy: string;
  requestDate: string;
  expectedDate?: string;
  supplier?: string;
  observations?: string;
  userName: string;
}

export interface UpdatePurchaseRequest {
  description?: string;
  brand?: string;
  model?: string;
  specifications?: string;
  location?: string;
  urgency?: 'baixa' | 'média' | 'alta' | 'crítica';
  expectedDate?: string;
  supplier?: string;
  observations?: string;
  userName: string;
}

export interface CreateResponsibilityTermRequest {
  equipmentId: string;
  responsiblePerson: string;
  responsibleEmail: string;
  responsiblePhone: string;
  responsibleDepartment: string;
  termDate: string;
  observations?: string;
  manualSignature?: string;
  pdfBase64?: string;
  userName: string;
}

export interface EquipmentStats {
  total: number;
  active: number;
  maintenance: number;
  inactive: number;
  totalValue: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
