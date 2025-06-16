import React from 'react';
import { 
  CheckCircle, 
  Settings, 
  XCircle, 
  Info,
  AlertTriangle,
  Clock,
  Zap,
  Shield
} from 'lucide-react';

type BadgeVariant = 'ativo' | 'manutenção' | 'desativado' | 'default' | 'warning' | 'info' | 'success' | 'error';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variante?: BadgeVariant;
  size?: BadgeSize;
  icon?: boolean;
  pulse?: boolean;
  outlined?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variante = 'default',
  size = 'md',
  icon = true,
  pulse = false,
  outlined = false,
  className = '' 
}) => {
  const getVariantClasses = () => {
    if (outlined) {
      switch (variante) {
        case 'ativo':
        case 'success':
          return 'border-2 border-green-500 text-green-700 bg-green-50';
        case 'manutenção':
        case 'warning':
          return 'border-2 border-yellow-500 text-yellow-700 bg-yellow-50';
        case 'desativado':
        case 'error':
          return 'border-2 border-red-500 text-red-700 bg-red-50';
        case 'info':
          return 'border-2 border-blue-500 text-blue-700 bg-blue-50';
        default:
          return 'border-2 border-gray-500 text-gray-700 bg-gray-50';
      }
    }

    switch (variante) {
      case 'ativo':
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/25';
      case 'manutenção':
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-yellow-500/25';
      case 'desativado':
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/25';
      case 'info':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/25';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-gray-500/25';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-4 py-1.5 text-sm';
      default:
        return 'px-3 py-1 text-xs';
    }
  };

  const getIcon = () => {
    if (!icon) return null;

    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;
    
    switch (variante) {
      case 'ativo':
      case 'success':
        return <CheckCircle size={iconSize} className="mr-1" />;
      case 'manutenção':
        return <Settings size={iconSize} className="mr-1 animate-spin-slow" />;
      case 'warning':
        return <AlertTriangle size={iconSize} className="mr-1" />;
      case 'desativado':
      case 'error':
        return <XCircle size={iconSize} className="mr-1" />;
      case 'info':
        return <Info size={iconSize} className="mr-1" />;
      default:
        return <Shield size={iconSize} className="mr-1" />;
    }
  };

  const pulseClass = pulse && (variante === 'ativo' || variante === 'manutenção') 
    ? 'animate-pulse' 
    : '';

  const shadowClass = !outlined ? 'shadow-lg' : '';

  return (
    <span 
      className={`
        inline-flex items-center font-semibold rounded-full 
        ${getVariantClasses()} 
        ${getSizeClasses()} 
        ${shadowClass}
        ${pulseClass}
        transition-all duration-200 hover:scale-105 hover:shadow-xl
        ${className}
      `}
    >
      {getIcon()}
      {children}
      {pulse && (
        <span className="relative flex h-2 w-2 ml-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
    </span>
  );
};

// Componente de demonstração
const BadgeDemo: React.FC = () => {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Badges - Sistema de Controle de TI</h2>
      
      <div className="space-y-8">
        {/* Badges Padrão */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Badges de Status (Padrão)</h3>
          <div className="flex flex-wrap gap-3">
            <Badge variante="ativo">Ativo</Badge>
            <Badge variante="manutenção">Em Manutenção</Badge>
            <Badge variante="desativado">Desativado</Badge>
            <Badge variante="info">Informação</Badge>
            <Badge variante="warning">Atenção</Badge>
            <Badge variante="success">Sucesso</Badge>
            <Badge variante="error">Erro</Badge>
            <Badge>Padrão</Badge>
          </div>
        </div>

        {/* Badges Outlined */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Badges Outlined</h3>
          <div className="flex flex-wrap gap-3">
            <Badge variante="ativo" outlined>Ativo</Badge>
            <Badge variante="manutenção" outlined>Em Manutenção</Badge>
            <Badge variante="desativado" outlined>Desativado</Badge>
            <Badge variante="info" outlined>Informação</Badge>
            <Badge variante="warning" outlined>Atenção</Badge>
          </div>
        </div>

        {/* Tamanhos */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Tamanhos</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Badge size="sm" variante="ativo">Pequeno</Badge>
            <Badge size="md" variante="manutenção">Médio</Badge>
            <Badge size="lg" variante="info">Grande</Badge>
          </div>
        </div>

        {/* Sem Ícones */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Sem Ícones</h3>
          <div className="flex flex-wrap gap-3">
            <Badge variante="ativo" icon={false}>Ativo</Badge>
            <Badge variante="manutenção" icon={false}>Em Manutenção</Badge>
            <Badge variante="desativado" icon={false}>Desativado</Badge>
          </div>
        </div>

        {/* Com Pulse */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Com Animação Pulse</h3>
          <div className="flex flex-wrap gap-3">
            <Badge variante="ativo" pulse>Online</Badge>
            <Badge variante="manutenção" pulse>Processando</Badge>
            <Badge variante="warning" pulse outlined>Aguardando</Badge>
          </div>
        </div>

        {/* Casos de Uso */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Casos de Uso Específicos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium mb-2">Status de Equipamento</h4>
              <div className="flex gap-2">
                <Badge variante="ativo" size="sm">PAT-001</Badge>
                <Badge variante="manutenção" size="sm">PAT-002</Badge>
                <Badge variante="desativado" size="sm">PAT-003</Badge>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium mb-2">Notificações</h4>
              <div className="flex gap-2">
                <Badge variante="info" pulse size="sm">5 Novos</Badge>
                <Badge variante="warning" outlined size="sm">2 Pendentes</Badge>
                <Badge variante="error" size="sm">1 Urgente</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Badge;