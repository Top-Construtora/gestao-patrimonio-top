import { Equipment } from '../types';

export const generateNativePDF = (equipment: Equipment, formData: any): string => {
  // Criar canvas com dimensões A4
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Não foi possível criar contexto do canvas');
    return '';
  }

  // Configurar dimensões A4 em pixels (300 DPI para boa qualidade)
  const dpi = 300;
  const a4Width = 8.27 * dpi; // 210mm em polegadas * DPI
  const a4Height = 11.69 * dpi; // 297mm em polegadas * DPI
  
  canvas.width = a4Width;
  canvas.height = a4Height;
  
  // Fundo branco
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Configurações gerais
  const margin = 0.79 * dpi; // 20mm
  const contentWidth = canvas.width - (margin * 2);
  let y = margin;
  
  // Função para desenhar texto com quebra de linha
  const drawText = (
    text: string, 
    x: number, 
    y: number, 
    maxWidth: number, 
    fontSize: number = 12, 
    bold: boolean = false,
    align: 'left' | 'center' | 'right' = 'left'
  ): number => {
    const lineHeight = fontSize * 1.5;
    ctx.font = `${bold ? 'bold' : 'normal'} ${fontSize * (dpi/72)}px Arial`;
    ctx.fillStyle = '#000000';
    
    // Ajustar x baseado no alinhamento
    if (align === 'center') {
      x = canvas.width / 2;
      ctx.textAlign = 'center';
    } else if (align === 'right') {
      x = canvas.width - margin;
      ctx.textAlign = 'right';
    } else {
      ctx.textAlign = 'left';
    }
    
    // Quebrar texto em linhas
    const words = text.split(' ');
    let line = '';
    let testLine = '';
    let metrics;
    
    for (let i = 0; i < words.length; i++) {
      testLine = line + words[i] + ' ';
      metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, x, y);
        line = words[i] + ' ';
        y += lineHeight * (dpi/72);
      } else {
        line = testLine;
      }
    }
    
    ctx.fillText(line, x, y);
    ctx.textAlign = 'left'; // Resetar alinhamento
    
    return y + lineHeight * (dpi/72);
  };
  
  // Função para desenhar linha
  const drawLine = (x1: number, y1: number, x2: number, y2: number, color: string = '#CCCCCC') => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };
  
  // CABEÇALHO
  y = drawText('TERMO DE RESPONSABILIDADE', margin, y, contentWidth, 22, true, 'center');
  y += 20;
  y = drawText('Equipamento de Tecnologia da Informação', margin, y, contentWidth, 14, false, 'center');
  y += 40;
  
  // Linha separadora
  drawLine(margin, y, canvas.width - margin, y);
  y += 40;
  
  // SEÇÃO 1 - EQUIPAMENTO
  y = drawText('1. IDENTIFICAÇÃO DO EQUIPAMENTO', margin, y, contentWidth, 16, true);
  y += 30;
  
  // Informações do equipamento
  y = drawText(`Patrimônio: ${equipment.assetNumber}`, margin, y, contentWidth, 12);
  y = drawText(`Descrição: ${equipment.description}`, margin, y, contentWidth, 12);
  y = drawText(`Marca/Modelo: ${equipment.brand} ${equipment.model}`, margin, y, contentWidth, 12);
  y = drawText(`Localização: ${equipment.location}`, margin, y, contentWidth, 12);
  y = drawText(`Valor: R$ ${equipment.value.toFixed(2)}`, margin, y, contentWidth, 12);
  y = drawText(`Data de Aquisição: ${new Date(equipment.acquisitionDate).toLocaleDateString('pt-BR')}`, margin, y, contentWidth, 12);
  
  if (equipment.specs) {
    y = drawText(`Especificações: ${equipment.specs}`, margin, y, contentWidth, 12);
  }
  
  y += 40;
  
  // SEÇÃO 2 - RESPONSÁVEL
  y = drawText('2. DADOS DO RESPONSÁVEL', margin, y, contentWidth, 16, true);
  y += 30;
  
  y = drawText(`Nome: ${formData.responsiblePerson}`, margin, y, contentWidth, 12);
  y = drawText(`CPF: ${formData.responsibleCPF}`, margin, y, contentWidth, 12);
  y = drawText(`E-mail: ${formData.responsibleEmail}`, margin, y, contentWidth, 12);
  y = drawText(`Telefone: ${formData.responsiblePhone}`, margin, y, contentWidth, 12);
  y = drawText(`Departamento: ${formData.responsibleDepartment}`, margin, y, contentWidth, 12);
  
  y += 40;
  
  // SEÇÃO 3 - TERMOS
  y = drawText('3. TERMOS E CONDIÇÕES', margin, y, contentWidth, 16, true);
  y += 30;
  
  y = drawText('Pelo presente termo, declaro ter recebido o equipamento acima identificado em perfeitas condições de uso e conservação, comprometendo-me a:', margin, y, contentWidth, 12);
  y += 20;
  
  const termos = [
    '• Zelar pela guarda, conservação e bom uso do equipamento;',
    '• Utilizá-lo exclusivamente para atividades profissionais;',
    '• Não realizar alterações ou modificações sem autorização prévia do setor de TI;',
    '• Comunicar imediatamente qualquer dano, defeito ou extravio ao setor responsável;',
    '• Devolver o equipamento quando solicitado ou ao término do vínculo profissional;',
    '• Responder por danos causados por mau uso, negligência ou extravio.'
  ];
  
  termos.forEach(termo => {
    y = drawText(termo, margin + 20, y, contentWidth - 20, 12);
  });
  
  // SEÇÃO 4 - OBSERVAÇÕES
  if (formData.observations) {
    y += 40;
    y = drawText('4. OBSERVAÇÕES', margin, y, contentWidth, 16, true);
    y += 30;
    y = drawText(formData.observations, margin, y, contentWidth, 12);
  }
  
  // ÁREA DE ASSINATURA
  y = a4Height - (margin * 3);
  
  // Data
  y = drawText(
    `Rio de Janeiro, ${new Date().toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })}`,
    margin,
    y,
    contentWidth,
    12
  );
  
  y += 60;
  
  // Assinatura
  if (formData.manualSignature) {
    try {
      const img = new Image();
      img.onload = function() {
        // Desenhar assinatura
        const signatureWidth = 200 * (dpi/72);
        const signatureHeight = 80 * (dpi/72);
        ctx.drawImage(img, margin, y - signatureHeight, signatureWidth, signatureHeight);
      };
      img.src = formData.manualSignature;
    } catch (error) {
      console.error('Erro ao adicionar assinatura:', error);
    }
  }
  
  // Linha de assinatura
  drawLine(margin, y, margin + (250 * (dpi/72)), y, '#000000');
  y += 20;
  
  // Nome e CPF
  y = drawText(formData.responsiblePerson, margin, y, contentWidth, 12);
  y = drawText(`CPF: ${formData.responsibleCPF}`, margin, y, contentWidth, 12);
  
  // Converter canvas para base64
  try {
    // Reduzir qualidade para diminuir tamanho do arquivo
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    return dataUrl.split(',')[1];
  } catch (error) {
    console.error('Erro ao converter canvas para base64:', error);
    return '';
  }
};