import React from 'react';
import { 
  Home, 
  Laptop, 
  FileText, 
  PlusCircle,
  LogOut,
  HelpCircle,
  CircleUser,
  Menu,
  X,
  BarChart3,
  Package,
  Building2,
  ChevronRight
} from 'lucide-react';
import logo from '/assets/images/logo.png';


interface SidebarProps {
  isOpen: boolean;
  activeRoute: string;
  onNavigate: (route: string) => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeRoute, onNavigate, onClose }) => {
  const menuItems = [
    { 
      name: 'Página Inicial', 
      icon: <Home size={20} />, 
      route: 'dashboard',
      description: 'Visão geral'
    },
    { 
      name: 'Equipamentos', 
      icon: <Laptop size={20} />, 
      route: 'equipment',
      description: 'Gestão de ativos'
    },
    { 
      name: 'Adicionar Novo', 
      icon: <PlusCircle size={20} />, 
      route: 'add-equipment',
      description: 'Cadastrar equipamento'
    },
    { 
      name: 'Relatórios', 
      icon: <BarChart3 size={20} />, 
      route: 'reports',
      description: 'Análises e dados'
    },
  ];

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-gray-800 transform transition-transform duration-300 ease-in-out shadow-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 flex flex-col h-screen`}
      >
        <div className="flex flex-col h-full">
          {/* Header - FIXO */}
          <div className="flex items-center justify-between h-20 border-b border-gray-700 bg-gray-800/95 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center -ml-4">
              <img src={logo} alt="Logo" className="w-auto" style={{height: '120px'}}/>
              <span className="ml-2 text-lg font-semibold text-white"></span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700 mr-4"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation - SCROLLÁVEL */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-1">
              {menuItems.map((item, index) => (
                <div key={item.route} className="relative">
                  <button
                    className={`relative flex items-center w-full px-4 py-3.5 rounded-lg transition-all duration-200 group ${
                      activeRoute === item.route
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    onClick={() => {
                      onNavigate(item.route);
                      onClose();
                    }}
                  >
                    <span className={`mr-3 transition-transform duration-200 ${
                      activeRoute === item.route ? 'scale-110' : 'group-hover:scale-110'
                    }`}>
                      {item.icon}
                    </span>
                    <div className="flex-1 text-left">
                      <span className="block font-medium text-sm">{item.name}</span>
                      <span className={`text-xs mt-0.5 ${
                        activeRoute === item.route ? 'text-white/80' : 'text-gray-400'
                      }`}>
                        {item.description}
                      </span>
                    </div>
                    <ChevronRight 
                      size={16} 
                      className={`transition-all duration-200 ${
                        activeRoute === item.route 
                          ? 'opacity-100 translate-x-0' 
                          : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                      }`}
                    />
                  </button>
                  {activeRoute === item.route && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-blue-500 rounded-r-full"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Support Section */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Suporte & Ajuda
              </h3>
              <div className="space-y-1">
                <button className="flex items-center w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 group">
                  <HelpCircle size={20} className="mr-3 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <span className="block text-sm">Ajuda & Suporte</span>
                    <span className="text-xs text-gray-400">Central de atendimento</span>
                  </div>
                </button>
              </div>
            </div>
          </nav>

          {/* User Profile - FIXO */}
          <div className="p-4 border-t border-gray-700 bg-gray-700/30 flex-shrink-0">
            <div className="flex items-center space-x-3 mb-4 p-3 rounded-lg bg-gray-700/50">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                  <CircleUser size={24} className="text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Administrador</p>
                <p className="text-xs text-gray-400">admin@exemplo.com</p>
              </div>
            </div>
            <button className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-all duration-200 group">
              <LogOut size={18} className="mr-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">Sair do Sistema</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        ></div>
      )}
    </>
  );
};

export default Sidebar;