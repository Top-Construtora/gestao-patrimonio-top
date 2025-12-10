import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/common/Toast';
import inventoryService from '../services/inventoryService';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { showSuccess, showError, showWarning } = useToast();

  // Monitorar conexão do navegador
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

  // Verificar conexão com o servidor
  const checkServerConnection = useCallback(async () => {
    try {
      const serverOnline = await inventoryService.checkConnection();
      setIsOnline(serverOnline);

      if (!serverOnline) {
        showWarning('Sistema operando offline. Algumas funcionalidades podem estar limitadas.');
      }

      return serverOnline;
    } catch (error) {
      setIsOnline(false);
      return false;
    }
  }, [showWarning]);

  return {
    isOnline,
    setIsOnline,
    checkServerConnection
  };
};

export default useOnlineStatus;
