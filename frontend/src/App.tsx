import React, { useEffect, useState, useMemo, useCallback, Suspense, lazy } from 'react';
import Layout from './components/layout/Layout';
import { useToast } from './components/common/Toast';
import Toast from './components/common/Toast';
import DeleteConfirmationModal from './components/common/DeleteConfirmationModal';
import { Equipment, FileAttachment } from './types';
import { EquipmentPurchase } from './types/purchaseTypes';
import { useCurrentUser } from './contexts/UserContext';
import { useOnlineStatus, useEquipment, usePurchases, useNavigation, RouteType } from './hooks';
import inventoryService from './services/inventoryService';
import purchaseService from './services/purchaseService';
import { WifiOff, Loader2 } from 'lucide-react';

// Lazy loading de páginas para reduzir bundle inicial
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EquipmentList = lazy(() => import('./pages/EquipmentList'));
const EquipmentDetailsPage = lazy(() => import('./pages/EquipmentDetailsPage'));
const AddEquipment = lazy(() => import('./pages/AddEquipment'));
const EditEquipment = lazy(() => import('./pages/EditEquipment'));
const Reports = lazy(() => import('./pages/Reports'));
const EquipmentPurchaseList = lazy(() => import('./pages/EquipmentPurchaseList'));
const AddEquipmentPurchase = lazy(() => import('./pages/AddEquipmentPurchase'));
const PurchaseToEquipmentModal = lazy(() => import('./components/purchases/PurchaseToEquipmentModal'));

// Loading fallback component
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-gray-500">Carregando...</p>
    </div>
  </div>
);

