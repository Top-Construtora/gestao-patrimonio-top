import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

// Função para testar conexão
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('count', { count: 'exact', head: true });
    
    if (error) throw error;
    
    console.log('✅ Supabase conectado com sucesso!');
    return { success: true, count: data };
  } catch (error) {
    console.error('❌ Erro na conexão Supabase:', error);
    return { success: false, error };
  }
};