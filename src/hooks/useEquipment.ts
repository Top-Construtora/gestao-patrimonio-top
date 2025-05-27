import { useState, useEffect } from 'react';
import { equipmentService } from '../services/equipmentService';
import type { Equipment, EquipmentHistory, CreateEquipmentData, UpdateEquipmentData } from '../types/database';

export function useEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [recentHistory, setRecentHistory] = useState<EquipmentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados iniciais
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [equipmentData, historyData] = await Promise.all([
        equipmentService.getAllEquipment(),
        equipmentService.getRecentHistory(20)
      ]);
      
      setEquipment(equipmentData);
      setRecentHistory(historyData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  // Criar equipamento
  const createEquipment = async (data: CreateEquipmentData, userName = 'Usuário') => {
    try {
      const newEquipment = await equipmentService.createEquipment(data, userName);
      await loadData(); // Recarregar dados
      return newEquipment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar equipamento';
      throw new Error(errorMessage);
    }
  };

  // Atualizar equipamento
  const updateEquipment = async (id: string, data: UpdateEquipmentData, userName = 'Usuário') => {
    try {
      const updatedEquipment = await equipmentService.updateEquipment(id, data, userName);
      await loadData(); // Recarregar dados
      return updatedEquipment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar equipamento';
      throw new Error(errorMessage);
    }
  };

  // Excluir equipamento
  const deleteEquipment = async (id: string, userName = 'Usuário') => {
    try {
      await equipmentService.deleteEquipment(id, userName);
      await loadData(); // Recarregar dados
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir equipamento';
      throw new Error(errorMessage);
    }
  };

  // Buscar equipamento por ID
  const getEquipmentById = async (id: string) => {
    try {
      return await equipmentService.getEquipmentById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar equipamento';
      throw new Error(errorMessage);
    }
  };

  // Estatísticas
  const getStats = () => {
    const total = equipment.length;
    const ativo = equipment.filter(e => e.status === 'ativo').length;
    const manutencao = equipment.filter(e => e.status === 'manutenção').length;
    const desativado = equipment.filter(e => e.status === 'desativado').length;
    const valorTotal = equipment.reduce((sum, e) => sum + e.value, 0);
    
    return {
      total,
      ativo,
      manutencao,
      desativado,
      valorTotal,
      valorMedio: total > 0 ? valorTotal / total : 0
    };
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    equipment,
    recentHistory,
    loading,
    error,
    stats: getStats(),
    actions: {
      refresh: loadData,
      create: createEquipment,
      update: updateEquipment,
      delete: deleteEquipment,
      getById: getEquipmentById
    }
  };
}