function App() {
  // Hooks customizados
  const { isOnline, checkServerConnection } = useOnlineStatus();
  const {
    equipment,
    history,
    setHistory,
    loadEquipment,
    loadHistory,
    loadEquipmentHistory,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    getEquipmentById
  } = useEquipment();
  const {
    purchases,
    setPurchases,
    loadPurchases,
    createPurchase,
    deletePurchase: deletePurchaseFromHook,
    markAsAcquired,
    getPurchaseById
  } = usePurchases();
  const {
    route,
    selectedEquipmentId,
    selectedPurchaseId,
    setSelectedEquipmentId,
    navigate,
    goToEquipmentList,
    goToEquipmentDetails,
    goToEditEquipment,
    goToPurchasesList
  } = useNavigation();

  // Estados de UI para modais
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(null);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [purchaseToConvert, setPurchaseToConvert] = useState<EquipmentPurchase | null>(null);
  const [showDeletePurchaseModal, setShowDeletePurchaseModal] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<string | null>(null);

  // Toast e usuário
  const { showSuccess, showError, toasts } = useToast();
  const currentUser = useCurrentUser();

  // Inicialização - Carregamento de dados
  useEffect(() => {
    const initializeApp = async () => {
      await checkServerConnection();
      await Promise.all([loadEquipment(), loadHistory(), loadPurchases()]);
    };

    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carregar histórico específico quando visualizar detalhes
  useEffect(() => {
    if (route === 'equipment-details' && selectedEquipmentId) {
      loadEquipmentHistory(selectedEquipmentId);
    }
  }, [route, selectedEquipmentId, loadEquipmentHistory]);

  // Handlers de equipamento
  const handleViewDetails = useCallback((id: string) => {
    goToEquipmentDetails(id);
  }, [goToEquipmentDetails]);

  const handleEditEquipment = useCallback((id: string) => {
    goToEditEquipment(id);
  }, [goToEditEquipment]);

  const handleStartDelete = useCallback((id: string) => {
    setEquipmentToDelete(id);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!equipmentToDelete) return;

    const success = await deleteEquipment(equipmentToDelete);
    if (success && route === 'equipment-details') {
      goToEquipmentList();
    }

    setShowDeleteModal(false);
    setEquipmentToDelete(null);
  }, [equipmentToDelete, deleteEquipment, route, goToEquipmentList]);

  const handleAddEquipment = useCallback(async (
    data: Omit<Equipment, 'id'>,
    attachmentFiles?: File[]
  ) => {
    const success = await createEquipment(data, attachmentFiles);
    if (success) {
      goToEquipmentList();
    }
  }, [createEquipment, goToEquipmentList]);

  const handleUpdateEquipment = useCallback(async (id: string, data: Partial<Equipment>) => {
    const success = await updateEquipment(id, data);
    if (success) {
      setSelectedEquipmentId(id);
      goToEquipmentDetails(id);
    }
  }, [updateEquipment, setSelectedEquipmentId, goToEquipmentDetails]);

  // Handlers de compras
  const handleAddPurchase = useCallback(async (
    data: Omit<EquipmentPurchase, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ) => {
    await createPurchase(data);
    goToPurchasesList();
  }, [createPurchase, goToPurchasesList]);

  const handleMarkAsAcquired = useCallback((id: string) => {
    const purchase = getPurchaseById(id);
    if (!purchase) {
      showError('Solicitação não encontrada');
      return;
    }
    setPurchaseToConvert(purchase);
    setShowConversionModal(true);
  }, [getPurchaseById, showError]);

  const handleDeletePurchase = useCallback((id: string) => {
    setPurchaseToDelete(id);
    setShowDeletePurchaseModal(true);
  }, []);

  const handleConfirmDeletePurchase = useCallback(async () => {
    if (!purchaseToDelete) return;

    await deletePurchaseFromHook(purchaseToDelete);
    setShowDeletePurchaseModal(false);
    setPurchaseToDelete(null);
  }, [purchaseToDelete, deletePurchaseFromHook]);

  const handleConversionSuccess = useCallback(async (
    equipmentData: Omit<Equipment, 'id'>,
    attachments: FileAttachment[]
  ) => {
    if (!purchaseToConvert) return;

    try {
      const attachmentFiles = attachments.map(att => att.file);

      await inventoryService.createEquipment(equipmentData, currentUser, attachmentFiles);
      await purchaseService.markAsAcquired(purchaseToConvert.id, currentUser);

      // Recarregar dados
      const [updatedEquipment, updatedPurchases, updatedHistory] = await Promise.all([
        inventoryService.getAllEquipment(),
        purchaseService.getAllPurchases(),
        inventoryService.getRecentActivities(10)
      ]);

      // Atualizar estados via setters dos hooks
      // Note: Isso funciona porque os hooks expõem os setters
      await loadEquipment();
      await loadPurchases();
      await loadHistory();

      const attachmentText = attachmentFiles.length > 0
        ? ` com ${attachmentFiles.length} anexo(s)`
        : '';
      showSuccess(`Equipamento cadastrado e solicitação marcada como adquirida${attachmentText}!`);

      setShowConversionModal(false);
      setPurchaseToConvert(null);
    } catch (error) {
      showError('Erro ao converter solicitação em equipamento');
    }
  }, [purchaseToConvert, currentUser, loadEquipment, loadPurchases, loadHistory, showSuccess, showError]);

  // Renderização de rotas
  const currentRouteContent = useMemo(() => {
    const routes: Record<RouteType, JSX.Element> = {
      dashboard: <Dashboard equipment={equipment} historyEntries={history} />,

      equipment: (
        <EquipmentList
          equipment={equipment}
          onViewDetails={handleViewDetails}
          onAddNew={() => navigate('add-equipment')}
        />
      ),

      'equipment-details': (
        <EquipmentDetailsPage
          equipmentId={selectedEquipmentId || ''}
          onBack={() => navigate('equipment')}
          onEdit={handleEditEquipment}
          onDelete={handleStartDelete}
        />
      ),

      'add-equipment': (
        <AddEquipment
          onBack={() => navigate('equipment')}
          onSubmit={handleAddEquipment}
        />
      ),

      'edit-equipment': (
        <EditEquipment
          equipmentId={selectedEquipmentId || ''}
          onBack={() => goToEquipmentDetails(selectedEquipmentId || '')}
          onSubmit={(data) => handleUpdateEquipment(selectedEquipmentId!, data)}
        />
      ),

      reports: <Reports equipment={equipment} />,

      purchases: (
        <EquipmentPurchaseList
          purchases={purchases}
          onViewDetails={(id) => navigate('purchase-details')}
          onEdit={(id) => navigate('edit-purchase')}
          onDelete={handleDeletePurchase}
          onAddNew={() => navigate('add-purchase')}
          onMarkAsAcquired={handleMarkAsAcquired}
        />
      ),

      'add-purchase': (
        <AddEquipmentPurchase
          onBack={() => navigate('purchases')}
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
    handleViewDetails,
    handleEditEquipment,
    handleStartDelete,
    handleAddEquipment,
    handleUpdateEquipment,
    handleAddPurchase,
    handleMarkAsAcquired,
    handleDeletePurchase,
    navigate,
    goToEquipmentDetails
  ]);

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
        onNavigate={(routeName: string) => navigate(routeName as RouteType)}
      >
        <Suspense fallback={<PageLoader />}>
          <div className="animate-fadeIn">
            {currentRouteContent}
          </div>
        </Suspense>
      </Layout>

      {/* Modal de Exclusão de Equipamento */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este equipamento? Esta ação não pode ser desfeita e todos os anexos também serão removidos."
        itemName={getEquipmentById(equipmentToDelete || '')?.assetNumber || ''}
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
      {showConversionModal && (
        <Suspense fallback={null}>
          <PurchaseToEquipmentModal
            isOpen={showConversionModal}
            purchase={purchaseToConvert}
            onClose={() => {
              setShowConversionModal(false);
              setPurchaseToConvert(null);
            }}
            onSuccess={handleConversionSuccess}
          />
        </Suspense>
      )}

      {/* Modal de Exclusão de Solicitação */}
      <DeleteConfirmationModal
        isOpen={showDeletePurchaseModal}
        title="Excluir Solicitação"
        message="Tem certeza que deseja excluir esta solicitação?"
        itemName={getPurchaseById(purchaseToDelete || '')?.description || 'Esta solicitação'}
        onConfirm={handleConfirmDeletePurchase}
        onCancel={() => {
          setShowDeletePurchaseModal(false);
          setPurchaseToDelete(null);
        }}
      />
    </>
  );
}

export default App;
