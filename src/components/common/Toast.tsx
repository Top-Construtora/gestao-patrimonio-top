import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  AlertTriangle,
  Loader2,
  Wifi,
  WifiOff,
  Bell,
  Download,
  Upload,
  Mail
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'promise';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

interface ToastProps {
  id?: string;
  message: string;
  description?: string;
  type: ToastType;
  duration?: number;
  position?: ToastPosition;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  closable?: boolean;
  progress?: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id,
  message, 
  description,
  type, 
  duration = 5000,
  position = 'bottom-right',
  action,
  icon,
  closable = true,
  progress = true,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(duration);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (type === 'loading' || duration === 0 || isPaused) return;

    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 100) {
          handleClose();
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [type, duration, isPaused]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'info':
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          textColor: 'text-green-900',
          descColor: 'text-green-700',
          progressBg: 'bg-green-200',
          progressBar: 'bg-green-500',
          actionColor: 'text-green-700 hover:text-green-800 hover:bg-green-100'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50',
          border: 'border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          textColor: 'text-red-900',
          descColor: 'text-red-700',
          progressBg: 'bg-red-200',
          progressBar: 'bg-red-500',
          actionColor: 'text-red-700 hover:text-red-800 hover:bg-red-100'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
          border: 'border-yellow-200',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          textColor: 'text-yellow-900',
          descColor: 'text-yellow-700',
          progressBg: 'bg-yellow-200',
          progressBar: 'bg-yellow-500',
          actionColor: 'text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100'
        };
      case 'loading':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          border: 'border-blue-200',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-900',
          descColor: 'text-blue-700',
          progressBg: 'bg-blue-200',
          progressBar: 'bg-blue-500',
          actionColor: 'text-blue-700 hover:text-blue-800 hover:bg-blue-100'
        };
      case 'info':
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
          border: 'border-blue-200',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-900',
          descColor: 'text-blue-700',
          progressBg: 'bg-blue-200',
          progressBar: 'bg-blue-500',
          actionColor: 'text-blue-700 hover:text-blue-800 hover:bg-blue-100'
        };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-5 left-5';
      case 'top-center':
        return 'top-5 left-1/2 -translate-x-1/2';
      case 'top-right':
        return 'top-5 right-5';
      case 'bottom-left':
        return 'bottom-5 left-5';
      case 'bottom-center':
        return 'bottom-5 left-1/2 -translate-x-1/2';
      case 'bottom-right':
      default:
        return 'bottom-5 right-5';
    }
  };

  const getAnimationClasses = () => {
    const isTop = position.includes('top');
    const isLeft = position.includes('left');
    const isRight = position.includes('right');
    const isCenter = position.includes('center');

    if (isLeaving) {
      if (isTop) return 'animate-slide-up-reverse';
      return 'animate-slide-down-reverse';
    }

    if (isTop) return 'animate-slide-down';
    return 'animate-slide-up';
  };

  const styles = getStyles();
  const progressPercentage = (remainingTime / duration) * 100;

  return (
    <div 
      className={`fixed z-50 ${getPositionClasses()} ${getAnimationClasses()} transition-all duration-300`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        className={`
          ${styles.bg} ${styles.border} 
          ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          p-4 rounded-xl shadow-2xl border backdrop-blur-sm
          max-w-md min-w-[320px] relative overflow-hidden
          transition-all duration-300 transform
          hover:shadow-3xl hover:scale-[1.02]
        `}
      >
        {/* Progress Bar */}
        {progress && type !== 'loading' && duration > 0 && (
          <div className={`absolute top-0 left-0 w-full h-1 ${styles.progressBg}`}>
            <div 
              className={`h-full ${styles.progressBar} transition-all duration-100 ease-linear`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}

        <div className="flex items-start">
          {/* Icon */}
          <div className={`flex-shrink-0 ${styles.iconBg} p-2 rounded-lg`}>
            <div className={styles.iconColor}>
              {getIcon()}
            </div>
          </div>

          {/* Content */}
          <div className="ml-3 flex-1">
            <p className={`text-sm font-semibold ${styles.textColor}`}>
              {message}
            </p>
            {description && (
              <p className={`mt-1 text-xs ${styles.descColor}`}>
                {description}
              </p>
            )}
            {action && (
              <button
                onClick={action.onClick}
                className={`mt-2 text-xs font-medium ${styles.actionColor} px-2 py-1 rounded transition-colors`}
              >
                {action.label}
              </button>
            )}
          </div>

          {/* Close Button */}
          {closable && (
            <button
              onClick={handleClose}
              className={`ml-4 -mt-1 -mr-1 p-1 rounded-lg transition-all hover:bg-black/5 group`}
            >
              <X className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Toast Container para múltiplos toasts
export const ToastContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="pointer-events-auto">
        {children}
      </div>
    </div>
  );
};

// Hook para gerenciar toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const showToast = (toast: Omit<ToastProps, 'onClose' | 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = {
      ...toast,
      id,
      onClose: () => removeToast(id)
    };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message: string, options?: Partial<ToastProps>) => {
    return showToast({ ...options, message, type: 'success' });
  };

  const showError = (message: string, options?: Partial<ToastProps>) => {
    return showToast({ ...options, message, type: 'error' });
  };

  const showInfo = (message: string, options?: Partial<ToastProps>) => {
    return showToast({ ...options, message, type: 'info' });
  };

  const showWarning = (message: string, options?: Partial<ToastProps>) => {
    return showToast({ ...options, message, type: 'warning' });
  };

  const showLoading = (message: string, options?: Partial<ToastProps>) => {
    return showToast({ ...options, message, type: 'loading', duration: 0, closable: false });
  };

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    removeToast
  };
};

// Componente de demonstração
export const ToastDemo: React.FC = () => {
  const { toasts, showSuccess, showError, showInfo, showWarning, showLoading, removeToast } = useToast();

  const showPromiseToast = () => {
    const loadingId = showLoading('Salvando alterações...');
    
    setTimeout(() => {
      removeToast(loadingId);
      showSuccess('Alterações salvas com sucesso!', {
        description: 'Suas modificações foram aplicadas.',
        action: {
          label: 'Desfazer',
          onClick: () => alert('Desfazendo...')
        }
      });
    }, 3000);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Sistema de Toasts</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
        <button
          onClick={() => showSuccess('Operação realizada com sucesso!')}
          className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          Toast Success
        </button>

        <button
          onClick={() => showError('Erro ao processar solicitação', {
            description: 'Verifique os dados e tente novamente.'
          })}
          className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          Toast Error com Descrição
        </button>

        <button
          onClick={() => showWarning('Atenção: Ação irreversível', {
            action: {
              label: 'Entendi',
              onClick: () => {}
            }
          })}
          className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          Toast Warning com Ação
        </button>

        <button
          onClick={() => showInfo('Nova atualização disponível', {
            icon: <Download className="h-5 w-5" />,
            duration: 10000
          })}
          className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          Toast Info (10s)
        </button>

        <button
          onClick={showPromiseToast}
          className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          Toast Promise (Loading → Success)
        </button>

        <button
          onClick={() => showInfo('Conectado à internet', {
            icon: <Wifi className="h-5 w-5" />,
            position: 'top-center'
          })}
          className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          Toast Top Center
        </button>
      </div>

      {/* Renderizar toasts */}
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};

export default Toast;