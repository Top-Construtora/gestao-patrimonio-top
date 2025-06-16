import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost' | 'link';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  shadow?: boolean;
  pulse?: boolean;
  gradient?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  isLoading = false,
  loadingText,
  rounded = 'md',
  shadow = true,
  pulse = false,
  gradient = false,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantClasses = () => {
    const baseTransition = 'transition-all duration-200 ease-in-out transform active:scale-95';
    
    if (gradient) {
      switch (variant) {
        case 'primary':
          return `bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white ${shadow ? 'shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30' : ''} ${baseTransition}`;
        case 'secondary':
          return `bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white ${shadow ? 'shadow-lg shadow-gray-500/25 hover:shadow-xl hover:shadow-gray-500/30' : ''} ${baseTransition}`;
        case 'danger':
          return `bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white ${shadow ? 'shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30' : ''} ${baseTransition}`;
        case 'success':
          return `bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white ${shadow ? 'shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30' : ''} ${baseTransition}`;
        default:
          return `bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white ${shadow ? 'shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30' : ''} ${baseTransition}`;
      }
    }

    switch (variant) {
      case 'primary':
        return `bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white ${shadow ? 'shadow-md hover:shadow-lg' : ''} ${baseTransition}`;
      case 'secondary':
        return `bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white ${shadow ? 'shadow-md hover:shadow-lg' : ''} ${baseTransition}`;
      case 'outline':
        return `bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 focus:ring-gray-500 text-gray-700 ${shadow ? 'shadow-sm hover:shadow-md' : ''} ${baseTransition}`;
      case 'danger':
        return `bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white ${shadow ? 'shadow-md hover:shadow-lg' : ''} ${baseTransition}`;
      case 'success':
        return `bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white ${shadow ? 'shadow-md hover:shadow-lg' : ''} ${baseTransition}`;
      case 'ghost':
        return `bg-transparent hover:bg-gray-100 focus:ring-gray-500 text-gray-700 ${baseTransition}`;
      case 'link':
        return `bg-transparent hover:bg-transparent focus:ring-0 text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline ${baseTransition}`;
      default:
        return `bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white ${shadow ? 'shadow-md hover:shadow-lg' : ''} ${baseTransition}`;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'px-2.5 py-1 text-xs font-medium';
      case 'sm':
        return 'px-3 py-1.5 text-sm font-medium';
      case 'lg':
        return 'px-6 py-3 text-lg font-semibold';
      case 'xl':
        return 'px-8 py-4 text-xl font-semibold';
      default:
        return 'px-4 py-2 text-base font-medium';
    }
  };

  const getRoundedClasses = () => {
    switch (rounded) {
      case 'sm':
        return 'rounded-sm';
      case 'lg':
        return 'rounded-lg';
      case 'full':
        return 'rounded-full';
      default:
        return 'rounded-md';
    }
  };

  const iconElement = icon && !isLoading && (
    <span className={`inline-flex items-center ${iconPosition === 'left' ? 'mr-2' : 'ml-2'}`}>
      {icon}
    </span>
  );

  const loadingElement = isLoading && (
    <Loader2 
      className={`animate-spin ${loadingText ? 'mr-2' : ''} ${size === 'xs' ? 'h-3 w-3' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}`} 
    />
  );

  return (
    <button
      className={`
        inline-flex items-center justify-center
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${getRoundedClasses()}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}
        ${pulse && !disabled && !isLoading ? 'animate-pulse' : ''}
        ${variant !== 'link' ? 'relative overflow-hidden' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Ripple Effect Background */}
      {variant !== 'link' && variant !== 'ghost' && (
        <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></span>
      )}
      
      {/* Content */}
      <span className="relative flex items-center">
        {isLoading && loadingElement}
        {iconPosition === 'left' && !isLoading && iconElement}
        {isLoading && loadingText ? loadingText : children}
        {iconPosition === 'right' && !isLoading && iconElement}
      </span>
    </button>
  );
};

// Componente de demonstração
const ButtonDemo: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Botões - Sistema de Controle de TI</h2>
      
      <div className="space-y-8">
        {/* Variantes */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Variantes</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>

        {/* Tamanhos */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Tamanhos</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
          </div>
        </div>

        {/* Com Gradiente */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Com Gradiente</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" gradient>Primary Gradient</Button>
            <Button variant="danger" gradient>Danger Gradient</Button>
            <Button variant="success" gradient>Success Gradient</Button>
          </div>
        </div>

        {/* Com Ícones */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Com Ícones</h3>
          <div className="flex flex-wrap gap-3">
            <Button icon={<span>📦</span>}>Adicionar Item</Button>
            <Button icon={<span>✏️</span>} variant="outline">Editar</Button>
            <Button icon={<span>🗑️</span>} variant="danger" iconPosition="right">Excluir</Button>
          </div>
        </div>

        {/* Bordas Arredondadas */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Bordas Arredondadas</h3>
          <div className="flex flex-wrap gap-3">
            <Button rounded="sm">Small Radius</Button>
            <Button rounded="md">Medium Radius</Button>
            <Button rounded="lg">Large Radius</Button>
            <Button rounded="full">Full Radius</Button>
          </div>
        </div>

        {/* Estados */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Estados</h3>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleClick} isLoading={loading}>
              Clique para Loading
            </Button>
            <Button isLoading loadingText="Salvando...">
              Com Texto
            </Button>
            <Button disabled>Desabilitado</Button>
            <Button pulse variant="success">Com Pulse</Button>
          </div>
        </div>

        {/* Full Width */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Full Width</h3>
          <div className="max-w-md">
            <Button fullWidth variant="primary" gradient>
              Botão Full Width
            </Button>
          </div>
        </div>

        {/* Sem Sombra */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Sem Sombra</h3>
          <div className="flex flex-wrap gap-3">
            <Button shadow={false}>Sem Sombra</Button>
            <Button variant="outline" shadow={false}>Outline Sem Sombra</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Button;