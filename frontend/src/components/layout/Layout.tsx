import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  activeRoute: string;
  onNavigate: (route: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeRoute, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const routeLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    equipment: 'Equipamentos',
    'equipment-details': 'Detalhes do Equipamento',
    'add-equipment': 'Adicionar Equipamento',
    'edit-equipment': 'Editar Equipamento',
    reports: 'Relatórios',
    inventory: 'Patrimônio',
    construction: 'Obras',
    purchases: 'Solicitações de Compra',
    'add-purchase': 'Nova Solicitação',
    'edit-purchase': 'Editar Solicitação',
    'purchase-details': 'Detalhes da Solicitação',
    settings: 'Configurações',
    support: 'Suporte'
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Header */}
      <Header onToggleSidebar={toggleSidebar} activeRoute={activeRoute} />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        activeRoute={activeRoute}
        onNavigate={onNavigate}
        onClose={closeSidebar}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Main Content Area */}
      <main
        className={`transition-all duration-300 pt-[64px] min-h-screen flex flex-col ${
          sidebarCollapsed ? 'lg:ml-[70px]' : 'lg:ml-[250px]'
        }`}
      >
        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="animate-fadeIn">
            {children}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
              <span>© {new Date().getFullYear()} GIO • Sistema de Controle de Patrimônio</span>
              <span className="mt-1 sm:mt-0">Versão 1.0</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
