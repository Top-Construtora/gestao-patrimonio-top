export type PurchaseUrgency = 'baixa' | 'média' | 'alta' | 'crítica';
export type PurchaseStatus = 'pendente' | 'aprovado' | 'rejeitado' | 'adquirido';

export interface EquipmentPurchase {
  id: string;
  description: string;
  category: string;
  estimatedQuantity: number;
  estimatedUnitValue: number;
  estimatedTotalValue: number;
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
  // justification: string; // REMOVIDO
  category: string;
  estimated_quantity: number;
  estimated_unit_value: number;
  estimated_total_value: number;
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