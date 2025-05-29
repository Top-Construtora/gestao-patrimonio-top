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

  // Carregar dados iniciais - CORRIGIDO
  useEffect(() => {
    const loadInitialData = async () => {
      try {        
        // Verificar conexão com o banco
        const isConnected = await inventoryService.checkConnection();
        if (!isConnected) {
          throw new Error('Não foi possível conectar ao banco de dados');
        }

        // Carregar equipamentos e histórico
        const [equipmentData, recentActivities] = await Promise.all([
          inventoryService.getAllEquipment(),
          inventoryService.getRecentActivities(10)
        ]);
        
        setEquipment(equipmentData);
        setHistory(recentActivities);
        
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        showError('Erro ao conectar com o banco de dados. Verifique sua conexão.');
      } finally {
        setIsInitializing(false);
      }
    };
    
    loadInitialData();
  }, [showInfo, showError, showSuccess]);

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
          onBack={() => {
            setSelectedEquipmentId(selectedEquipmentId);
            setRoute('equipment-details');
          }}
          onSubmit={(data) => handleUpdateEquipment(selectedEquipmentId!, data)}
        />
      ),
      reports: <Reports equipment={equipment} />,
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
    history, 
    selectedEquipmentId, 
    handleViewDetails, 
    handleEditEquipment, 
    handleStartDelete, 
    handleAddEquipment, 
    handleUpdateEquipment
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
      <Layout activeRoute={route} onNavigate={(routeName: string) => setRoute(routeName as RouteType)}>
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
    </>
  );
}

export default App;