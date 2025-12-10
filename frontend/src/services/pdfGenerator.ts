import jsPDF from 'jspdf';
import { Equipment } from '../types';

// Tipo para dados do formulário de termo de responsabilidade
export interface ResponsibilityTermFormData {
  responsiblePerson: string;
  responsibleEmail: string;
  responsiblePhone: string;
  responsibleDepartment: string;
  observations?: string;
  manualSignature?: string | null;
}

// Função para gerar PDF usando jsPDF com formato específico da TOP Construtora
export const generateResponsibilityPDF = (
  equipment: Equipment,
  formData: ResponsibilityTermFormData
): jsPDF => {
  const doc = new jsPDF();
  
  // Configurações básicas
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  const maxY = pageHeight - 25; // Margem inferior adequada
  let y = margin;
  
  // Função para verificar quebra de página otimizada
  const checkPageBreak = (height: number = 10): void => {
    if (y + height > maxY) {
      doc.addPage();
      y = margin; // Margem padrão no topo de páginas seguintes
    }
  };
  
  // Função para adicionar texto otimizada para múltiplas páginas
  const addText = (
    text: string,
    x: number,
    yPos: number,
    size: number = 11,
    style: 'normal' | 'bold' = 'normal',
    align: 'left' | 'center' | 'right' = 'left',
    maxWidth?: number
  ): number => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    
    if (maxWidth && text.length > 0) {
      const lines = doc.splitTextToSize(text, maxWidth);
      const lineHeight = 4.8;
      const totalHeight = lines.length * lineHeight;
      
      // Verificar se precisa quebrar página
      const oldY = y;
      checkPageBreak(totalHeight + 3);
      const newPageCreated = y !== oldY;
      
      lines.forEach((line: string, index: number) => {
        doc.text(line, x, y + (index * lineHeight), { align });
      });
      
      // Se nova página foi criada, não adicionar espaço extra
      if (newPageCreated) {
        return y + totalHeight;
      } else {
        return y + totalHeight + 2;
      }
    } else {
      const oldY = y;
      checkPageBreak(6);
      const newPageCreated = y !== oldY;
      
      doc.text(text, x, y, { align });
      
      // Se nova página foi criada, não adicionar espaço extra
      if (newPageCreated) {
        return y + 4;
      } else {
        return y + 6;
      }
    }
  };
  
  // CABEÇALHO
  doc.setTextColor(0, 0, 0);
  y = addText('TERMO DE RESPONSABILIDADE DE USO DE EQUIPAMENTO DE TI', pageWidth / 2, y, 16, 'bold', 'center');
  
  // Linha separadora
  doc.setLineWidth(0.5);
  doc.line(margin, y + 1, pageWidth - margin, y + 1);
  y += 6; // Espaço confortável após linha
  
  // INTRODUÇÃO
  const introducao = `Pelo presente instrumento particular, eu, ${formData.responsiblePerson.toUpperCase()}, colaborador da empresa TOP Construtora e Incorporadora, declaro para os devidos fins que recebi da empresa, em perfeitas condições de uso, os equipamentos abaixo discriminados:`;
  y = addText(introducao, margin, y, 11, 'normal', 'left', contentWidth);
  y += 3; // Espaço entre seções
  
  // 1. EQUIPAMENTOS CEDIDOS
  y = addText('1. Equipamentos Cedidos:', margin, y, 12, 'bold');
  y += 4; // Espaço antes da tabela
  
  // Tabela
  checkPageBreak(50);
  const tableY = y;
  const headerHeight = 12;
  const rowHeight = 25;
  
  // Larguras das colunas (sem Nº Série)
  const colWidths = [15, 90, 45, 35];
  const colX = [
    margin,
    margin + colWidths[0],
    margin + colWidths[0] + colWidths[1],
    margin + colWidths[0] + colWidths[1] + colWidths[2]
  ];
  const totalTableWidth = colWidths.reduce((sum, width) => sum + width, 0);
  
  // Cabeçalho da tabela
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, tableY, totalTableWidth, headerHeight, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(margin, tableY, totalTableWidth, headerHeight);
  
  // Linhas verticais do cabeçalho
  for (let i = 1; i < colX.length; i++) {
    doc.line(colX[i], tableY, colX[i], tableY + headerHeight);
  }
  
  // Texto do cabeçalho
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  
  const headers = ['Item', 'Descrição', 'Nº Patrimônio', 'Situação'];
  headers.forEach((header, index) => {
    const centerX = colX[index] + (colWidths[index] / 2);
    doc.text(header, centerX, tableY + 8, { align: 'center' });
  });
  
  // Linha de dados
  const dataY = tableY + headerHeight;
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, dataY, totalTableWidth, rowHeight, 'F');
  doc.rect(margin, dataY, totalTableWidth, rowHeight);
  
  // Linhas verticais dos dados
  for (let i = 1; i < colX.length; i++) {
    doc.line(colX[i], dataY, colX[i], dataY + rowHeight);
  }
  
  // Preenchimento dos dados
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  // Item
  doc.text('1', colX[0] + (colWidths[0] / 2), dataY + 12, { align: 'center' });
  
  // Descrição
  let textY = dataY + 6;
  const descricao = equipment.description;
  const marca = `Marca/Modelo: ${equipment.brand} ${equipment.model}`;
  
  const descLines = doc.splitTextToSize(descricao, colWidths[1] - 4);
  const marcaLines = doc.splitTextToSize(marca, colWidths[1] - 4);
  
  descLines.forEach((line: string) => {
    if (textY < dataY + rowHeight - 3) {
      doc.text(line, colX[1] + 2, textY);
      textY += 3.5;
    }
  });
  
  if (textY < dataY + rowHeight - 6) {
    textY += 1;
    marcaLines.forEach((line: string) => {
      if (textY < dataY + rowHeight - 3) {
        doc.text(line, colX[1] + 2, textY);
        textY += 3.5;
      }
    });
  }
  
  // Patrimônio e Situação
  doc.text(equipment.assetNumber, colX[2] + (colWidths[2] / 2), dataY + 12, { align: 'center' });
  
  const situacao = equipment.status === 'ativo' ? 'Ativo' : 
                   equipment.status === 'manutenção' ? 'Manutenção' : 'Desativado';
  doc.text(situacao, colX[3] + (colWidths[3] / 2), dataY + 12, { align: 'center' });
  
  y = dataY + rowHeight + 4; // Espaço após tabela
  
  // 2. TERMOS E CONDIÇÕES
  y = addText('2. Termos e Condições:', margin, y, 12, 'bold');
  y += 2; // Espaço após título
  
  const termos = [
    'Comprometo-me a zelar pela conservação e bom uso dos equipamentos acima descritos, utilizando-os exclusivamente para fins profissionais e atividades relacionadas à minha função.',
    'Reconheço que não é permitida a transferência dos equipamentos a terceiros.',
    'Em caso de extravio, perda, furto, roubo, mau uso ou danos causados por negligência ou imprudência, comprometo-me a ressarcir a empresa pelos prejuízos, conforme apuração interna.',
    'Comprometo-me a devolver os equipamentos à empresa nas mesmas condições em que os recebi, exceto pelo desgaste natural de uso, quando solicitado ou no encerramento do vínculo contratual.',
    'Estou ciente de que os equipamentos podem conter dados confidenciais da empresa e, portanto, não devo compartilhar ou copiar qualquer informação neles contida sem autorização expressa.'
  ];
  
  termos.forEach((termo, index) => {
    const paragrafo = `${index + 1}. ${termo}`;
    y = addText(paragrafo, margin, y, 11, 'normal', 'left', contentWidth);
  });
  
  // 3. DECLARAÇÃO
  y += 3; // Espaço entre seções
  y = addText('3. Declaração:', margin, y, 12, 'bold');
  y += 2; // Espaço após título
  
  const declaracao = 'Declaro estar ciente e de acordo com todas as cláusulas acima, assumindo total responsabilidade pelos equipamentos ora cedidos, conforme especificado neste termo.';
  y = addText(declaracao, margin, y, 11, 'normal', 'left', contentWidth);
  
  // 4. PENALIDADES E SANÇÕES
  y += 3; // Espaço entre seções
  y = addText('4. Penalidades e Sanções:', margin, y, 12, 'bold');
  y += 2; // Espaço após título
  
  const penalidades = [
    'Em caso de uso inadequado dos equipamentos, o colaborador estará sujeito às sanções disciplinares previstas no Código de Conduta da empresa.',
    'Danos intencionais aos equipamentos serão considerados como ato de má-fé e poderão gerar as penalidades cabíveis.'
  ];
  
  penalidades.forEach((penalidade, index) => {
    const paragrafo = `${index + 1}. ${penalidade}`;
    y = addText(paragrafo, margin, y, 11, 'normal', 'left', contentWidth);
  });
  
  // 5. VIGÊNCIA E ALTERAÇÕES
  y += 3; // Espaço entre seções
  y = addText('5. Vigência e Alterações:', margin, y, 12, 'bold');
  y += 2; // Espaço após título
  
  const vigencia = 'Este termo entra em vigor na data de sua assinatura e permanece válido durante todo o período em que o colaborador mantiver a posse dos equipamentos descritos. Qualquer alteração deste documento deverá ser feita por escrito e assinada por ambas as partes.';
  y = addText(vigencia, margin, y, 11, 'normal', 'left', contentWidth);
  
  // 6. DISPOSIÇÕES GERAIS
  y += 3; // Espaço entre seções
  y = addText('6. Disposições Gerais:', margin, y, 12, 'bold');
  y += 2; // Espaço após título
  
  const disposicoes = [
    'Este termo está sujeito às leis brasileiras em vigor e aos regulamentos internos da TOP Construtora e Incorporadora.',
    'Eventuais dúvidas sobre este documento deverão ser esclarecidas junto ao departamento de Recursos Humanos ou TI.',
  ];
  
  disposicoes.forEach((disposicao, index) => {
    const paragrafo = `${index + 1}. ${disposicao}`;
    y = addText(paragrafo, margin, y, 11, 'normal', 'left', contentWidth);
  });
  
  // 7. OBSERVAÇÕES (se houver)
  if (formData.observations?.trim()) {
    y += 3; // Espaço entre seções
    y = addText('7. Observações Específicas:', margin, y, 12, 'bold');
    y += 2; // Espaço após título
    y = addText(formData.observations, margin, y, 11, 'normal', 'left', contentWidth);
  }
  
  // ÁREA DE ASSINATURA
  const signatureHeight = 60;
  
  if (y + signatureHeight > maxY) {
    doc.addPage();
    y = margin; // Margem padrão em nova página
  } else {
    y = y + 10; // Espaço confortável antes da assinatura
  }
  
  // Local e data
  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  });
  
  y = addText(`Goiânia, ${dataFormatada}.`, margin, y, 11);
  y += 4;
  
  // Assinatura digital (se houver) - inserção automática
  if (formData.manualSignature && formData.manualSignature.trim() !== '') {
    try {
      // Verificar se é uma assinatura válida (data URI)
      if (formData.manualSignature.startsWith('data:image/')) {
        const imgWidth = 100;
        const imgHeight = 25;
        const imgX = (pageWidth - imgWidth) / 2;
        
        // Adicionar a assinatura automaticamente
        doc.addImage(formData.manualSignature, 'PNG', imgX, y, imgWidth, imgHeight);
        y += imgHeight + 2;
      }
    } catch (error) {
      console.error('Erro ao adicionar assinatura automaticamente:', error);
      // Se falhar, continua sem a assinatura
    }
  }
  
  // Linha para assinatura manual (sempre presente)
  const lineWidth = 120;
  const lineX = (pageWidth - lineWidth) / 2;
  
  // Se não há assinatura digital, adicionar espaço e linha para assinatura manual
  if (!formData.manualSignature || formData.manualSignature.trim() === '') {
    y += 15; // Espaço para assinatura manual
  }
  
  doc.setLineWidth(1);
  doc.setDrawColor(0, 0, 0);
  doc.line(lineX, y, lineX + lineWidth, y);
  
  // Nome do colaborador
  y += 6;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(formData.responsiblePerson.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  
  // Departamento
  y += 5;
  doc.setFontSize(10);
  doc.text(formData.responsibleDepartment, pageWidth / 2, y, { align: 'center' });
  
  // Label
  y += 4;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Assinatura do Colaborador', pageWidth / 2, y, { align: 'center' });
  
  return doc;
};

// Função para baixar o PDF
export const downloadResponsibilityPDF = (
  equipment: Equipment,
  formData: {
    responsiblePerson: string;
    responsibleEmail: string;
    responsiblePhone: string;
    responsibleDepartment: string;
    observations?: string;
    manualSignature?: string | null;
  }
): void => {
  try {
    const doc = generateResponsibilityPDF(equipment, formData);
    const fileName = `Termo_Responsabilidade_${equipment.assetNumber}_${formData.responsiblePerson.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Erro ao baixar PDF:', error);
    throw new Error('Erro ao gerar o arquivo PDF');
  }
};

// Função para gerar PDF como base64 (para compatibilidade com código existente)
export const generateNativePDF = (equipment: Equipment, formData: ResponsibilityTermFormData): string => {
  try {
    const doc = generateResponsibilityPDF(equipment, formData);
    return doc.output('datauristring').split(',')[1];
  } catch (error) {
    console.error('Erro ao gerar PDF como base64:', error);
    return '';
  }
};