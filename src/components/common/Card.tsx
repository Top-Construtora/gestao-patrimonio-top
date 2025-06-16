import React from 'react';
import { X, MoreVertical, ChevronRight, Info, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

type CardVariant = 'default' | 'bordered' | 'elevated' | 'gradient' | 'glass';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';
type CardStatus = 'default' | 'info' | 'success' | 'warning' | 'error';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  status?: CardStatus;
  hoverable?: boolean;
  clickable?: boolean;
  dismissible?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  bodyClassName?: string;
  onClick?: () => void;
  onDismiss?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  title,
  subtitle,
  icon,
  actions,
  footer,
  variant = 'default',
  padding = 'md',
  status = 'default',
  hoverable = false,
  clickable = false,
  dismissible = false,
  collapsible = false,
  defaultCollapsed = false,
  className = '',
  bodyClassName = '',
  onClick,
  onDismiss
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [isDismissed, setIsDismissed] = React.useState(false);

  if (isDismissed) return null;

  const getVariantClasses = () => {
    switch (variant) {
      case 'bordered':
        return 'bg-white border-2 border-gray-200';
      case 'elevated':
        return 'bg-white shadow-xl';
      case 'gradient':
        return 'bg-gradient-to-br from-white to-gray-50 shadow-lg';
      case 'glass':
        return 'bg-white/80 backdrop-blur-md border border-white/20 shadow-xl';
      default:
        return 'bg-white shadow-md';
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'p-4';
      case 'lg':
        return 'p-8';
      default:
        return 'p-6';
    }
  };

  const getStatusClasses = () => {
    switch (status) {
      case 'info':
        return 'border-l-4 border-blue-500';
      case 'success':
        return 'border-l-4 border-green-500';
      case 'warning':
        return 'border-l-4 border-yellow-500';
      case 'error':
        return 'border-l-4 border-red-500';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const hoverClasses = hoverable ? 'hover:shadow-2xl hover:-translate-y-1' : '';
  const clickableClasses = clickable ? 'cursor-pointer active:scale-[0.99]' : '';
  const transitionClasses = 'transition-all duration-300 ease-in-out';

  return (
    <div 
      className={`
        rounded-xl overflow-hidden
        ${getVariantClasses()}
        ${getStatusClasses()}
        ${hoverClasses}
        ${clickableClasses}
        ${transitionClasses}
        ${className}
      `}
      onClick={clickable ? onClick : undefined}
    >
      {/* Header */}
      {(title || dismissible || collapsible || actions) && (
        <div className={`
          ${padding === 'none' ? 'px-6 py-4' : ''}
          ${title ? 'border-b border-gray-100' : ''}
          ${variant === 'gradient' ? 'bg-gradient-to-r from-gray-50 to-gray-100' : 'bg-gray-50/50'}
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {collapsible && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCollapsed(!isCollapsed);
                  }}
                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ChevronRight 
                    className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                      isCollapsed ? '' : 'rotate-90'
                    }`} 
                  />
                </button>
              )}
              
              {(icon || getStatusIcon()) && (
                <div className="flex-shrink-0">
                  {icon || getStatusIcon()}
                </div>
              )}
              
              {title && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  {subtitle && (
                    <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {actions}
              
              {dismissible && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss();
                  }}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors group"
                >
                  <X className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Body */}
      {!isCollapsed && (
        <div className={`
          ${getPaddingClasses()}
          ${bodyClassName}
          ${isCollapsed ? 'animate-collapse' : 'animate-expand'}
        `}>
          {children}
        </div>
      )}
      
      {/* Footer */}
      {footer && !isCollapsed && (
        <div className={`
          ${padding === 'none' ? 'px-6 py-4' : ''}
          border-t border-gray-100
          ${variant === 'gradient' ? 'bg-gradient-to-r from-gray-50 to-gray-100' : 'bg-gray-50/50'}
        `}>
          {footer}
        </div>
      )}
    </div>
  );
};

// Card Group Component
export const CardGroup: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  );
};

// Componente de demonstração
const CardDemo: React.FC = () => {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Cards - Sistema de Controle de TI</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Padrão */}
        <Card title="Card Padrão" subtitle="Com subtítulo">
          <p className="text-gray-600">
            Este é um card padrão com título e conteúdo básico.
          </p>
        </Card>

        {/* Card com Ícone e Ações */}
        <Card 
          title="Equipamento Ativo" 
          icon={<div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>}
          actions={
            <button className="p-2 hover:bg-gray-200 rounded-lg">
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>
          }
        >
          <p className="text-gray-600">
            Card com ícone personalizado e menu de ações.
          </p>
        </Card>

        {/* Card Elevado Hoverable */}
        <Card 
          title="Card Elevado" 
          variant="elevated" 
          hoverable
          footer={
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Atualizado há 2 horas</span>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                Ver mais
              </button>
            </div>
          }
        >
          <p className="text-gray-600">
            Card com sombra elevada e efeito hover.
          </p>
        </Card>

        {/* Card Gradient */}
        <Card 
          title="Card Gradient" 
          variant="gradient"
          subtitle="Design moderno"
        >
          <p className="text-gray-600">
            Card com fundo gradiente sutil.
          </p>
        </Card>

        {/* Card Glass */}
        <Card 
          title="Card Glass" 
          variant="glass"
          className="backdrop-blur-md"
        >
          <p className="text-gray-600">
            Efeito glassmorphism moderno.
          </p>
        </Card>

        {/* Card com Status */}
        <Card 
          title="Aviso Importante" 
          status="warning"
          dismissible
        >
          <p className="text-gray-600">
            Card com indicador de status e botão para fechar.
          </p>
        </Card>

        {/* Card Collapsible */}
        <Card 
          title="Card Recolhível" 
          collapsible
          defaultCollapsed={false}
        >
          <p className="text-gray-600">
            Clique na seta para expandir/recolher este card.
          </p>
        </Card>

        {/* Card Clickable */}
        <Card 
          title="Card Clicável" 
          variant="bordered"
          clickable
          hoverable
          onClick={() => alert('Card clicado!')}
        >
          <p className="text-gray-600">
            Clique em qualquer lugar do card.
          </p>
        </Card>

        {/* Card sem Padding */}
        <Card title="Imagem de Equipamento" padding="none">
          <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600"></div>
          <div className="p-4">
            <p className="text-gray-600">Card com imagem e padding customizado.</p>
          </div>
        </Card>

        {/* Card Info */}
        <Card 
          status="info"
          icon={<Info className="h-5 w-5 text-blue-500" />}
          title="Informação"
        >
          <p className="text-gray-600">
            Card com status informativo.
          </p>
        </Card>
      </div>

      {/* Card Group */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Card Group</h3>
        <CardGroup className="max-w-md">
          <Card variant="bordered" padding="sm">
            <p className="text-sm text-gray-600">Card 1 do grupo</p>
          </Card>
          <Card variant="bordered" padding="sm">
            <p className="text-sm text-gray-600">Card 2 do grupo</p>
          </Card>
          <Card variant="bordered" padding="sm">
            <p className="text-sm text-gray-600">Card 3 do grupo</p>
          </Card>
        </CardGroup>
      </div>
    </div>
  );
};

export default Card;