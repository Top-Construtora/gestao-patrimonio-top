import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Save,
  ChevronRight,
  Check,
  Moon,
  Sun,
  Monitor,
  Mail,
  Smartphone,
  Info,
  Server,
  HardDrive
} from 'lucide-react';

interface SettingsProps {
  onSave?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onSave }) => {
  // State for settings
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Profile settings
  const [profile, setProfile] = useState({
    name: 'Administrador',
    email: 'admin@exemplo.com',
    department: 'TI',
    phone: '(11) 99999-9999'
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    maintenanceReminders: true,
    purchaseUpdates: true,
    systemNotifications: false
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'pt-BR',
    compactMode: false
  });

  const menuItems = [
    { id: 'profile', name: 'Perfil', icon: <User size={18} />, description: 'Informações pessoais' },
    { id: 'notifications', name: 'Notificações', icon: <Bell size={18} />, description: 'Alertas e avisos' },
    { id: 'appearance', name: 'Aparência', icon: <Palette size={18} />, description: 'Tema e idioma' },
    { id: 'security', name: 'Segurança', icon: <Shield size={18} />, description: 'Senha e acesso' },
    { id: 'system', name: 'Sistema', icon: <Database size={18} />, description: 'Informações do sistema' },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    onSave?.();
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary">
          <User size={32} className="text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{profile.name}</h3>
          <p className="text-sm text-gray-500">{profile.email}</p>
          <button className="mt-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
            Alterar foto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Nome Completo
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            E-mail
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Departamento
          </label>
          <input
            type="text"
            value={profile.department}
            onChange={(e) => setProfile({ ...profile, department: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Telefone
          </label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-4">
      {[
        { key: 'emailAlerts', icon: <Mail size={18} />, title: 'Alertas por E-mail', description: 'Receba notificações importantes no seu e-mail' },
        { key: 'maintenanceReminders', icon: <Bell size={18} />, title: 'Lembretes de Manutenção', description: 'Seja avisado sobre manutenções agendadas' },
        { key: 'purchaseUpdates', icon: <Smartphone size={18} />, title: 'Atualizações de Compras', description: 'Notificações sobre status de solicitações' },
        { key: 'systemNotifications', icon: <Info size={18} />, title: 'Notificações do Sistema', description: 'Avisos sobre atualizações e novidades' },
      ].map((item) => (
        <div
          key={item.key}
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-primary/30 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              {item.icon}
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{item.title}</h4>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications[item.key as keyof typeof notifications]}
              onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      ))}
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Tema
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light', icon: <Sun size={20} />, label: 'Claro' },
            { value: 'dark', icon: <Moon size={20} />, label: 'Escuro' },
            { value: 'system', icon: <Monitor size={20} />, label: 'Sistema' },
          ].map((theme) => (
            <button
              key={theme.value}
              onClick={() => setAppearance({ ...appearance, theme: theme.value })}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                appearance.theme === theme.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`p-2 rounded-lg ${appearance.theme === theme.value ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                {theme.icon}
              </div>
              <span className={`text-sm font-medium ${appearance.theme === theme.value ? 'text-primary' : 'text-gray-600'}`}>
                {theme.label}
              </span>
              {appearance.theme === theme.value && (
                <Check size={16} className="text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Idioma
        </label>
        <div className="relative">
          <Globe size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={appearance.language}
            onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (US)</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>

      {/* Compact Mode */}
      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-800">Modo Compacto</h4>
          <p className="text-sm text-gray-500">Reduz espaçamento e tamanho dos elementos</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={appearance.compactMode}
            onChange={(e) => setAppearance({ ...appearance, compactMode: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-4">
      <div className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary/30 transition-all cursor-pointer group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-primary/10 transition-colors">
              <Shield size={18} className="text-gray-600 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Alterar Senha</h4>
              <p className="text-sm text-gray-500">Atualize sua senha de acesso</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
        </div>
      </div>

      <div className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary/30 transition-all cursor-pointer group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-primary/10 transition-colors">
              <Smartphone size={18} className="text-gray-600 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Autenticação em Dois Fatores</h4>
              <p className="text-sm text-gray-500">Adicione uma camada extra de segurança</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
        </div>
      </div>

      <div className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary/30 transition-all cursor-pointer group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-primary/10 transition-colors">
              <Monitor size={18} className="text-gray-600 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Sessões Ativas</h4>
              <p className="text-sm text-gray-500">Gerencie dispositivos conectados</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </div>
  );

  const renderSystemSection = () => (
    <div className="space-y-6">
      {/* System Info Card */}
      <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-700 rounded-lg">
            <Server size={20} className="text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-white">Sistema de Gestão de Patrimônio</h4>
            <p className="text-sm text-gray-400">Versão 1.0.0</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-3 bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Ambiente</p>
            <p className="text-sm font-medium text-white mt-1">Produção</p>
          </div>
          <div className="p-3 bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Última Atualização</p>
            <p className="text-sm font-medium text-white mt-1">29/01/2026</p>
          </div>
        </div>
      </div>

      {/* Database Status */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database size={18} className="text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Banco de Dados</h4>
              <p className="text-sm text-gray-500">Supabase PostgreSQL</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">Conectado</span>
          </div>
        </div>
      </div>

      {/* Storage Status */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-secondary/10 rounded-lg">
            <HardDrive size={18} className="text-secondary" />
          </div>
          <div>
            <h4 className="font-medium text-gray-800">Armazenamento</h4>
            <p className="text-sm text-gray-500">Supabase Storage</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Usado</span>
            <span className="font-medium text-gray-700">2.4 GB de 5 GB</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '48%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'appearance':
        return renderAppearanceSection();
      case 'security':
        return renderSecuritySection();
      case 'system':
        return renderSystemSection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
          <p className="text-gray-500 mt-1 text-sm">Gerencie suas preferências e configurações do sistema</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Salvar Alterações</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Menu */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SettingsIcon size={18} className="text-primary" />
                <span className="text-sm font-semibold text-gray-700">Menu</span>
              </div>
            </div>
            <nav className="p-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all mb-1 ${
                    activeSection === item.id
                      ? 'bg-primary/10 text-primary border-l-2 border-primary'
                      : 'text-gray-600 hover:bg-gray-50 border-l-2 border-transparent'
                  }`}
                >
                  <span className={activeSection === item.id ? 'text-primary' : 'text-gray-400'}>
                    {item.icon}
                  </span>
                  <div className="text-left">
                    <p className={`text-sm font-medium ${activeSection === item.id ? 'text-primary' : 'text-gray-700'}`}>
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2 bg-primary/10 rounded-lg">
                {menuItems.find(item => item.id === activeSection)?.icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {menuItems.find(item => item.id === activeSection)?.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {menuItems.find(item => item.id === activeSection)?.description}
                </p>
              </div>
            </div>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
