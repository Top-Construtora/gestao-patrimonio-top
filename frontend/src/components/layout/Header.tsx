import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, ChevronDown, Settings, LogOut, User, Home, ChevronRight } from 'lucide-react';
import logo from '/assets/images/logo.png';

interface HeaderProps {
  onToggleSidebar: () => void;
  userName?: string;
  activeRoute?: string;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, userName = 'Administrador', activeRoute = 'dashboard' }) => {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Atualizar data e hora
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Formatar data
      const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

      const dayName = days[now.getDay()];
      const day = now.getDate();
      const month = months[now.getMonth()];
      const year = now.getFullYear();

      setCurrentDate(`${dayName} • ${day} de ${month} ${year}`);

      // Formatar hora
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Obter iniciais do nome
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Obter nome da rota para breadcrumb
  const getRouteName = (route: string) => {
    const routeNames: Record<string, string> = {
      'dashboard': 'Dashboard',
      'equipment': 'Equipamentos',
      'equipment-details': 'Detalhes',
      'add-equipment': 'Adicionar Equipamento',
      'edit-equipment': 'Editar Equipamento',
      'reports': 'Relatórios',
      'purchases': 'Solicitações',
      'add-purchase': 'Nova Solicitação',
      'settings': 'Configurações',
      'support': 'Suporte'
    };
    return routeNames[route] || route;
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-[64px] bg-gray-800 border-b border-gray-700 z-[1000]">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left Side - Mobile Menu + Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <a href="#" className="flex items-center">
            <img
              src={logo}
              alt="Logo"
              className="h-9 w-auto"
            />
          </a>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-gray-700">
            <Home size={14} className="text-gray-500" />
            <span className="text-gray-500 text-sm">Sistema</span>
            <ChevronRight size={14} className="text-gray-600" />
            <span className="text-primary text-sm font-medium">{getRouteName(activeRoute)}</span>
          </div>
        </div>

        {/* Center - Date/Time Display (hidden on mobile) */}
        <div className="hidden lg:flex flex-col items-center absolute left-1/2 transform -translate-x-1/2">
          <div className="text-gray-400 text-xs tracking-wide">
            {currentDate}
          </div>
          <div className="text-white text-xl font-semibold tracking-wider font-mono">
            {currentTime}
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Button */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
              aria-label="Notificações"
            >
              <Bell size={20} />
              {/* Notification Badge */}
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-primary text-white rounded-full">
                3
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden animate-slideDown">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Notificações</h3>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">3 novas</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="p-4 hover:bg-gray-700/50 border-b border-gray-700/50 cursor-pointer transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm text-white font-medium">Novo equipamento cadastrado</p>
                        <p className="text-xs text-gray-400 mt-1">Há 5 minutos</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-gray-700/50 border-b border-gray-700/50 cursor-pointer transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm text-white font-medium">Solicitação de compra aprovada</p>
                        <p className="text-xs text-gray-400 mt-1">Há 1 hora</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-gray-700/50 cursor-pointer transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm text-white font-medium">Termo de responsabilidade pendente</p>
                        <p className="text-xs text-gray-400 mt-1">Há 2 horas</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-gray-700 bg-gray-800/50">
                  <button className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                    Ver todas as notificações
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-lg hover:bg-gray-700 transition-all"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm border-2 border-primary/50">
                {getInitials(userName)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-white leading-tight">{userName}</p>
                <p className="text-xs text-gray-400">Administrador</p>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 hidden sm:block ${showUserDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* User Dropdown */}
            {showUserDropdown && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden animate-slideDown">
                {/* User Info */}
                <div className="p-4 bg-gray-700/30 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold border-2 border-primary/50">
                      {getInitials(userName)}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{userName}</p>
                      <p className="text-xs text-gray-400">admin@exemplo.com</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-left">
                    <User size={18} className="text-gray-400" />
                    <span className="text-sm">Meu Perfil</span>
                  </button>
                  <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-left">
                    <Settings size={18} className="text-gray-400" />
                    <span className="text-sm">Configurações</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="p-2 border-t border-gray-700">
                  <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left">
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
