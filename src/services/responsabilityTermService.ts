// src/services/responsibilityTermService.ts - Versão simplificada sem Assinafy
import { supabase } from '../lib/supabase';
import { ResponsibilityTerm } from '../types';

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
  status: dbTerm.status || 'signed',
  observations: dbTerm.observations || undefined,
  manualSignature: dbTerm.manual_signature,
  pdfUrl: dbTerm.pdf_url || undefined
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
          status: 'signed',
          observations: termData.observations || null,
          manual_signature: termData.manualSignature
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
        new_value: 'Termo de responsabilidade assinado'
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

  // Criar termo e salvar PDF como anexo
  async createTermWithAttachment(
    termData: Omit<ResponsibilityTerm, 'id'>,
    pdfBase64: string
  ): Promise<ResponsibilityTerm> {
    try {
      // 1. Criar termo no banco
      console.log('1️⃣ Criando termo no banco de dados...');
      const createdTerm = await this.createTerm(termData);

      // 2. Salvar PDF como anexo do equipamento
      console.log('2️⃣ Salvando PDF como anexo...');
      const pdfUrl = await this.savePdfAsAttachment(
        termData.equipmentId,
        pdfBase64,
        `Termo_Responsabilidade_${termData.responsiblePerson.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        termData.responsiblePerson
      );

      // 3. Atualizar termo com URL do PDF
      if (pdfUrl) {
        const { data, error } = await supabase
          .from('responsibility_terms')
          .update({ pdf_url: pdfUrl })
          .eq('id', createdTerm.id)
          .select()
          .single();

        if (data) {
          return transformResponsibilityTerm(data);
        }
      }

      return createdTerm;
    } catch (error) {
      console.error('Erro ao criar termo com anexo:', error);
      throw error;
    }
  }

  // Salvar PDF como anexo
  private async savePdfAsAttachment(
    equipmentId: string,
    pdfBase64: string,
    fileName: string,
    uploadedBy: string
  ): Promise<string | null> {
    try {
      // Converter base64 para blob
      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      
      // Determinar o tipo MIME baseado no conteúdo
      // Se começar com 0xFF 0xD8 é JPEG, senão assume PDF
      const isJPEG = byteArray[0] === 0xFF && byteArray[1] === 0xD8;
      const mimeType = isJPEG ? 'image/jpeg' : 'application/pdf';
      const fileExtension = isJPEG ? '.jpg' : '.pdf';
      
      // Ajustar o nome do arquivo
      const finalFileName = fileName.replace('.pdf', fileExtension);
      
      const blob = new Blob([byteArray], { type: mimeType });

      // Gerar caminho único para o arquivo
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const filePath = `${equipmentId}/${timestamp}_${randomString}_${finalFileName}`;

      // Upload para o storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('equipment-attachments')
        .upload(filePath, blob, {
          contentType: mimeType,
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Criar registro do anexo
      const { error: dbError } = await supabase
        .from('attachments')
        .insert({
          equipment_id: equipmentId,
          file_name: finalFileName,
          file_size: byteArray.length,
          file_type: mimeType,
          file_path: filePath,
          uploaded_by: uploadedBy,
          uploaded_at: new Date().toISOString()
        });

      if (dbError) {
        // Se falhar ao criar registro, deletar arquivo do storage
        await supabase.storage
          .from('equipment-attachments')
          .remove([filePath]);
        throw dbError;
      }

      // Retornar URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('equipment-attachments')
        .getPublicUrl(filePath);

      console.log('✅ Documento salvo como anexo:', finalFileName);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Erro ao salvar documento como anexo:', error);
      return null;
    }
  }
}

// Exportar instância única
export const responsibilityTermService = new ResponsibilityTermService();
export default ResponsibilityTermService;