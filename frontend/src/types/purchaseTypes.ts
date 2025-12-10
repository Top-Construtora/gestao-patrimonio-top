export type PurchaseUrgency = 'baixa' | 'média' | 'alta' | 'crítica';
export type PurchaseStatus = 'pendente' | 'aprovado' | 'rejeitado' | 'adquirido';

export interface EquipmentPurchase {
  id: string;
  description: string;
  brand?: string;
  model?: string;
  specifications?: string;
  location?: string;
  urgency: PurchaseUrgency;
  status: PurchaseStatus;
  requestedBy: string;
  requestDate: string;
  expectedDate?: string;
  supplier?: string;
  observations?: string;
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseEquipmentPurchase {
  id: string;
  description: string;
  brand: string | null;
  model: string | null;
  specifications: string | null;
  location: string | null;
  urgency: PurchaseUrgency;
  status: PurchaseStatus;
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
