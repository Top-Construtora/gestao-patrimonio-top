import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/EquipmentList';
import EquipmentDetailsPage from './pages/EquipmentDetailsPage';
import AddEquipment from './pages/AddEquipment';
import EditEquipment from './pages/EditEquipment';
import Reports from './pages/Reports';
import EquipmentPurchaseList from './pages/EquipmentPurchaseList';
import AddEquipmentPurchase from './pages/AddEquipmentPurchase';
import PurchaseToEquipmentModal from './components/purchases/PurchaseToEquipmentModal';
import { useToast } from './components/common/Toast';
import Toast from './components/common/Toast';
import DeleteConfirmationModal from './components/common/DeleteConfirmationModal';
import { Equipment, HistoryEntry } from './types';
import { EquipmentPurchase } from './types/purchaseTypes';
import inventoryService from './services/inventoryService';
import purchaseService from './services/purchaseService';
import { Wifi, WifiOff } from 'lucide-react';

// Tipos para rotas
type RouteType = 'dashboard' | 'equipment' | 'equipment-details' | 'add-equipment' | 'edit-equipment' | 
                 'reports' | 'inventory' | 'construction' | 'purchases' | 'add-purchase' | 
                 'edit-purchase' | 'purchase-details';

function App() {
  // Estados principais
  const [route, setRoute] = useState<RouteType>('dashboard');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [purchases, setPurchases] = useState<EquipmentPurchase[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  
  // Estados de UI
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(null);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [purchaseToConvert, setPurchaseToConvert] = useState<EquipmentPurchase | null>(null);
  
  // Hook de Toast
  const { showSuccess, showError, showInfo, showWarning, toasts } = useToast();
  
  // Dados do usuário
  const currentUser = 'Administrador';

  // Monitorar conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showSuccess('Conexão restaurada');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      showError('Sem conexão com a internet');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showSuccess, showError]);

  // Inicialização - Carregamento de dados
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsInitializing(true);
        
        // Verificar conexão
        const isOnline = await inventoryService.checkConnection();
        setIsOnline(isOnline);
        
        if (!isOnline) {
          showWarning('Sistema operando offline. Algumas funcionalidades podem estar limitadas.');
        }
        
        // Carregar dados de equipamentos e histórico primeiro
        const [equipmentData, historyData] = await Promise.all([
          inventoryService.getAllEquipment(),
          inventoryService.getRecentActivities(10)
        ]);
        
        setEquipment(equipmentData);
        setHistory(historyData);
        
        // Tentar carregar dados de compras separadamente para tratar erro de tabela inexistente
        try {
          const purchaseData = await purchaseService.getAllPurchases();
          setPurchases(purchaseData);
          console.log(`🛒 ${purchaseData.length} solicitações de compra carregadas`);
        } catch (purchaseError: any) {
          if (purchaseError.message?.includes('relation "public.equipment_purchases" does not exist')) {
            console.warn('⚠️ Tabela equipment_purchases não encontrada. Execute a migração SQL no Supabase.');
            setPurchases([]);
            // Não mostrar erro durante a inicialização
          } else {
            console.error('❌ Erro ao carregar solicitações:', purchaseError);
          }
        }
        
        // Log de sucesso
        console.log('✅ Sistema carregado com sucesso');
        console.log(`📦 ${equipmentData.length} equipamentos carregados`);
        console.log(`📋 ${historyData.length} atividades recentes`);
        
      } catch (error) {
        console.error('❌ Erro ao inicializar:', error);
        showError('Erro ao carregar dados iniciais');
      } finally {
        setIsInitializing(false);
      }
    };
    
    loadData();
  }, []); // Remover dependências para executar apenas uma vez

  // Funções auxiliares
  const loadPurchases = useCallback(async () => {
    try {
      const purchaseData = await purchaseService.getAllPurchases();
      setPurchases(purchaseData);
    } catch (error) {
      console.error('❌ Erro ao carregar solicitações:', error);
      showError('Erro ao carregar solicitações de compra');
    }
  }, [showError]);

  // Handlers de navegação
  const handleViewDetails = useCallback((id: string) => {
    setSelectedEquipmentId(id);
    setRoute('equipment-details');
  }, []);

  const handleEditEquipment = useCallback((id: string) => {
    setSelectedEquipmentId(id);
    setRoute('edit-equipment');
  }, []);

  const handleStartDelete = useCallback((id: string) => {
    setEquipmentToDelete(id);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!equipmentToDelete) return;
    
    try {
      await inventoryService.deleteEquipment(equipmentToDelete, currentUser);
      
      const [updatedEquipment, updatedHistory] = await Promise.all([
        inventoryService.getAllEquipment(),
        inventoryService.getRecentActivities(10)
      ]);
      
      setEquipment(updatedEquipment);
      setHistory(updatedHistory);
      
      showSuccess('Equipamento excluído com sucesso!');
      
      if (route === 'equipment-details') {
        setRoute('equipment');
      }
    } catch (error) {
      console.error('❌ Erro ao excluir:', error);
      showError('Erro ao excluir equipamento');
    } finally {
      setShowDeleteModal(false);
      setEquipmentToDelete(null);
    }
  }, [equipmentToDelete, currentUser, route, showSuccess, showError]);

  // CRUD de Equipamentos
  const handleAddEquipment = useCallback(async (data: Omit<Equipment, 'id'>, attachmentFiles?: File[]) => {
    try {
      await inventoryService.createEquipment(data, currentUser, attachmentFiles);
      
      const [updatedEquipment, updatedHistory] = await Promise.all([
        inventoryService.getAllEquipment(),
        inventoryService.getRecentActivities(10)
      ]);
      
      setEquipment(updatedEquipment);
      setHistory(updatedHistory);
      
      const attachmentText = attachmentFiles && attachmentFiles.length > 0 
        ? ` com ${attachmentFiles.length} anexo(s)` 
        : '';
      
      showSuccess(`Equipamento cadastrado com sucesso${attachmentText}!`);
      setRoute('equipment');
    } catch (error) {
      console.error('❌ Erro ao adicionar:', error);
      showError('Erro ao cadastrar equipamento');
    }
  }, [currentUser, showSuccess, showError]);

  const handleUpdateEquipment = useCallback(async (id: string, data: Partial<Equipment>) => {
    try {
      await inventoryService.updateEquipment(id, data, currentUser);
      
      const [updatedEquipment, updatedHistory] = await Promise.all([
        inventoryService.getAllEquipment(),
        inventoryService.getRecentActivities(10)
      ]);
      
      setEquipment(updatedEquipment);
      setHistory(updatedHistory);
      
      showSuccess('Equipamento atualizado com sucesso!');
      setSelectedEquipmentId(id);
      setRoute('equipment-details');
    } catch (error) {
      console.error('❌ Erro ao atualizar:', error);
      showError('Erro ao atualizar equipamento');
    }
  }, [currentUser, showSuccess, showError]);

  // CRUD de Solicitações de Compra
  const handleAddPurchase = useCallback(async (
    data: Omit<EquipmentPurchase, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ) => {
    try {
      await purchaseService.createPurchase(data, currentUser);
      await loadPurchases();
      showSuccess('Solicitação de compra criada com sucesso!');
      setRoute('purchases');
    } catch (error) {
      console.error('❌ Erro ao criar solicitação:', error);
      showError('Erro ao criar solicitação de compra');
      throw error; // Re-throw para o componente tratar
    }
  }, [currentUser, loadPurchases, showSuccess, showError]);

  const handleMarkAsAcquired = useCallback(async (id: string) => {
    try {
      // Buscar dados da solicitação
      const purchase = purchases.find(p => p.id === id);
      if (!purchase) {
        showError('Solicitação não encontrada');
        return;
      }
      
      // Abrir modal de conversão
      setPurchaseToConvert(purchase);
      setShowConversionModal(true);
    } catch (error) {
      console.error('❌ Erro ao iniciar conversão:', error);
      showError('Erro ao processar solicitação');
    }
  }, [purchases, showError]);

  const handleDeletePurchase = useCallback(async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta solicitação?\n\nEsta ação não pode ser desfeita.')) return;
    
    try {
      await purchaseService.deletePurchase(id, currentUser);
      await loadPurchases();
      showSuccess('Solicitação excluída com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao excluir solicitação:', error);
      showError('Erro ao excluir solicitação');
    }
  }, [currentUser, loadPurchases, showSuccess, showError]);

  // Carregar histórico específico quando necessário
  useEffect(() => {
    const loadEquipmentHistory = async () => {
      if (route === 'equipment-details' && selectedEquipmentId) {
        try {
          const equipmentHistory = await inventoryService.getEquipmentHistory(selectedEquipmentId);
          setHistory(equipmentHistory);
        } catch (error) {
          console.error('❌ Erro ao carregar histórico:', error);
        }
      }
    };
    
    loadEquipmentHistory();
  }, [route, selectedEquipmentId]);

  // Renderização de rotas
  const currentRouteContent = useMemo(() => {
    const routes: Record<RouteType, JSX.Element> = {
      dashboard: <Dashboard equipment={equipment} historyEntries={history} />,
      
      equipment: (
        <EquipmentList 
          equipment={equipment}
          onViewDetails={handleViewDetails} 
          onAddNew={() => setRoute('add-equipment')} 
        />
      ),
      
      'equipment-details': (
        <EquipmentDetailsPage 
          equipmentId={selectedEquipmentId || ''}
          onBack={() => setRoute('equipment')}
          onEdit={handleEditEquipment}
          onDelete={handleStartDelete}
        />
      ),
      
      'add-equipment': (
        <AddEquipment 
          onBack={() => setRoute('equipment')}
          onSubmit={handleAddEquipment}
        />
      ),
      
      'edit-equipment': (
        <EditEquipment 
          equipmentId={selectedEquipmentId || ''}
          onBack={() => {
            setSelectedEquipmentId(selectedEquipmentId);
            setRoute('equipment-details');
          }}
          onSubmit={(data) => handleUpdateEquipment(selectedEquipmentId!, data)}
        />
      ),
      
      reports: <Reports equipment={equipment} />,
      
      purchases: (
        <EquipmentPurchaseList
          purchases={purchases}
          onViewDetails={(id) => {
            setSelectedPurchaseId(id);
            setRoute('purchase-details');
          }}
          onEdit={(id) => {
            setSelectedPurchaseId(id);
            setRoute('edit-purchase');
          }}
          onDelete={handleDeletePurchase}
          onAddNew={() => setRoute('add-purchase')}
          onMarkAsAcquired={handleMarkAsAcquired}
        />
      ),
      
      'add-purchase': (
        <AddEquipmentPurchase
          onBack={() => setRoute('purchases')}
          onSubmit={handleAddPurchase}
        />
      ),
      
      'edit-purchase': (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">Editar Solicitação</h3>
            <p className="text-gray-500">Esta funcionalidade está em desenvolvimento</p>
          </div>
        </div>
      ),
      
      'purchase-details': (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">Detalhes da Solicitação</h3>
            <p className="text-gray-500">Esta funcionalidade está em desenvolvimento</p>
          </div>
        </div>
      ),
      
      inventory: (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">Controle de Patrimônio</h3>
            <p className="text-gray-500">Esta funcionalidade está em desenvolvimento</p>
          </div>
        </div>
      ),
      
      construction: (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">Equipamentos em Obras</h3>
            <p className="text-gray-500">Esta funcionalidade está em desenvolvimento</p>
          </div>
        </div>
      )
    };

    return routes[route] || routes.dashboard;
  }, [
    route, 
    equipment, 
    purchases,
    history, 
    selectedEquipmentId,
    selectedPurchaseId,
    handleViewDetails, 
    handleEditEquipment, 
    handleStartDelete, 
    handleAddEquipment, 
    handleUpdateEquipment,
    handleAddPurchase,
    handleMarkAsAcquired,
    handleDeletePurchase
  ]);

  // Loading inicial com melhor UX
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Conectando ao Sistema</h3>
          <p className="text-sm text-gray-500">Carregando dados do banco...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Indicador de Conexão */}
      {!isOnline && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">Sem conexão</span>
        </div>
      )}

      {/* Layout Principal */}
      <Layout 
        activeRoute={route} 
        onNavigate={(routeName: string) => setRoute(routeName as RouteType)}
      >
        <div className="animate-fadeIn">
          {currentRouteContent}
        </div>
      </Layout>
      
      {/* Modal de Exclusão */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este equipamento? Esta ação não pode ser desfeita e todos os anexos também serão removidos."
        itemName={equipment.find(item => item.id === equipmentToDelete)?.assetNumber || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setEquipmentToDelete(null);
        }}
      />
      
      {/* Sistema de Toasts */}
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
      
      {/* Modal de Conversão */}
      <PurchaseToEquipmentModal
        isOpen={showConversionModal}
        purchase={purchaseToConvert}
        onClose={() => {
          setShowConversionModal(false);
          setPurchaseToConvert(null);
        }}
        onSuccess={async (equipmentData) => {
          if (purchaseToConvert) {
            try {
              // Converter solicitação em equipamento
              await purchaseService.convertToEquipment(
                purchaseToConvert.id,
                equipmentData,
                currentUser
              );
              
              // Recarregar dados
              const [updatedEquipment, updatedPurchases, updatedHistory] = await Promise.all([
                inventoryService.getAllEquipment(),
                purchaseService.getAllPurchases(),
                inventoryService.getRecentActivities(10)
              ]);
              
              setEquipment(updatedEquipment);
              setPurchases(updatedPurchases);
              setHistory(updatedHistory);
              
              showSuccess('Equipamento cadastrado e solicitação marcada como adquirida!');
              
              // Fechar modal
              setShowConversionModal(false);
              setPurchaseToConvert(null);
            } catch (error) {
              console.error('❌ Erro ao converter solicitação:', error);
              showError('Erro ao converter solicitação em equipamento');
            }
          }
        }}
      />
    </>
  );
}

export default App;