import React, { useState } from 'react';
import {
  Home,
  Laptop,
  PlusCircle,
  LogOut,
  HelpCircle,
  CircleUser,
  X,
  BarChart3,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Settings,
  Headphones
} from 'lucide-react';
import logo from '/assets/images/logo.png';

interface NavItem {
  name: string;
  icon: React.ReactNode;
  route?: string;
  description?: string;
  children?: { name: string; icon: React.ReactNode; route: string }[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  activeRoute: string;
  onNavigate: (route: string) => void;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  activeRoute,
  onNavigate,
  onClose,
  onToggleCollapse
}) => {
  const [expandedDropdowns, setExpandedDropdowns] = useState<string[]>([]);

  const toggleDropdown = (itemName: string) => {
    setExpandedDropdowns(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const navSections: NavSection[] = [
    {
      title: 'PRINCIPAL',
      items: [
        {
          name: 'Dashboard',
          icon: <Home size={20} />,
          route: 'dashboard',
        },
        {
          name: 'Equipamentos',
          icon: <Laptop size={20} />,
          children: [
            { name: 'Listar Todos', icon: <Laptop size={18} />, route: 'equipment' },
            { name: 'Adicionar Novo', icon: <PlusCircle size={18} />, route: 'add-equipment' },
          ]
        },
        {
          name: 'Compras',
          icon: <ShoppingCart size={20} />,
          children: [
            { name: 'Solicitações', icon: <ShoppingCart size={18} />, route: 'purchases' },
            { name: 'Nova Solicitação', icon: <PlusCircle size={18} />, route: 'add-purchase' },
          ]
        },
      ]
    },
    {
      title: 'ANÁLISES',
      items: [
        {
          name: 'Relatórios',
          icon: <BarChart3 size={20} />,
          route: 'reports',
        },
      ]
    },
    {
      title: 'CONFIGURAÇÕES',
      items: [
        {
          name: 'Configurações',
          icon: <Settings size={20} />,
          route: 'settings',
        },
      ]
    },
    {
      title: 'AJUDA',
      items: [
        {
          name: 'Suporte',
          icon: <Headphones size={20} />,
          route: 'support',
        },
      ]
    },
  ];

  const isRouteActive = (route?: string, children?: NavItem['children']) => {
    if (route) return activeRoute === route;
    if (children) return children.some(child => activeRoute === child.route);
    return false;
  };

  return (
    <>
      <nav
        className={`fixed left-0 z-30 bg-gray-800 transform transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'w-[70px]' : 'w-[250px]'}
          lg:translate-x-0
          top-[64px] bottom-0
          border-r border-gray-700`}
        aria-label="Menu principal"
        style={{ height: 'calc(100vh - 64px)' }}
      >
        {/* Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-gray-800 border border-gray-600 rounded-full items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all z-50 shadow-lg"
          aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute right-3 top-3 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-3 sidebar-scroll">
          {navSections.map((section, sectionIndex) => (
            <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
              {/* Section Title */}
              {!isCollapsed && (
                <div className="px-3 mb-2">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </span>
                </div>
              )}

              {/* Section Items */}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.name}>
                    {item.children ? (
                      // Item with dropdown
                      <div>
                        <button
                          onClick={() => !isCollapsed && toggleDropdown(item.name)}
                          className={`relative flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 group
                            ${isRouteActive(undefined, item.children)
                              ? 'bg-primary/15 text-primary'
                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                          {isRouteActive(undefined, item.children) && (
                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r" />
                          )}
                          <span className={`${isCollapsed ? '' : 'mr-3'} transition-all ${isRouteActive(undefined, item.children) ? 'text-primary' : 'text-gray-400'}`}>
                            {item.icon}
                          </span>
                          {!isCollapsed && (
                            <>
                              <span className="flex-1 text-left text-[0.85rem] font-medium">{item.name}</span>
                              <ChevronDown
                                size={16}
                                className={`transition-transform duration-200 ${
                                  expandedDropdowns.includes(item.name) ? 'rotate-180' : ''
                                }`}
                              />
                            </>
                          )}
                        </button>

                        {/* Dropdown */}
                        {!isCollapsed && (
                          <div
                            className={`overflow-hidden transition-all duration-300 ${
                              expandedDropdowns.includes(item.name) ? 'max-h-[500px]' : 'max-h-0'
                            }`}
                          >
                            <div className="ml-4 mt-1 border-l border-gray-700">
                              {item.children.map((child) => (
                                <button
                                  key={child.route}
                                  onClick={() => {
                                    onNavigate(child.route);
                                    onClose();
                                  }}
                                  className={`relative flex items-center w-full pl-4 pr-3 py-2 text-[0.8rem] transition-all duration-200 rounded-r-lg mx-1
                                    ${activeRoute === child.route
                                      ? 'bg-primary/10 text-primary'
                                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                    }`}
                                >
                                  <span className={`mr-3 ${activeRoute === child.route ? 'text-primary' : ''}`}>{child.icon}</span>
                                  <span>{child.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Simple item
                      <button
                        onClick={() => {
                          if (item.route) {
                            onNavigate(item.route);
                            onClose();
                          }
                        }}
                        className={`relative flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 group
                          ${activeRoute === item.route
                            ? 'bg-primary/15 text-primary'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}
                      >
                        {activeRoute === item.route && (
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r" />
                        )}
                        <span className={`${isCollapsed ? '' : 'mr-3'} transition-all ${activeRoute === item.route ? 'text-primary' : 'text-gray-400'}`}>
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <span className="text-[0.85rem] font-medium">{item.name}</span>
                        )}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* User Profile - Footer */}
        {!isCollapsed && (
          <div className="p-3 border-t border-gray-700/50">
            <div className="flex items-center space-x-3 mb-3 p-2.5 rounded-lg bg-gray-700/30">
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                  <CircleUser size={20} className="text-primary" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">Administrador</p>
                <p className="text-xs text-gray-500 truncate">admin@exemplo.com</p>
              </div>
            </div>
            <button
              className="flex items-center justify-center w-full px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group"
              aria-label="Sair do sistema"
            >
              <LogOut size={16} className="mr-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">Sair</span>
            </button>
          </div>
        )}

        {/* Collapsed user icon */}
        {isCollapsed && (
          <div className="p-3 border-t border-gray-700/50 flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                <CircleUser size={20} className="text-primary" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-800"></div>
            </div>
            <button
              className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
              aria-label="Sair do sistema"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;
