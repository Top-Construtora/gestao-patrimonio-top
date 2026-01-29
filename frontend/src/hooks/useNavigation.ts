import { useState, useCallback } from 'react';

// Tipos para rotas
export type RouteType =
  | 'dashboard'
  | 'equipment'
  | 'equipment-details'
  | 'add-equipment'
  | 'edit-equipment'
  | 'reports'
  | 'inventory'
  | 'construction'
  | 'purchases'
  | 'add-purchase'
  | 'edit-purchase'
  | 'purchase-details'
  | 'settings'
  | 'support';

export const useNavigation = (initialRoute: RouteType = 'dashboard') => {
  const [route, setRoute] = useState<RouteType>(initialRoute);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);

  // Navegação genérica
  const navigate = useCallback((newRoute: RouteType) => {
    setRoute(newRoute);
  }, []);

  // Navegação para dashboard
  const goToDashboard = useCallback(() => {
    setRoute('dashboard');
  }, []);

  // Navegação de equipamentos
  const goToEquipmentList = useCallback(() => {
    setRoute('equipment');
  }, []);

  const goToAddEquipment = useCallback(() => {
    setRoute('add-equipment');
  }, []);

  const goToEquipmentDetails = useCallback((id: string) => {
    setSelectedEquipmentId(id);
    setRoute('equipment-details');
  }, []);

  const goToEditEquipment = useCallback((id: string) => {
    setSelectedEquipmentId(id);
    setRoute('edit-equipment');
  }, []);

  // Navegação de compras
  const goToPurchasesList = useCallback(() => {
    setRoute('purchases');
  }, []);

  const goToAddPurchase = useCallback(() => {
    setRoute('add-purchase');
  }, []);

  const goToPurchaseDetails = useCallback((id: string) => {
    setSelectedPurchaseId(id);
    setRoute('purchase-details');
  }, []);

  const goToEditPurchase = useCallback((id: string) => {
    setSelectedPurchaseId(id);
    setRoute('edit-purchase');
  }, []);

  // Navegação para relatórios
  const goToReports = useCallback(() => {
    setRoute('reports');
  }, []);

  // Voltar para a lista apropriada
  const goBack = useCallback(() => {
    switch (route) {
      case 'equipment-details':
      case 'add-equipment':
      case 'edit-equipment':
        setRoute('equipment');
        break;
      case 'purchase-details':
      case 'add-purchase':
      case 'edit-purchase':
        setRoute('purchases');
        break;
      default:
        setRoute('dashboard');
    }
  }, [route]);

  return {
    route,
    selectedEquipmentId,
    selectedPurchaseId,
    setSelectedEquipmentId,
    setSelectedPurchaseId,
    navigate,
    goToDashboard,
    goToEquipmentList,
    goToAddEquipment,
    goToEquipmentDetails,
    goToEditEquipment,
    goToPurchasesList,
    goToAddPurchase,
    goToPurchaseDetails,
    goToEditPurchase,
    goToReports,
    goBack
  };
};

export default useNavigation;
