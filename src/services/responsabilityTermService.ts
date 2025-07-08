import { supabase } from '../lib/supabase';
import { ResponsibilityTerm } from '../types';
import { assinafyService } from './assinafyService';

// Transformar dados do banco para aplicação
const transformResponsibilityTerm = (dbTerm: any): ResponsibilityTerm => ({
  id: dbTerm.id,
  equipmentId: dbTerm.equipment_id,
  responsiblePerson: dbTerm.responsible_person,
  responsibleEmail: dbTerm.responsible_email,
  responsiblePhone: dbTerm.responsible_phone,
  responsibleCPF: dbTerm.responsible_cpf,
  responsibleDepartment: dbTerm.responsible_department,
  termDate: dbTerm.term_date,
  status: dbTerm.status,
  observations: dbTerm.observations || undefined,
  assinafyDocumentId: dbTerm.assinafy_document_id || undefined,
  assinafySignerId: dbTerm.assinafy_signer_id || undefined,
  assinafySignedAt: dbTerm.assinafy_signed_at || undefined,
  pdfUrl: dbTerm.pdf_url || undefined,
  signedPdfUrl: dbTerm.signed_pdf_url || undefined
});

class ResponsibilityTermService {
  // Criar termo
  async createTerm(termData: Omit<ResponsibilityTerm, 'id'>): Promise<ResponsibilityTerm> {
    try {
      const { data, error } = await supabase
        .from('responsibility_terms')
        .insert({
          equipment_id: termData.equipmentId,
          responsible_person: termData.responsiblePerson,
          responsible_email: termData.responsibleEmail,
          responsible_phone: termData.responsiblePhone,
          responsible_cpf: termData.responsibleCPF,
          responsible_department: termData.responsibleDepartment,
          term_date: termData.termDate,
          status: 'draft',
          observations: termData.observations || null
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error('Erro ao criar termo');
      }

      // Registrar no histórico
      await supabase.from('history_entries').insert({
        equipment_id: termData.equipmentId,
        timestamp: new Date().toISOString(),
        user_name: termData.responsiblePerson,
        change_type: 'criou',
        field: 'termo_responsabilidade',
        new_value: 'Termo de responsabilidade criado'
      });

      return transformResponsibilityTerm(data);
    } catch (error) {
      console.error('Erro ao criar termo:', error);
      throw error;
    }
  }

  // Listar termos por equipamento
  async getTermsByEquipment(equipmentId: string): Promise<ResponsibilityTerm[]> {
    try {
      const { data, error } = await supabase
        .from('responsibility_terms')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error('Erro ao buscar termos');
      }

      return data ? data.map(transformResponsibilityTerm) : [];
    } catch (error) {
      console.error('Erro ao buscar termos:', error);
      throw error;
    }
  }

