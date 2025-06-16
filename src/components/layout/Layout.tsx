import React, { useState } from 'react';
import Sidebar from  './Sidebar';
import { Menu, Calendar } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeRoute: string;
  onNavigate: (route: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeRoute, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Obter data atual
  const getCurrentDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const dateStr = date.toLocaleDateString('pt-BR', options);
    // Capitalizar o dia da semana
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  };

  const routeLabels: Record<string, string> = {
    dashboard: 'Página Inicial',
    equipment: 'Equipamentos',
    'equipment-details': 'Detalhes do Equipamento',
    'add-equipment': 'Adicionar Equipamento',
    'edit-equipment': 'Editar Equipamento',
    reports: 'Relatórios',
    inventory: 'Patrimônio',
    construction: 'Obras',
    purchases: 'Equipamentos a Adquirir',
    'add-purchase': 'Nova Solicitação de Compra',
    'edit-purchase': 'Editar Solicitação',
    'purchase-details': 'Detalhes da Solicitação'
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        activeRoute={activeRoute} 
        onNavigate={onNavigate}
        onClose={closeSidebar}
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header - FIXO */}
        <header className="bg-white shadow-sm z-10 border-b border-gray-200 flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              {/* Lado Esquerdo - Título e Data */}
              <div className="flex items-center">
                <button
                  type="button"
                  className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors mr-3"
                  onClick={toggleSidebar}
                >
                  <Menu className="h-5 w-5" />
                </button>
                
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Sistema de Controle de Equipamentos</h1>
                  <div className="flex items-center text-sm text-gray-500 mt-0.5">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span>{getCurrentDate()}</span>
                  </div>
                </div>
              </div>

              {/* Lado Direito - Usuário */}
              <div className="flex items-center">
                <span className="text-sm font-bold text-gray-600 mr-3 hidden sm:block">Administrador do Sistema</span>
                <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold">
                  A
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Breadcrumb - FIXO */}
        <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-2.5 border-b border-gray-200 flex-shrink-0">
          <nav className="flex items-center text-sm">
            <span className="text-gray-500">Sistema</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-blue-600 font-medium">{routeLabels[activeRoute] || activeRoute}</span>
          </nav>
        </div>
        
        {/* Main Content - SCROLLÁVEL */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="animate-fadeIn">
              {children}
            </div>
          </div>
        </main>
        
        {/* Footer - FIXO */}
        <footer className="bg-white border-t border-gray-200 flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
              <span>GIO - Sistema de Controle de Patrimônio © {new Date().getFullYear()}</span>
              <span className="mt-1 sm:mt-0">Versão 1.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;