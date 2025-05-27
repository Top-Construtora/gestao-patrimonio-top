// src/services/inventoryService.ts - Versão MOCK para desenvolvimento
import { Equipment, HistoryEntry, Attachment } from '../types';

// Dados de exemplo em memória
let mockEquipment: Equipment[] = [
  {
    id: '1',
    assetNumber: 'COMP-001',
    description: 'Desktop Dell OptiPlex 7090',
    brand: 'Dell',
    model: 'OptiPlex 7090',
    specs: 'Intel Core i7-11700, 16GB RAM, SSD 512GB',
    status: 'ativo',
    location: 'Escritório Principal - TI',
    responsible: 'João Silva',
    acquisitionDate: '2023-01-15',
    value: 3500.00
  },
  {
    id: '2',
    assetNumber: 'NOT-001',
    description: 'Notebook Lenovo ThinkPad T14',
    brand: 'Lenovo',
    model: 'ThinkPad T14',
    specs: 'Intel Core i5-11th Gen, 8GB RAM, SSD 256GB',
    status: 'ativo',
    location: 'Obra Centro - Escritório',
    responsible: 'Maria Santos',
    acquisitionDate: '2023-03-20',
    value: 4200.00
  },
  {
    id: '3',
    assetNumber: 'SRV-001',
    description: 'Servidor HP ProLiant DL360',
    brand: 'HP',
    model: 'ProLiant DL360 Gen10',
    specs: 'Intel Xeon Silver 4214, 32GB RAM, 2x 1TB SAS',
    status: 'ativo',
    location: 'Escritório Principal - Data Center',
    responsible: 'Carlos Tech',
    acquisitionDate: '2022-11-10',
    value: 15000.00
  },
  {
    id: '4',
    assetNumber: 'TAB-001',
    description: 'Tablet Samsung Galaxy Tab S8',
    brand: 'Samsung',
    model: 'Galaxy Tab S8',
    specs: '11 polegadas, 128GB, WiFi + 4G',
    status: 'manutenção',
    location: 'Obra Norte - Campo',
    responsible: 'Ana Oliveira',
    acquisitionDate: '2023-06-05',
    value: 2800.00
  },
  {
    id: '5',
    assetNumber: 'MON-001',
    description: 'Monitor LG UltraWide 34"',
    brand: 'LG',
    model: '34WN80C-B',
    specs: '34 polegadas, 3440x1440, USB-C',
    status: 'ativo',
    location: 'Escritório Principal - Design',
    responsible: 'Pedro Costa',
    acquisitionDate: '2023-02-28',
    value: 1800.00
  }
];

let mockHistory: HistoryEntry[] = [
  {
    id: 'h1',
    equipmentId: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min atrás
    user: 'João Silva',
    changeType: 'criou'
  },
  {
    id: 'h2',
    equipmentId: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h atrás
    user: 'Maria Santos',
    changeType: 'editou',
    field: 'location',
    oldValue: 'Escritório Principal',
    newValue: 'Obra Centro - Escritório'
  },
  {
    id: 'h3',
    equipmentId: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6h atrás
    user: 'Carlos Tech',
    changeType: 'editou',
    field: 'status',
    oldValue: 'ativo',
    newValue: 'manutenção'
  },
  {
    id: 'h4',
    equipmentId: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
    user: 'Administrador',
    changeType: 'criou'
  },
  {
    id: 'h5',
    equipmentId: '5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 dias atrás
    user: 'Pedro Costa',
    changeType: 'criou'
  }
];

let mockAttachments: Attachment[] = [
  {
    id: 'att1',
    equipmentId: '1',
    name: 'nota_fiscal_dell.pdf',
    size: 2048576, // 2MB
    type: 'application/pdf',
    url: '#',
    uploadedBy: 'João Silva',
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 'att2',
    equipmentId: '2',
    name: 'manual_thinkpad.pdf',
    size: 5242880, // 5MB
    type: 'application/pdf',
    url: '#',
    uploadedBy: 'Maria Santos',
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  }
];

