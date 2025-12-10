import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigation, RouteType } from './useNavigation';

describe('useNavigation', () => {
  it('deve iniciar com a rota padrão "dashboard"', () => {
    const { result } = renderHook(() => useNavigation());

    expect(result.current.route).toBe('dashboard');
  });

  it('deve iniciar com a rota fornecida', () => {
    const { result } = renderHook(() => useNavigation('equipment'));

    expect(result.current.route).toBe('equipment');
  });

  it('deve navegar para uma nova rota usando navigate()', () => {
    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.navigate('reports');
    });

    expect(result.current.route).toBe('reports');
  });

  describe('navegação de equipamentos', () => {
    it('deve ir para lista de equipamentos', () => {
      const { result } = renderHook(() => useNavigation());

      act(() => {
        result.current.goToEquipmentList();
      });

      expect(result.current.route).toBe('equipment');
    });

    it('deve ir para adicionar equipamento', () => {
      const { result } = renderHook(() => useNavigation());

      act(() => {
        result.current.goToAddEquipment();
      });

      expect(result.current.route).toBe('add-equipment');
    });

    it('deve ir para detalhes de equipamento e definir ID', () => {
      const { result } = renderHook(() => useNavigation());
      const equipmentId = '123-abc';

      act(() => {
        result.current.goToEquipmentDetails(equipmentId);
      });

      expect(result.current.route).toBe('equipment-details');
      expect(result.current.selectedEquipmentId).toBe(equipmentId);
    });

    it('deve ir para editar equipamento e definir ID', () => {
      const { result } = renderHook(() => useNavigation());
      const equipmentId = '456-def';

      act(() => {
        result.current.goToEditEquipment(equipmentId);
      });

      expect(result.current.route).toBe('edit-equipment');
      expect(result.current.selectedEquipmentId).toBe(equipmentId);
    });
  });

  describe('navegação de compras', () => {
    it('deve ir para lista de compras', () => {
      const { result } = renderHook(() => useNavigation());

      act(() => {
        result.current.goToPurchasesList();
      });

      expect(result.current.route).toBe('purchases');
    });

    it('deve ir para adicionar compra', () => {
      const { result } = renderHook(() => useNavigation());

      act(() => {
        result.current.goToAddPurchase();
      });

      expect(result.current.route).toBe('add-purchase');
    });

    it('deve ir para detalhes de compra e definir ID', () => {
      const { result } = renderHook(() => useNavigation());
      const purchaseId = '789-ghi';

      act(() => {
        result.current.goToPurchaseDetails(purchaseId);
      });

      expect(result.current.route).toBe('purchase-details');
      expect(result.current.selectedPurchaseId).toBe(purchaseId);
    });

    it('deve ir para editar compra e definir ID', () => {
      const { result } = renderHook(() => useNavigation());
      const purchaseId = '101-jkl';

      act(() => {
        result.current.goToEditPurchase(purchaseId);
      });

      expect(result.current.route).toBe('edit-purchase');
      expect(result.current.selectedPurchaseId).toBe(purchaseId);
    });
  });

  describe('função goBack', () => {
    it('deve voltar para equipamentos quando em equipment-details', () => {
      const { result } = renderHook(() => useNavigation('equipment-details'));

      act(() => {
        result.current.goBack();
      });

      expect(result.current.route).toBe('equipment');
    });

    it('deve voltar para equipamentos quando em add-equipment', () => {
      const { result } = renderHook(() => useNavigation('add-equipment'));

      act(() => {
        result.current.goBack();
      });

      expect(result.current.route).toBe('equipment');
    });

    it('deve voltar para equipamentos quando em edit-equipment', () => {
      const { result } = renderHook(() => useNavigation('edit-equipment'));

      act(() => {
        result.current.goBack();
      });

      expect(result.current.route).toBe('equipment');
    });

    it('deve voltar para compras quando em purchase-details', () => {
      const { result } = renderHook(() => useNavigation('purchase-details'));

      act(() => {
        result.current.goBack();
      });

      expect(result.current.route).toBe('purchases');
    });

    it('deve voltar para compras quando em add-purchase', () => {
      const { result } = renderHook(() => useNavigation('add-purchase'));

      act(() => {
        result.current.goBack();
      });

      expect(result.current.route).toBe('purchases');
    });

    it('deve voltar para dashboard quando em outra rota', () => {
      const { result } = renderHook(() => useNavigation('reports'));

      act(() => {
        result.current.goBack();
      });

      expect(result.current.route).toBe('dashboard');
    });
  });

  it('deve ir para o dashboard', () => {
    const { result } = renderHook(() => useNavigation('reports'));

    act(() => {
      result.current.goToDashboard();
    });

    expect(result.current.route).toBe('dashboard');
  });

  it('deve ir para relatórios', () => {
    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.goToReports();
    });

    expect(result.current.route).toBe('reports');
  });

  it('deve permitir definir IDs diretamente', () => {
    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.setSelectedEquipmentId('equip-123');
      result.current.setSelectedPurchaseId('purchase-456');
    });

    expect(result.current.selectedEquipmentId).toBe('equip-123');
    expect(result.current.selectedPurchaseId).toBe('purchase-456');
  });
});
