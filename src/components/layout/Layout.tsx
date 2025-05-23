import React, { useState } from 'react';
import Sidebar from  './Sidebar';
import { Menu, Bell, Calendar, Clock } from 'lucide-react';

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

  // Obter data e hora atual
  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  // Atualizar hora a cada minuto
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  equipment: 'Equipamentos',
  'equipment-details': 'Detalhes do Equipamento',
  'add-equipment': 'Adicionar Equipamento',
  'edit-equipment': 'Editar Equipamento',
  reports: 'Relatórios',
  inventory: 'Patrimônio',
  construction: 'Obras'
};


  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        activeRoute={activeRoute} 
        onNavigate={onNavigate}
        onClose={closeSidebar}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header Aprimorado */}
        <header className="bg-white shadow-sm z-10 border-b border-gray-100">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Menu Mobile e Busca */}
              <div className="flex items-center flex-1">
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2.5 rounded-lg text-secondary hover:text-secondary-dark hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
                  onClick={toggleSidebar}
                >
                  <span className="sr-only">Abrir menu</span>
                  <Menu className="h-6 w-6" />
                </button>
                
              </div>

              {/* Informações e Ações */}
              <div className="flex items-center space-x-4">
                {/* Data e Hora */}
                <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                    <span className="capitalize">{getCurrentDate()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-blue-500" />
                    <span>{currentTime}</span>
                  </div>
                </div>

                {/* Badge do Usuário */}
                <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full pl-4 pr-5 py-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">A</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-gray-800">Administrador</p>
                  </div>
                </div>
              </div>
            </div>

            
          </div>
        </header>
        
        {/* Breadcrumb */}
        <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-3 border-b border-gray-200">
          <nav className="flex items-center text-sm">
            <span className="text-gray-500">Sistema</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-primary font-medium">{routeLabels[activeRoute] || activeRoute}</span>
          </nav>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="animate-fadeIn">
              {children}
            </div>
          </div>
        </main>
        
        {/* Footer Aprimorado */}
        <footer className="bg-white border-t border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="text-sm text-gray-500 mb-2 sm:mb-0">
                Sistema de Controle de Patrimônio TI © {new Date().getFullYear()}
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-500">Versão 2.0.1</span>
                <span className="text-gray-300">|</span>
                <a href="#" className="text-blue-500 hover:text-blue-600 transition-colors">
                  Suporte
                </a>
                <span className="text-gray-300">|</span>
                <a href="#" className="text-blue-500 hover:text-blue-600 transition-colors">
                  Documentação
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;