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
      name: 'Dashboard', 
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
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-secondary transform transition-transform duration-300 ease-in-out shadow-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-20 px-5 border-b border-secondary-light bg-secondary/95 backdrop-blur-sm">
            <div className="flex items-center">
              <img src={logo} alt="Logo"/>
              <span className="ml-2 text-lg font-semibold text-white"></span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-secondary-light"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-1">
              {menuItems.map((item, index) => (
                <div key={item.route} className="relative">
                  <button
                    className={`relative flex items-center w-full px-4 py-3.5 rounded-lg transition-all duration-200 group ${
                      activeRoute === item.route
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : 'text-gray-300 hover:bg-secondary-light hover:text-white'
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
                        activeRoute === item.route ? 'text-white/80' : 'text-blue-400/60'
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
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-accent rounded-r-full"></div>
                  )}
                </div>
              ))}
            </div>
            </nav>

            {/* Support Section */}
            <div className="mt-8 pt-6 border-t border-secondary-light">
              <h3 className="px-4 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
                Suporte & Ajuda
              </h3>
              <div className="space-y-1">
                <button className="flex items-center w-full px-4 py-3 rounded-lg text-blue-300 hover:bg-secondary-light hover:text-white transition-all duration-200 group">
                  <HelpCircle size={20} className="mr-3 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <span className="block text-sm">Ajuda & Suporte</span>
                    <span className="text-xs text-blue-400/60">Central de atendimento</span>
                  </div>
                </button>
              </div>
            </div>

          {/* User Profile */}
          <div className="p-4 border-t border-secondary-light bg-secondary-light/30">

            <div className="flex items-center space-x-3 mb-4 p-3 rounded-lg bg-secondary-light/50">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                  <CircleUser size={24} className="text-secondary" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-secondary"></div>
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