  // Atualizar termo
  async updateTerm(
    termId: string,
    updates: Partial<ResponsibilityTerm>
  ): Promise<ResponsibilityTerm> {
    try {
      const updateData: any = {};

      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.assinafyDocumentId !== undefined) {
        updateData.assinafy_document_id = updates.assinafyDocumentId;
      }
      if (updates.assinafySignerId !== undefined) {
        updateData.assinafy_signer_id = updates.assinafySignerId;
      }
      if (updates.assinafySignedAt !== undefined) {
        updateData.assinafy_signed_at = updates.assinafySignedAt;
      }
      if (updates.pdfUrl !== undefined) updateData.pdf_url = updates.pdfUrl;
      if (updates.signedPdfUrl !== undefined) {
        updateData.signed_pdf_url = updates.signedPdfUrl;
      }

      const { data, error } = await supabase
        .from('responsibility_terms')
        .update(updateData)
        .eq('id', termId)
        .select()
        .single();

      if (error || !data) {
        throw new Error('Erro ao atualizar termo');
      }

      return transformResponsibilityTerm(data);
    } catch (error) {
      console.error('Erro ao atualizar termo:', error);
      throw error;
    }
  }

  // Criar e enviar termo via Assinafy (INTEGRAÇÃO REAL)
  async createAndSendTerm(
    termData: Omit<ResponsibilityTerm, 'id'>,
    pdfBase64: string
  ): Promise<ResponsibilityTerm> {
    try {
      // 1. Criar termo no banco
      console.log('1️⃣ Criando termo no banco de dados...');
      const createdTerm = await this.createTerm(termData);

      try {
        // 2. Criar documento no Assinafy
        console.log('2️⃣ Enviando para Assinafy...');
        const assinafyDoc = await assinafyService.createDocument(
          `Termo de Responsabilidade - ${termData.responsiblePerson}`,
          pdfBase64,
          [{
            name: termData.responsiblePerson,
            email: termData.responsibleEmail,
            cpf: termData.responsibleCPF.replace(/[^\d]/g, ''),
            phone: termData.responsiblePhone.replace(/[^\d]/g, '')
          }]
        );

        console.log('3️⃣ Documento criado no Assinafy:', assinafyDoc.id);

        // 3. Atualizar termo com dados do Assinafy
        const updatedTerm = await this.updateTerm(createdTerm.id, {
          status: 'sent',
          assinafyDocumentId: assinafyDoc.id,
          assinafySignerId: assinafyDoc.signers[0]?.id,
          pdfUrl: assinafyDoc.document_url
        });

        console.log('✅ Termo enviado com sucesso!');
        console.log('📧 Email enviado para:', termData.responsibleEmail);
        
        return updatedTerm;
      } catch (assinafyError) {
        // Se falhar no Assinafy, ainda temos o termo criado no banco
        console.error('Erro no Assinafy, mas termo foi salvo:', assinafyError);
        
        // Atualizar termo com status de erro
        await this.updateTerm(createdTerm.id, {
          status: 'draft',
          observations: 'Erro ao enviar para assinatura digital. Tente novamente.'
        });
        
        throw assinafyError;
      }
    } catch (error) {
      console.error('Erro ao criar e enviar termo:', error);
      throw error;
    }
  }

  // Verificar e atualizar status
  async checkAndUpdateStatus(termId: string): Promise<ResponsibilityTerm> {
    try {
      // 1. Buscar termo no banco
      const { data: termData } = await supabase
        .from('responsibility_terms')
        .select('*')
        .eq('id', termId)
        .single();

      if (!termData) {
        throw new Error('Termo não encontrado');
      }

      // 2. Se tem documento no Assinafy, verificar status
      if (termData.assinafy_document_id) {
        try {
          console.log('🔍 Verificando status no Assinafy...');
          const assinafyDoc = await assinafyService.getDocumentStatus(
            termData.assinafy_document_id
          );

          // 3. Verificar se foi assinado
          const signer = assinafyDoc.signers[0];
          if (signer?.signed_at && termData.status !== 'signed') {
            console.log('✅ Documento foi assinado!');
            
            // Atualizar termo
            const updatedTerm = await this.updateTerm(termId, {
              status: 'signed',
              assinafySignedAt: signer.signed_at,
              signedPdfUrl: assinafyDoc.signed_document_url
            });

            // Registrar no histórico
            await supabase.from('history_entries').insert({
              equipment_id: termData.equipment_id,
              timestamp: new Date().toISOString(),
              user_name: termData.responsible_person,
              change_type: 'editou',
              field: 'termo_responsabilidade',
              old_value: 'Aguardando assinatura',
              new_value: 'Assinado digitalmente'
            });

            return transformResponsibilityTerm(updatedTerm);
          }
        } catch (error) {
          console.error('Erro ao verificar status no Assinafy:', error);
        }
      }

      return transformResponsibilityTerm(termData);
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      throw error;
    }
  }
}

// IMPORTANTE: Exportar uma instância da classe
export const responsibilityTermService = new ResponsibilityTermService();

// Também exportar a classe se necessário
export default ResponsibilityTermService;