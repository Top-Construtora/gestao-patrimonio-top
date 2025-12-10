import { supabase } from '../lib/supabase';
import { responsibilityTermService } from '../services/responsabilityTermService';
import { Equipment, ResponsibilityTerm } from '../types';
import { generateNativePDF } from '../services/pdfGenerator';

// API simplificada
export const api = {
  responsibilityTerms: {
    // Listar termos
    async list(equipmentId: string): Promise<ResponsibilityTerm[]> {
      try {
        return await responsibilityTermService.getTermsByEquipment(equipmentId);
      } catch (error) {
        console.error('Erro ao listar termos:', error);
        return [];
      }
    },

    // Criar termo com assinatura manual
    async create(
      equipment: Equipment,
      formData: {
        responsiblePerson: string;
        responsibleEmail: string;
        responsiblePhone: string;
        responsibleDepartment: string;
        observations?: string;
        manualSignature?: string | null;
      }
    ): Promise<ResponsibilityTerm> {
      try {
        // Gerar PDF usando o gerador nativo
        console.log('📄 Gerando PDF do termo...');
        const pdfBase64 = generateNativePDF(equipment, formData);

        if (!pdfBase64) {
          throw new Error('Erro ao gerar PDF');
        }

        // Criar dados do termo
        const termData: Omit<ResponsibilityTerm, 'id'> = {
          equipmentId: equipment.id,
          responsiblePerson: formData.responsiblePerson,
          responsibleEmail: formData.responsibleEmail,
          responsiblePhone: formData.responsiblePhone,
          responsibleDepartment: formData.responsibleDepartment,
          termDate: new Date().toISOString(),
          status: 'signed',
          observations: formData.observations,
          manualSignature: formData.manualSignature || undefined
        };

        // Criar termo e salvar PDF como anexo
        console.log('💾 Salvando termo e anexando PDF...');
        const term = await responsibilityTermService.createTermWithAttachment(
          termData, 
          pdfBase64
        );
        
        // Se há assinatura, anexar o PDF também nos anexos do equipamento
        if (formData.manualSignature && formData.manualSignature.trim() !== '') {
          console.log('📎 Anexando PDF assinado nos anexos do equipamento...');
          try {
            // Importar inventoryService
            const { default: inventoryService } = await import('./inventoryService');
            
            // Converter base64 para File
            const byteCharacters = atob(pdfBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            
            const fileName = `Termo_Responsabilidade_${formData.responsiblePerson.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            const file = new File([byteArray], fileName, { type: 'application/pdf' });
            
            // Anexar nos anexos do equipamento
            await inventoryService.uploadAttachment(
              equipment.id,
              file,
              formData.responsiblePerson
            );
            
            console.log('✅ PDF anexado com sucesso nos anexos do equipamento!');
          } catch (attachError) {
            console.error('⚠️ Erro ao anexar PDF nos anexos do equipamento:', attachError);
            // Não falha se o anexo não funcionar, pois o termo já foi criado
          }
        }
        
        console.log('✅ Termo criado com sucesso!');
        return term;
      } catch (error) {
        console.error('Erro ao criar termo:', error);
        throw error;
      }
    }
  }
};