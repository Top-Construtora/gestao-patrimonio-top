// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos do banco de dados
export interface Database {
  public: {
    Tables: {
      equipment: {
        Row: {
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
        };
        Insert: {
          id?: string;
          asset_number: string;
          description: string;
          brand: string;
          model: string;
          specs?: string | null;
          status: 'ativo' | 'manutenção' | 'desativado';
          location: string;
          responsible: string;
          acquisition_date: string;
          value: number;
          maintenance_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          asset_number?: string;
          description?: string;
          brand?: string;
          model?: string;
          specs?: string | null;
          status?: 'ativo' | 'manutenção' | 'desativado';
          location?: string;
          responsible?: string;
          acquisition_date?: string;
          value?: number;
          maintenance_description?: string | null;
          updated_at?: string;
        };
      };
      history_entries: {
        Row: {
          id: string;
          equipment_id: string;
          timestamp: string;
          user: string;
          change_type: 'criou' | 'editou' | 'excluiu' | 'manutenção' | 'alterou status' | 'anexou arquivo' | 'removeu arquivo';
          field: string | null;
          old_value: string | null;
          new_value: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          equipment_id: string;
          timestamp?: string;
          user: string;
          change_type: 'criou' | 'editou' | 'excluiu' | 'manutenção' | 'alterou status' | 'anexou arquivo' | 'removeu arquivo';
          field?: string | null;
          old_value?: string | null;
          new_value?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          equipment_id?: string;
          timestamp?: string;
          user?: string;
          change_type?: 'criou' | 'editou' | 'excluiu' | 'manutenção' | 'alterou status' | 'anexou arquivo' | 'removeu arquivo';
          field?: string | null;
          old_value?: string | null;
          new_value?: string | null;
        };
      };
      attachments: {
        Row: {
          id: string;
          equipment_id: string;
          name: string;
          size: number;
          type: string;
          url: string;
          uploaded_by: string;
          uploaded_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          equipment_id: string;
          name: string;
          size: number;
          type: string;
          url: string;
          uploaded_by: string;
          uploaded_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          equipment_id?: string;
          name?: string;
          size?: number;
          type?: string;
          url?: string;
          uploaded_by?: string;
          uploaded_at?: string;
        };
      };
    };
  };
}