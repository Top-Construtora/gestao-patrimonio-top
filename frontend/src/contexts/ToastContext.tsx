import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast, { ToastType, ToastPosition } from '../components/common/Toast';

interface ToastOptions {
  description?: string;
  duration?: number;
  position?: ToastPosition;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  closable?: boolean;
  progress?: boolean;
}

interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  description?: string;
  duration?: number;
  position?: ToastPosition;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  closable?: boolean;
  progress?: boolean;
}

interface ToastContextType {
  showSuccess: (message: string, options?: ToastOptions) => string;
  showError: (message: string, options?: ToastOptions) => string;
  showWarning: (message: string, options?: ToastOptions) => string;
  showInfo: (message: string, options?: ToastOptions) => string;
  showLoading: (message: string, options?: ToastOptions) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addToast = useCallback((message: string, type: ToastType, options?: ToastOptions): string => {
    const id = generateId();
    const newToast: ToastData = {
      id,
      message,
      type,
      ...options
    };
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message: string, options?: ToastOptions) => {
    return addToast(message, 'success', options);
  }, [addToast]);

  const showError = useCallback((message: string, options?: ToastOptions) => {
    return addToast(message, 'error', options);
  }, [addToast]);

  const showWarning = useCallback((message: string, options?: ToastOptions) => {
    return addToast(message, 'warning', options);
  }, [addToast]);

  const showInfo = useCallback((message: string, options?: ToastOptions) => {
    return addToast(message, 'info', options);
  }, [addToast]);

  const showLoading = useCallback((message: string, options?: ToastOptions) => {
    return addToast(message, 'loading', { duration: 0, closable: false, ...options });
  }, [addToast]);

  const value: ToastContextType = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    removeToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          description={toast.description}
          duration={toast.duration}
          position={toast.position}
          action={toast.action}
          icon={toast.icon}
          closable={toast.closable}
          progress={toast.progress}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

export const useToastContext = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
