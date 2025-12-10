import { useState, useCallback } from 'react';
import { EquipmentPurchase } from '../types/purchaseTypes';
import { useToast } from '../components/common/Toast';
import { useCurrentUser } from '../contexts/UserContext';
import purchaseService from '../services/purchaseService';

export const usePurchases = () => {
  const [purchases, setPurchases] = useState<EquipmentPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { showSuccess, showError } = useToast();
  const currentUser = useCurrentUser();

  // Carregar todas as solicitações
  const loadPurchases = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await purchaseService.getAllPurchases();
      setPurchases(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      // Silenciar erro de tabela inexistente
      if (errorMessage.includes('relation "public.equipment_purchases" does not exist')) {
        setPurchases([]);
        return [];
      }
      showError('Erro ao carregar solicitações de compra');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  // Criar solicitação
  const createPurchase = useCallback(async (
    data: Omit<EquipmentPurchase, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ) => {
    try {
      setIsLoading(true);
      await purchaseService.createPurchase(data, currentUser);
      await loadPurchases();
      showSuccess('Solicitação de compra criada com sucesso!');
      return true;
    } catch (error) {
      showError('Erro ao criar solicitação de compra');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, loadPurchases, showSuccess, showError]);

  // Excluir solicitação
  const deletePurchase = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      await purchaseService.deletePurchase(id, currentUser);
      await loadPurchases();
      showSuccess('Solicitação excluída com sucesso!');
      return true;
    } catch (error) {
      showError('Erro ao excluir solicitação');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, loadPurchases, showSuccess, showError]);

  // Marcar como adquirida
  const markAsAcquired = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      await purchaseService.markAsAcquired(id, currentUser);
      await loadPurchases();
      return true;
    } catch (error) {
      showError('Erro ao marcar solicitação como adquirida');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, loadPurchases, showError]);

  // Buscar solicitação por ID
  const getPurchaseById = useCallback((id: string) => {
    return purchases.find(p => p.id === id);
  }, [purchases]);

  return {
    purchases,
    isLoading,
    setPurchases,
    loadPurchases,
    createPurchase,
    deletePurchase,
    markAsAcquired,
    getPurchaseById
  };
};

export default usePurchases;
