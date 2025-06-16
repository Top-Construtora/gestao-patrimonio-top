import React, { useEffect, useState } from 'react';
import { Loader2, Package, Server, Cpu, HardDrive, Wifi } from 'lucide-react';

type LoadingVariant = 'default' | 'minimal' | 'tech' | 'progress' | 'dots' | 'pulse';
type LoadingSize = 'sm' | 'md' | 'lg';

interface LoadingOverlayProps {
  isLoading?: boolean;
  message?: string;
  submessage?: string;
  variant?: LoadingVariant;
  size?: LoadingSize;
  showProgress?: boolean;
  progress?: number;
  fullScreen?: boolean;
  blur?: boolean;
  transparent?: boolean;
  icon?: React.ReactNode;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading = true,
  message = 'Carregando...',
  submessage,
  variant = 'default',
  size = 'md',
  showProgress = false,
  progress = 0,
  fullScreen = true,
  blur = false,
  transparent = false,
  icon
}) => {
  const [dots, setDots] = useState('');
  const [techIconIndex, setTechIconIndex] = useState(0);

  // Animação dos pontos
  useEffect(() => {
    if (variant === 'dots') {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [variant]);

  // Rotação dos ícones tech
  useEffect(() => {
    if (variant === 'tech') {
      const interval = setInterval(() => {
        setTechIconIndex(prev => (prev + 1) % 4);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [variant]);

  if (!isLoading) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-4',
          icon: 'h-8 w-8',
          text: 'text-sm',
          subtext: 'text-xs'
        };
      case 'lg':
        return {
          container: 'p-8',
          icon: 'h-16 w-16',
          text: 'text-xl',
          subtext: 'text-base'
        };
      default:
        return {
          container: 'p-6',
          icon: 'h-12 w-12',
          text: 'text-base',
          subtext: 'text-sm'
        };
    }
  };

  const sizes = getSizeClasses();
  const techIcons = [Package, Server, Cpu, HardDrive];
  const TechIcon = techIcons[techIconIndex];

  const renderLoader = () => {
    switch (variant) {
      case 'minimal':
        return (
          <div className="flex flex-col items-center">
            <Loader2 className={`${sizes.icon} text-blue-600 animate-spin`} />
          </div>
        );

      case 'tech':
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className={`${sizes.icon} text-blue-600 transition-all duration-500 transform`}>
                <TechIcon className="w-full h-full animate-pulse" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
              </div>
            </div>
            <div className="text-center">
              <p className={`${sizes.text} font-semibold text-gray-800`}>{message}</p>
              {submessage && (
                <p className={`${sizes.subtext} text-gray-500 mt-1`}>{submessage}</p>
              )}
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className="flex flex-col items-center space-y-4 w-64">
            <Loader2 className={`${sizes.icon} text-blue-600 animate-spin`} />
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <p className={`${sizes.text} font-medium text-gray-800`}>{message}</p>
                <span className={`${sizes.subtext} text-gray-500`}>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {submessage && (
                <p className={`${sizes.subtext} text-gray-500 mt-2 text-center`}>{submessage}</p>
              )}
            </div>
          </div>
        );

      case 'dots':
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-2">
              <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className={`${sizes.text} font-medium text-gray-800`}>
              {message}{dots}
            </p>
            {submessage && (
              <p className={`${sizes.subtext} text-gray-500`}>{submessage}</p>
            )}
          </div>
        );

      case 'pulse':
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className={`${sizes.icon} bg-blue-600 rounded-full animate-ping absolute`}></div>
              <div className={`${sizes.icon} bg-blue-600 rounded-full relative flex items-center justify-center`}>
                {icon || <Wifi className="h-6 w-6 text-white" />}
              </div>
            </div>
            <div className="text-center">
              <p className={`${sizes.text} font-medium text-gray-800`}>{message}</p>
              {submessage && (
                <p className={`${sizes.subtext} text-gray-500 mt-1`}>{submessage}</p>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center space-x-4">
            {icon || <Loader2 className={`${sizes.icon} text-blue-600 animate-spin`} />}
            <div>
              <p className={`${sizes.text} font-semibold text-gray-800`}>{message}</p>
              {submessage && (
                <p className={`${sizes.subtext} text-gray-500 mt-1`}>{submessage}</p>
              )}
            </div>
          </div>
        );
    }
  };

  const overlayClasses = `
    ${fullScreen ? 'fixed inset-0' : 'absolute inset-0'}
    ${transparent ? 'bg-white/80' : 'bg-black/40'}
    ${blur ? 'backdrop-blur-sm' : ''}
    flex items-center justify-center z-50
    transition-all duration-300 ease-in-out
  `;

  const containerClasses = `
    ${transparent ? '' : 'bg-white'}
    ${sizes.container}
    rounded-2xl
    ${transparent ? '' : 'shadow-2xl'}
    ${variant === 'minimal' ? '' : 'min-w-[200px]'}
    transform transition-all duration-300 ease-in-out
    ${transparent ? '' : 'backdrop-blur-lg bg-white/95'}
  `;

  return (
    <div className={overlayClasses}>
      <div className={containerClasses}>
        {renderLoader()}
      </div>
    </div>
  );
};

// Loading Skeleton Component
export const LoadingSkeleton: React.FC<{ 
  lines?: number; 
  className?: string;
  animate?: boolean;
}> = ({ 
  lines = 3, 
  className = '',
  animate = true 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded ${
            animate ? 'animate-pulse' : ''
          }`}
          style={{
            width: `${Math.random() * 40 + 60}%`,
            animationDelay: `${i * 100}ms`
          }}
        />
      ))}
    </div>
  );
};

// Componente de demonstração
export const LoadingDemo: React.FC = () => {
  const [loadingStates, setLoadingStates] = useState({
    default: false,
    minimal: false,
    tech: false,
    progress: false,
    dots: false,
    pulse: false
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (loadingStates.progress) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setLoadingStates(prev => ({ ...prev, progress: false }));
            return 0;
          }
          return prev + 10;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [loadingStates.progress]);

  const toggleLoading = (variant: keyof typeof loadingStates) => {
    setLoadingStates(prev => ({ ...prev, [variant]: !prev[variant] }));
    if (variant === 'progress') setProgress(0);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Loading Overlays</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
        <button
          onClick={() => toggleLoading('default')}
          className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h3 className="font-semibold mb-2">Default</h3>
          <p className="text-sm text-gray-600">Loading padrão com mensagem</p>
        </button>

        <button
          onClick={() => toggleLoading('minimal')}
          className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h3 className="font-semibold mb-2">Minimal</h3>
          <p className="text-sm text-gray-600">Apenas o spinner</p>
        </button>

        <button
          onClick={() => toggleLoading('tech')}
          className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h3 className="font-semibold mb-2">Tech</h3>
          <p className="text-sm text-gray-600">Ícones de tecnologia animados</p>
        </button>

        <button
          onClick={() => toggleLoading('progress')}
          className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h3 className="font-semibold mb-2">Progress</h3>
          <p className="text-sm text-gray-600">Com barra de progresso</p>
        </button>

        <button
          onClick={() => toggleLoading('dots')}
          className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h3 className="font-semibold mb-2">Dots</h3>
          <p className="text-sm text-gray-600">Pontos animados</p>
        </button>

        <button
          onClick={() => toggleLoading('pulse')}
          className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h3 className="font-semibold mb-2">Pulse</h3>
          <p className="text-sm text-gray-600">Efeito de pulso</p>
        </button>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold">Loading Skeleton</h3>
        <div className="bg-white p-6 rounded-lg shadow max-w-md">
          <LoadingSkeleton lines={4} />
        </div>
      </div>

      {/* Loading Overlays */}
      <LoadingOverlay
        isLoading={loadingStates.default}
        message="Carregando dados..."
        submessage="Por favor, aguarde"
      />

      <LoadingOverlay
        isLoading={loadingStates.minimal}
        variant="minimal"
        size="lg"
      />

      <LoadingOverlay
        isLoading={loadingStates.tech}
        variant="tech"
        message="Sincronizando equipamentos"
        submessage="Conectando ao servidor..."
      />

      <LoadingOverlay
        isLoading={loadingStates.progress}
        variant="progress"
        message="Fazendo upload"
        submessage="large_file.pdf"
        progress={progress}
      />

      <LoadingOverlay
        isLoading={loadingStates.dots}
        variant="dots"
        message="Processando"
        blur
      />

      <LoadingOverlay
        isLoading={loadingStates.pulse}
        variant="pulse"
        message="Estabelecendo conexão"
        transparent
      />
    </div>
  );
};

export default LoadingOverlay;