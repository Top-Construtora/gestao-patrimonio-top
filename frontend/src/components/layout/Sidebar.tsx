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
        className={`fixed left-0 z-30 bg-secondary transform transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'w-[70px]' : 'w-[260px]'}
          lg:translate-x-0
          top-[77px] bottom-0
          rounded-tr-[15px]
          border-r border-white/10`}
        aria-label="Menu principal"
        style={{ height: 'calc(100vh - 77px)' }}
      >
        {/* Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-secondary border border-white/20 rounded-full items-center justify-center text-white/80 hover:text-white hover:bg-secondary-light transition-all z-50 shadow-lg"
          aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute right-3 top-3 text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-6 px-3">
          {navSections.map((section, sectionIndex) => (
            <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
              {/* Section Title */}
              {!isCollapsed && (
                <div className="px-3 mb-2">
                  <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
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
                          className={`relative flex items-center w-full px-3 py-3 rounded-lg transition-all duration-200 group
                            ${isRouteActive(undefined, item.children)
                              ? 'bg-white/15 text-white'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                          {isRouteActive(undefined, item.children) && (
                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-white rounded-r" />
                          )}
                          <span className={`${isCollapsed ? '' : 'mr-3'} transition-all`}>
                            {item.icon}
                          </span>
                          {!isCollapsed && (
                            <>
                              <span className="flex-1 text-left text-sm font-medium">{item.name}</span>
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
                            <div className="mx-2 my-1 bg-black/15 rounded-lg">
                              {item.children.map((child) => (
                                <button
                                  key={child.route}
                                  onClick={() => {
                                    onNavigate(child.route);
                                    onClose();
                                  }}
                                  className={`relative flex items-center w-full px-4 py-2.5 text-sm transition-all duration-200
                                    ${activeRoute === child.route
                                      ? 'bg-black/10 text-white'
                                      : 'text-white/70 hover:bg-black/8 hover:text-white'
                                    }`}
                                >
                                  <span className="mr-3">{child.icon}</span>
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
                        className={`relative flex items-center w-full px-3 py-3 rounded-lg transition-all duration-200 group
                          ${activeRoute === item.route
                            ? 'bg-white/15 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                      >
                        {activeRoute === item.route && (
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-white rounded-r" />
                        )}
                        <span className={`${isCollapsed ? '' : 'mr-3'} transition-all`}>
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <span className="text-sm font-medium">{item.name}</span>
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
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3 mb-3 p-3 rounded-lg bg-white/5">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center shadow-md">
                  <CircleUser size={22} className="text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-secondary"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">Administrador</p>
                <p className="text-xs text-white/50 truncate">admin@exemplo.com</p>
              </div>
            </div>
            <button
              className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200 group"
              aria-label="Sair do sistema"
            >
              <LogOut size={18} className="mr-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">Sair do Sistema</span>
            </button>
          </div>
        )}

        {/* Collapsed user icon */}
        {isCollapsed && (
          <div className="p-3 border-t border-white/10 flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center">
                <CircleUser size={22} className="text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-secondary"></div>
            </div>
            <button
              className="p-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-all"
              aria-label="Sair do sistema"
            >
              <LogOut size={18} />
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
