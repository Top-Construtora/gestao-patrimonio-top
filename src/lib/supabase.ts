// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log para debug (remover em produção)
console.log('Environment:', import.meta.env.MODE);
console.log('Supabase URL from env:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

// Se não houver variáveis de ambiente, mostrar aviso claro
if (!supabaseUrl || supabaseUrl === 'undefined') {
  console.warn('⚠️ SUPABASE URL NÃO CONFIGURADA!');
  console.warn('Se estiver no Vercel, configure as variáveis de ambiente no painel do Vercel');
  console.warn('Se estiver local, verifique o arquivo .env');
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
}

// Usar valores padrão se não houver variáveis configuradas
const DEFAULT_SUPABASE_URL = 'https://lifjznuqcyobfaqeftcl.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZmp6bnVxY3lvYmZhcWVmdGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNjUzMjQsImV4cCI6MjA2Mzk0MTMyNH0.ck-GTaGfCwb5BjlgubYhHXkm-hwGI7_ywgpMn40c_yQ';

// Criar cliente com fallback para valores padrão
export const supabase = createClient(
  supabaseUrl || DEFAULT_SUPABASE_URL, 
  supabaseAnonKey || DEFAULT_SUPABASE_KEY, 
  {
    auth: {
      persistSession: false
    },
    global: {
      headers: {
        'x-my-custom-header': 'inventory-system'
      }
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Função para testar conexão
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase test connection error:', error);
      return { connected: false, error };
    }
    
    console.log('Supabase connection successful');
    return { connected: true, error: null };
  } catch (error) {
    console.error('Supabase test connection failed:', error);
    return { connected: false, error };
  }
};