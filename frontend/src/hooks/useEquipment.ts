import { useState, useCallback } from 'react';
import { Equipment, HistoryEntry } from '../types';
import { useToast } from '../components/common/Toast';
import { useCurrentUser } from '../contexts/UserContext';
import inventoryService from '../services/inventoryService';

export const useEquipment = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { showSuccess, showError } = useToast();
  const currentUser = useCurrentUser();

  // Carregar todos os equipamentos
  const loadEquipment = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await inventoryService.getAllEquipment();
      setEquipment(data);
      return data;
    } catch (error) {
      showError('Erro ao carregar equipamentos');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  // Carregar histórico geral
  const loadHistory = useCallback(async (limit: number = 10) => {
    try {
      const data = await inventoryService.getRecentActivities(limit);
      setHistory(data);
      return data;
    } catch (error) {
      return [];
    }
  }, []);

  // Carregar histórico de um equipamento específico
  const loadEquipmentHistory = useCallback(async (equipmentId: string) => {
    try {
      const data = await inventoryService.getEquipmentHistory(equipmentId);
      setHistory(data);
      return data;
    } catch (error) {
      return [];
    }
  }, []);

  // Recarregar tudo
  const refreshAll = useCallback(async () => {
    const [equipmentData, historyData] = await Promise.all([
      loadEquipment(),
      loadHistory()
    ]);
    return { equipment: equipmentData, history: historyData };
  }, [loadEquipment, loadHistory]);

  // Criar equipamento
  const createEquipment = useCallback(async (
    data: Omit<Equipment, 'id'>,
    attachmentFiles?: File[]
  ) => {
    try {
      setIsLoading(true);
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
      return true;
    } catch (error) {
      showError('Erro ao cadastrar equipamento');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, showSuccess, showError]);

  // Atualizar equipamento
  const updateEquipment = useCallback(async (id: string, data: Partial<Equipment>) => {
    try {
      setIsLoading(true);
      await inventoryService.updateEquipment(id, data, currentUser);

      const [updatedEquipment, updatedHistory] = await Promise.all([
        inventoryService.getAllEquipment(),
        inventoryService.getRecentActivities(10)
      ]);

      setEquipment(updatedEquipment);
      setHistory(updatedHistory);

      showSuccess('Equipamento atualizado com sucesso!');
      return true;
    } catch (error) {
      showError('Erro ao atualizar equipamento');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, showSuccess, showError]);

  // Excluir equipamento
  const deleteEquipment = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      await inventoryService.deleteEquipment(id, currentUser);

      const [updatedEquipment, updatedHistory] = await Promise.all([
        inventoryService.getAllEquipment(),
        inventoryService.getRecentActivities(10)
      ]);

      setEquipment(updatedEquipment);
      setHistory(updatedHistory);

      showSuccess('Equipamento excluído com sucesso!');
      return true;
    } catch (error) {
      showError('Erro ao excluir equipamento');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, showSuccess, showError]);

  // Buscar equipamento por ID
  const getEquipmentById = useCallback((id: string) => {
    return equipment.find(e => e.id === id);
  }, [equipment]);

  return {
    equipment,
    history,
    isLoading,
    setEquipment,
    setHistory,
    loadEquipment,
    loadHistory,
    loadEquipmentHistory,
    refreshAll,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    getEquipmentById
  };
};

export default useEquipment;
