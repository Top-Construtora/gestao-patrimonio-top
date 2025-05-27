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
  maintenanceDescription?: string; // Novo campo para descrição da manutenção
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