// Simular delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const inventoryService = {
  // Obter todos os equipamentos
  getAllEquipment: async (): Promise<Equipment[]> => {
    await delay(300); // Simula delay da rede
    console.log('📦 Carregando equipamentos (MOCK)');
    return [...mockEquipment];
  },

  // Obter equipamento por ID
  getEquipmentById: async (id: string): Promise<Equipment | null> => {
    await delay(200);
    console.log(`🔍 Buscando equipamento ${id} (MOCK)`);
    return mockEquipment.find(eq => eq.id === id) || null;
  },

  // Criar novo equipamento
  createEquipment: async (
    equipmentData: Omit<Equipment, 'id'>, 
    user: string, 
    attachmentFiles?: File[]
  ): Promise<Equipment> => {
    await delay(500);
    
    const newEquipment: Equipment = {
      ...equipmentData,
      id: Date.now().toString() // ID simples para mock
    };
    
    mockEquipment.unshift(newEquipment);
    
    // Adicionar ao histórico
    const historyEntry: HistoryEntry = {
      id: `h${Date.now()}`,
      equipmentId: newEquipment.id,
      timestamp: new Date().toISOString(),
      user,
      changeType: 'criou'
    };
    mockHistory.unshift(historyEntry);
    
    console.log('✅ Equipamento criado (MOCK):', newEquipment.assetNumber);
    return newEquipment;
  },

  // Atualizar equipamento
  updateEquipment: async (
    id: string, 
    updates: Partial<Equipment>, 
    user: string
  ): Promise<Equipment> => {
    await delay(400);
    
    const equipmentIndex = mockEquipment.findIndex(eq => eq.id === id);
    if (equipmentIndex === -1) {
      throw new Error('Equipamento não encontrado');
    }
    
    const currentEquipment = mockEquipment[equipmentIndex];
    const updatedEquipment = { ...currentEquipment, ...updates };
    mockEquipment[equipmentIndex] = updatedEquipment;
    
    // Adicionar entradas de histórico para cada campo alterado
    Object.entries(updates).forEach(([key, newValue]) => {
      if (key === 'id') return;
      
      const oldValue = currentEquipment[key as keyof Equipment];
      if (oldValue !== newValue) {
        const historyEntry: HistoryEntry = {
          id: `h${Date.now()}_${key}`,
          equipmentId: id,
          timestamp: new Date().toISOString(),
          user,
          changeType: 'editou',
          field: key,
          oldValue: String(oldValue),
          newValue: String(newValue)
        };
        mockHistory.unshift(historyEntry);
      }
    });
    
    console.log('📝 Equipamento atualizado (MOCK):', updatedEquipment.assetNumber);
    return updatedEquipment;
  },

  // Excluir equipamento
  deleteEquipment: async (id: string, user: string): Promise<void> => {
    await delay(300);
    
    const equipmentIndex = mockEquipment.findIndex(eq => eq.id === id);
    if (equipmentIndex === -1) {
      throw new Error('Equipamento não encontrado');
    }
    
    const equipment = mockEquipment[equipmentIndex];
    
    // Adicionar ao histórico antes de excluir
    const historyEntry: HistoryEntry = {
      id: `h${Date.now()}`,
      equipmentId: id,
      timestamp: new Date().toISOString(),
      user,
      changeType: 'excluiu',
      oldValue: equipment.assetNumber
    };
    mockHistory.unshift(historyEntry);
    
    // Remover equipamento
    mockEquipment.splice(equipmentIndex, 1);
    
    // Remover anexos relacionados
    mockAttachments = mockAttachments.filter(att => att.equipmentId !== id);
    
    console.log('🗑️ Equipamento excluído (MOCK):', equipment.assetNumber);
  },

  // Obter atividades recentes
  getRecentActivities: async (limit: number = 10): Promise<HistoryEntry[]> => {
    await delay(200);
    console.log('📊 Carregando atividades recentes (MOCK)');
    return mockHistory.slice(0, limit);
  },

  // Obter histórico de um equipamento
  getEquipmentHistory: async (equipmentId: string): Promise<HistoryEntry[]> => {
    await delay(200);
    console.log(`📋 Carregando histórico do equipamento ${equipmentId} (MOCK)`);
    return mockHistory.filter(entry => entry.equipmentId === equipmentId);
  },

  // Obter anexos de um equipamento
  getEquipmentAttachments: async (equipmentId: string): Promise<Attachment[]> => {
    await delay(200);
    console.log(`📎 Carregando anexos do equipamento ${equipmentId} (MOCK)`);
    return mockAttachments.filter(att => att.equipmentId === equipmentId);
  },

  // Upload de anexo
  uploadAttachment: async (
    equipmentId: string, 
    file: File, 
    user: string
  ): Promise<Attachment> => {
    await delay(800); // Simula upload mais lento
    
    const attachment: Attachment = {
      id: Date.now().toString(),
      equipmentId,
      name: file.name,
      size: file.size,
      type: file.type,
      url: `#${file.name}`, // URL simulada
      uploadedBy: user,
      uploadedAt: new Date().toISOString()
    };
    
    mockAttachments.push(attachment);
    
    // Adicionar ao histórico
    const historyEntry: HistoryEntry = {
      id: `h${Date.now()}`,
      equipmentId,
      timestamp: new Date().toISOString(),
      user,
      changeType: 'anexou arquivo',
      newValue: file.name
    };
    mockHistory.unshift(historyEntry);
    
    console.log('📤 Anexo enviado (MOCK):', file.name);
    return attachment;
  },

  // Excluir anexo
  deleteAttachment: async (attachmentId: string, user: string): Promise<void> => {
    await delay(200);
    
    const attachmentIndex = mockAttachments.findIndex(att => att.id === attachmentId);
    if (attachmentIndex === -1) {
      throw new Error('Anexo não encontrado');
    }
    
    const attachment = mockAttachments[attachmentIndex];
    mockAttachments.splice(attachmentIndex, 1);
    
    // Adicionar ao histórico
    const historyEntry: HistoryEntry = {
      id: `h${Date.now()}`,
      equipmentId: attachment.equipmentId,
      timestamp: new Date().toISOString(),
      user,
      changeType: 'removeu arquivo',
      oldValue: attachment.name
    };
    mockHistory.unshift(historyEntry);
    
    console.log('🗑️ Anexo excluído (MOCK):', attachment.name);
  },

  // Download de anexo
  downloadAttachment: async (attachment: Attachment): Promise<void> => {
    await delay(100);
    console.log('📥 Download simulado (MOCK):', attachment.name);
    
    // Simular download
    const link = document.createElement('a');
    link.href = 'data:text/plain,Este é um arquivo de exemplo simulado';
    link.download = attachment.name;
    link.click();
  },

  // Popular com dados de exemplo
  populateSampleData: async (user: string): Promise<void> => {
    await delay(100);
    console.log('📋 Dados de exemplo já carregados (MOCK)');
    // Os dados já estão carregados no mock
  }
};

console.log('🚀 Inventory Service carregado em modo MOCK');
console.log('📊 Equipamentos disponíveis:', mockEquipment.length);

export default inventoryService;