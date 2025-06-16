import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/EquipmentList';
import EquipmentDetailsPage from './pages/EquipmentDetailsPage';
import AddEquipment from './pages/AddEquipment';
import EditEquipment from './pages/EditEquipment';
import Reports from './pages/Reports';
import { useToast } from './components/common/Toast';
import Toast from './components/common/Toast';
import DeleteConfirmationModal from './components/common/DeleteConfirmationModal';
import { Equipment, HistoryEntry } from './types';
import inventoryService from './services/inventoryService';
import { Wifi, WifiOff } from 'lucide-react';

// Tipos para rotas
type RouteType = 'dashboard' | 'equipment' | 'equipment-details' | 'add-equipment' | 'edit-equipment' | 'reports' | 'inventory' | 'construction';

function App() {
  // Estados principais
  const [route, setRoute] = useState<RouteType>('dashboard');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  
  // Estados de UI
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(null);
  
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

  // Carregar dados iniciais - CORRIGIDO (ÚNICA MUDANÇA NECESSÁRIA)
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialData = async () => {
      if (!isMounted) return;
      
      try {        
        // Verificar conexão com o banco
        const isConnected = await inventoryService.checkConnection();
        if (!isConnected) {
          throw new Error('Não foi possível conectar ao banco de dados');
        }

        // Carregar equipamentos e histórico
        if (isMounted) {
          const [equipmentData, recentActivities] = await Promise.all([
            inventoryService.getAllEquipment(),
            inventoryService.getRecentActivities(10)
          ]);
          
          if (isMounted) {
            setEquipment(equipmentData);
            setHistory(recentActivities);
          }
        }
        
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        if (isMounted) {
          showError('Erro ao conectar com o banco de dados. Verifique sua conexão.');
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };
    
    loadInitialData();
    
    return () => {
      isMounted = false;
    };
  }, []); // MUDANÇA CRÍTICA: Array vazio para executar apenas uma vez

  // Funções de navegação
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

  // Confirmar exclusão
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
      
      showSuccess('Equipamento excluído com sucesso');
      
      setShowDeleteModal(false);
      setEquipmentToDelete(null);
      setRoute('equipment');
    } catch (error) {
      console.error('❌ Erro ao excluir:', error);
      showError('Erro ao excluir equipamento');
    }
  }, [equipmentToDelete, currentUser, showSuccess, showError]);

  // Adicionar equipamento com anexos
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

  // Atualizar equipamento
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

  // Carregar histórico específico
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
          onBack={() => setRoute('equipment-details')}
          onSubmit={(data) => handleUpdateEquipment(selectedEquipmentId!, data)}
        />
      ),
      reports: <Reports equipment={equipment} />,
      inventory: (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500">Página de Inventário em Construção</p>
          </div>
        </div>
      ),
      construction: (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500">Página em Construção</p>
          </div>
        </div>
      )
    };

    return routes[route] || routes.dashboard;
  }, [route, equipment, history, selectedEquipmentId, handleViewDetails, handleEditEquipment, handleStartDelete, handleAddEquipment, handleUpdateEquipment]);

  // Indicador de status
  const StatusIndicator = () => {
    if (!isOnline) {
      return (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm">Sem conexão</span>
        </div>
      );
    }
    return null;
  };

  // Mostrar loading na inicialização
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center space-x-2 mb-4">
            <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Layout 
        activeRoute={route}
        onNavigate={(newRoute: string) => setRoute(newRoute as RouteType)}
      >
        {currentRouteContent}
      </Layout>
      <StatusIndicator />
      
      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
      
      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setEquipmentToDelete(null);
          }}
          itemName={equipment.find(e => e.id === equipmentToDelete)?.description || ''}
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir este equipamento? Esta ação não pode ser desfeita."
        />
      )}
    </div>
  );
}

export default App;