export interface Database {
  public: {
    Tables: {
      equipment: {
        Row: Equipment;
        Insert: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Equipment, 'id' | 'created_at' | 'updated_at'>>;
      };
      equipment_history: {
        Row: EquipmentHistory;
        Insert: Omit<EquipmentHistory, 'id' | 'timestamp'>;
        Update: Partial<Omit<EquipmentHistory, 'id' | 'timestamp'>>;
      };
      equipment_attachments: {
        Row: EquipmentAttachment;
        Insert: Omit<EquipmentAttachment, 'id' | 'uploaded_at'>;
        Update: Partial<Omit<EquipmentAttachment, 'id' | 'uploaded_at'>>;
      };
    };
  };
}

export interface Equipment {
  id: string;
  asset_number: string;
  description: string;
  brand: string;
  model: string;
  specs?: string;
  status: 'ativo' | 'manutenção' | 'desativado';
  location: string;
  responsible: string;
  acquisition_date: string;
  value: number;
  maintenance_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentHistory {
  id: string;
  equipment_id: string;
  user_name: string;
  action: string;
  field_changed?: string;
  old_value?: string;
  new_value?: string;
  timestamp: string;
}

export interface EquipmentAttachment {
  id: string;
  equipment_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
}

// Tipos para o frontend
export interface CreateEquipmentData {
  asset_number: string;
  description: string;
  brand: string;
  model: string;
  specs?: string;
  status: 'ativo' | 'manutenção' | 'desativado';
  location: string;
  responsible: string;
  acquisition_date: string;
  value: number;
  maintenance_notes?: string;
}

export interface UpdateEquipmentData extends Partial<CreateEquipmentData> {}