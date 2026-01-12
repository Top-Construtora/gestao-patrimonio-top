import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, ChevronDown, Settings, LogOut, User } from 'lucide-react';
import logo from '/assets/images/logo.png';

interface HeaderProps {
  onToggleSidebar: () => void;
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, userName = 'Administrador' }) => {
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

  return (
    <header className="fixed top-0 left-0 right-0 h-[77px] bg-secondary border-b border-white/10 z-[1000]">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between gap-4 lg:gap-8">
        {/* Left Side - Mobile Menu + Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <a href="#" className="flex items-center">
            <img
              src={logo}
              alt="Logo"
              className="h-14 w-auto"
            />
          </a>
        </div>

        {/* Center - Date/Time Display (hidden on mobile) */}
        <div className="hidden md:flex flex-col items-center">
          <div className="text-white/70 text-sm">
            {currentDate}
          </div>
          <div className="text-white text-2xl font-light tracking-wider font-mono">
            {currentTime}
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Notification Button */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Notificações"
            >
              <Bell size={20} />
              {/* Notification Badge */}
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full">
                3
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slideDown">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">Notificações</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="p-4 hover:bg-gray-50 border-b border-gray-50 cursor-pointer">
                    <p className="text-sm text-gray-800 font-medium">Novo equipamento cadastrado</p>
                    <p className="text-xs text-gray-500 mt-1">Há 5 minutos</p>
                  </div>
                  <div className="p-4 hover:bg-gray-50 border-b border-gray-50 cursor-pointer">
                    <p className="text-sm text-gray-800 font-medium">Solicitação de compra aprovada</p>
                    <p className="text-xs text-gray-500 mt-1">Há 1 hora</p>
                  </div>
                  <div className="p-4 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm text-gray-800 font-medium">Termo de responsabilidade pendente</p>
                    <p className="text-xs text-gray-500 mt-1">Há 2 horas</p>
                  </div>
                </div>
                <div className="p-3 border-t border-gray-100">
                  <button className="w-full text-center text-sm text-secondary hover:text-secondary-dark font-medium">
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
              className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-white/10 transition-all"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {getInitials(userName)}
              </div>
              <ChevronDown
                size={16}
                className={`text-white/70 transition-transform duration-200 hidden sm:block ${showUserDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* User Dropdown */}
            {showUserDropdown && (
              <div className="absolute top-full right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slideDown">
                {/* User Info */}
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center text-white font-semibold">
                      {getInitials(userName)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{userName}</p>
                      <p className="text-xs text-gray-500">admin@exemplo.com</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-left">
                    <User size={18} className="text-gray-500" />
                    <span className="text-sm">Meu Perfil</span>
                  </button>
                  <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-left">
                    <Settings size={18} className="text-gray-500" />
                    <span className="text-sm">Configurações</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="p-2 border-t border-gray-100">
                  <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left">
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
