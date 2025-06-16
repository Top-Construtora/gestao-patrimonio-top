// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { DatabaseEquipment, DatabaseHistoryEntry, DatabaseAttachment } from '../types';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Definir tipos do banco de dados
export interface Database {
  public: {
    Tables: {
      equipments: {
        Row: DatabaseEquipment;
        Insert: Omit<DatabaseEquipment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseEquipment, 'id' | 'created_at' | 'updated_at'>>;
      };
      history_entries: {
        Row: DatabaseHistoryEntry;
        Insert: Omit<DatabaseHistoryEntry, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseHistoryEntry, 'id' | 'created_at'>>;
      };
      attachments: {
        Row: DatabaseAttachment;
        Insert: Omit<DatabaseAttachment, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseAttachment, 'id' | 'created_at'>>;
      };
    };
    Views: {
      recent_activities: {
        Row: {
          id: string;
          equipment_id: string;
          asset_number: string;
          equipment_description: string;
          timestamp: string;
          user_name: string;
          change_type: string;
          field: string | null;
          old_value: string | null;
          new_value: string | null;
        };
      };
      equipment_summary: {
        Row: {
          status: string;
          total_count: number;
          total_value: number;
          average_value: number;
          oldest_acquisition: string;
          newest_acquisition: string;
        };
      };
    };
  };
}

// Criar cliente Supabase com tipos
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Para este projeto, não precisamos de autenticação
  }
});

// Configurações específicas para o projeto
export const STORAGE_BUCKET = 'equipment-attachments';

// Utilitários para verificar conexão
export const checkConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('equipments').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('Erro de conexão com Supabase:', error);
    return false;
  }
};


export default supabase;