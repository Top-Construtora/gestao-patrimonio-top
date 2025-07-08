import { supabase } from '../lib/supabase';
import { responsibilityTermService } from './responsabilityTermService';
import { Equipment, ResponsibilityTerm } from '../types';
import jsPDF from 'jspdf';

// Função para gerar PDF real com jsPDF
export const generateTermPDF = (equipment: Equipment, formData: any): string => {
  const doc = new jsPDF();
  
  // Configurações
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  // Título
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMO DE RESPONSABILIDADE', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += lineHeight * 2;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Equipamento de Tecnologia da Informação', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += lineHeight * 3;

  // Seção 1 - Equipamento
  doc.setFont('helvetica', 'bold');
  doc.text('1. IDENTIFICAÇÃO DO EQUIPAMENTO', margin, yPosition);
  yPosition += lineHeight * 1.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const equipmentInfo = [
    `Patrimônio: ${equipment.assetNumber}`,
    `Descrição: ${equipment.description}`,
    `Marca/Modelo: ${equipment.brand} ${equipment.model}`,
    `Localização: ${equipment.location}`,
    `Valor: R$ ${equipment.value.toFixed(2)}`,
    `Data de Aquisição: ${new Date(equipment.acquisitionDate).toLocaleDateString('pt-BR')}`
  ];

  equipmentInfo.forEach(info => {
    doc.text(info, margin, yPosition);
    yPosition += lineHeight;
  });

  if (equipment.specs) {
    doc.text(`Especificações: ${equipment.specs}`, margin, yPosition);
    yPosition += lineHeight;
  }

  yPosition += lineHeight;

  // Seção 2 - Responsável
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. DADOS DO RESPONSÁVEL', margin, yPosition);
  yPosition += lineHeight * 1.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const responsibleInfo = [
    `Nome: ${formData.responsiblePerson}`,
    `CPF: ${formData.responsibleCPF}`,
    `E-mail: ${formData.responsibleEmail}`,
    `Telefone: ${formData.responsiblePhone}`,
    `Departamento: ${formData.responsibleDepartment}`
  ];

  responsibleInfo.forEach(info => {
    doc.text(info, margin, yPosition);
    yPosition += lineHeight;
  });

  yPosition += lineHeight;

  // Seção 3 - Termos
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. TERMOS E CONDIÇÕES', margin, yPosition);
  yPosition += lineHeight * 1.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const termsText = [
    'Pelo presente termo, declaro ter recebido o equipamento acima identificado',
    'em perfeitas condições de uso e conservação, comprometendo-me a:',
    '',
    '• Zelar pela guarda, conservação e bom uso do equipamento;',
    '• Utilizá-lo exclusivamente para atividades profissionais;',
    '• Não realizar alterações sem autorização prévia;',
    '• Comunicar imediatamente qualquer dano ao setor de TI;',
    '• Devolver o equipamento quando solicitado;',
    '• Responder por danos causados por mau uso.'
  ];

  termsText.forEach(line => {
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });

  // Observações
  if (formData.observations) {
    yPosition += lineHeight;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('4. OBSERVAÇÕES', margin, yPosition);
    yPosition += lineHeight * 1.5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(formData.observations, margin, yPosition);
  }

  // Data e local
  yPosition = 250;
  doc.text(`Rio de Janeiro, ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);

  // Converter para Base64
  return doc.output('datauristring').split(',')[1];
};

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

    // Criar e enviar termo
    async createAndSend(
      equipment: Equipment,
      formData: {
        responsiblePerson: string;
        responsibleEmail: string;
        responsiblePhone: string;
        responsibleCPF: string;
        responsibleDepartment: string;
        observations?: string;
      }
    ): Promise<ResponsibilityTerm> {
      try {
        // Gerar PDF real
        console.log('📄 Gerando PDF...');
        const pdfBase64 = generateTermPDF(equipment, formData);

        // Criar dados do termo
        const termData: Omit<ResponsibilityTerm, 'id'> = {
          equipmentId: equipment.id,
          ...formData,
          termDate: new Date().toISOString(),
          status: 'draft'
        };

        // Criar e enviar via Assinafy
        console.log('📤 Enviando para assinatura digital...');
        const term = await responsibilityTermService.createAndSendTerm(termData, pdfBase64);
        
        console.log('✅ Termo enviado com sucesso!');
        return term;
      } catch (error) {
        console.error('❌ Erro ao criar e enviar termo:', error);
        throw error;
      }
    },

    // Verificar status
    async checkStatus(termId: string): Promise<ResponsibilityTerm> {
      try {
        return await responsibilityTermService.checkAndUpdateStatus(termId);
      } catch (error) {
        console.error('Erro ao verificar status:', error);
        throw error;
      }
    }
  }
};

export default api;