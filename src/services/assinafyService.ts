import { supabase } from '../lib/supabase';

interface AssinafyConfig {
  apiUrl: string;
  useProxy: boolean;
}

// Configuração do Assinafy
const ASSINAFY_CONFIG: AssinafyConfig = {
  apiUrl: import.meta.env.VITE_SUPABASE_URL 
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assinafy-proxy`
    : 'https://api.assinafy.com.br/v1',
  useProxy: true // Usar proxy por padrão devido ao CORS
};

interface AssinafySigner {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  sign_type?: 'sign' | 'approve' | 'acknowledge';
}

interface AssinafyDocument {
  id: string;
  name: string;
  status: string;
  created_at: string;
  signers: Array<{
    id: string;
    name: string;
    email: string;
    signed_at?: string;
    sign_url?: string;
  }>;
  document_url?: string;
  signed_document_url?: string;
}

class AssinafyService {
  private headers: HeadersInit;

  constructor() {
    if (ASSINAFY_CONFIG.useProxy) {
      // Usando proxy - credenciais são enviadas pelo Edge Function
      this.headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      };
    } else {
      // Acesso direto (não funcionará do navegador devido ao CORS)
      this.headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_ASSINAFY_API_KEY}`,
        'X-Organization-Id': import.meta.env.VITE_ASSINAFY_ORG_ID
      };
    }
  }

  // Criar documento no Assinafy
  async createDocument(
    name: string,
    pdfBase64: string,
    signers: AssinafySigner[]
  ): Promise<AssinafyDocument> {
    try {
      console.log('📄 Criando documento no Assinafy...');
      
      const response = await fetch(`${ASSINAFY_CONFIG.apiUrl}/documents`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          name,
          file: pdfBase64,
          file_type: 'pdf',
          signers: signers.map(signer => ({
            ...signer,
            sign_type: signer.sign_type || 'sign',
            cpf: signer.cpf.replace(/[^\d]/g, ''), // Remove formatação
            phone: signer.phone.replace(/[^\d]/g, '') // Remove formatação
          })),
          auto_send: true, // Envia automaticamente após criar
          signature_mode: 'electronic', // Assinatura eletrônica
          lang: 'pt-BR' // Idioma português
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Erro na API Assinafy:', error);
        throw new Error(`Assinafy API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      console.log('✅ Documento criado:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar documento no Assinafy:', error);
      throw error;
    }
  }

  // Enviar documento para assinatura (se auto_send não estiver ativado)
  async sendForSignature(documentId: string, message?: string): Promise<void> {
    try {
      console.log('📧 Enviando documento para assinatura...');
      
      const response = await fetch(
        `${ASSINAFY_CONFIG.apiUrl}/documents/${documentId}/send`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            message: message || 'Por favor, assine o documento anexo.',
            reminder_days: 3 // Lembrete a cada 3 dias
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Assinafy API error: ${response.status} - ${error}`);
      }

      console.log('✅ Documento enviado para assinatura');
    } catch (error) {
      console.error('❌ Erro ao enviar documento:', error);
      throw error;
    }
  }

  // Verificar status do documento
  async getDocumentStatus(documentId: string): Promise<AssinafyDocument> {
    try {
      const response = await fetch(
        `${ASSINAFY_CONFIG.apiUrl}/documents/${documentId}`,
        {
          method: 'GET',
          headers: this.headers
        }
      );

      if (!response.ok) {
        throw new Error(`Assinafy API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao verificar status do documento:', error);
      throw error;
    }
  }

  // Baixar documento assinado
  async downloadSignedDocument(documentId: string): Promise<string> {
    try {
      const response = await fetch(
        `${ASSINAFY_CONFIG.apiUrl}/documents/${documentId}/download`,
        {
          method: 'GET',
          headers: this.headers
        }
      );

      if (!response.ok) {
        throw new Error(`Assinafy API error: ${response.statusText}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Erro ao baixar documento assinado:', error);
      throw error;
    }
  }

  // Cancelar documento
  async cancelDocument(documentId: string, reason?: string): Promise<void> {
    try {
      const response = await fetch(
        `${ASSINAFY_CONFIG.apiUrl}/documents/${documentId}/cancel`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            reason: reason || 'Cancelado pelo usuário'
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Assinafy API error: ${response.statusText}`);
      }

      console.log('✅ Documento cancelado');
    } catch (error) {
      console.error('Erro ao cancelar documento:', error);
      throw error;
    }
  }

  // Reenviar lembrete
  async resendReminder(documentId: string, signerId: string): Promise<void> {
    try {
      const response = await fetch(
        `${ASSINAFY_CONFIG.apiUrl}/documents/${documentId}/signers/${signerId}/resend`,
        {
          method: 'POST',
          headers: this.headers
        }
      );

      if (!response.ok) {
        throw new Error(`Assinafy API error: ${response.statusText}`);
      }

      console.log('✅ Lembrete reenviado');
    } catch (error) {
      console.error('Erro ao reenviar lembrete:', error);
      throw error;
    }
  }
}

export const assinafyService = new AssinafyService();