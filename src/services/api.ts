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
        responsibleCPF: string;
        responsibleDepartment: string;
        observations?: string;
        manualSignature: string | null;
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
          responsibleCPF: formData.responsibleCPF,
          responsibleDepartment: formData.responsibleDepartment,
          termDate: new Date().toISOString(),
          status: 'signed',
          observations: formData.observations,
          manualSignature: formData.manualSignature!
        };

        // Criar termo e salvar PDF como anexo
        console.log('💾 Salvando termo e anexando PDF...');
        const term = await responsibilityTermService.createTermWithAttachment(
          termData, 
          pdfBase64
        );
        
        console.log('✅ Termo criado com sucesso!');
        return term;
      } catch (error) {
        console.error('Erro ao criar termo:', error);
        throw error;
      }
    }
  }
};