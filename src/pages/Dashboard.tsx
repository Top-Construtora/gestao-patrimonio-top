import React from 'react';
import { Equipment, HistoryEntry } from '../types';
import { 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  TrendingUp,
  Activity,
  Clock,
  DollarSign,
  BarChart3
} from 'lucide-react';

interface DashboardProps {
  equipment: Equipment[];
  historyEntries: HistoryEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ equipment, historyEntries }) => {
  // Cálculos de estatísticas
  const stats = {
    total: equipment.length,
    active: equipment.filter(item => item.status === 'ativo').length,
    maintenance: equipment.filter(item => item.status === 'manutenção').length,
    inactive: equipment.filter(item => item.status === 'desativado').length,
    totalValue: equipment.reduce((sum, item) => sum + item.value, 0),
    averageValue: equipment.length > 0 
      ? equipment.reduce((sum, item) => sum + item.value, 0) / equipment.length 
      : 0
  };

  // Formatar data/hora
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else if (diffInHours < 48) {
      return 'ontem';
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Obter mudança de tipo em português
  const getChangeTypeText = (changeType: string) => {
    const types: Record<string, string> = {
      'criou': 'adicionou',
      'editou': 'atualizou',
      'excluiu': 'removeu',
      'alterou status': 'alterou status de'
    };
    return types[changeType] || changeType;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Visão geral do sistema de controle de equipamentos</p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">equipamentos</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ativos</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}% do total` : '0%'}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Manutenção</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.maintenance}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.total > 0 ? `${Math.round((stats.maintenance / stats.total) * 100)}% do total` : '0%'}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stats.totalValue)}</p>
              <p className="text-xs text-gray-500 mt-1">patrimônio</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Status e Atividades Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atividades Recentes */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Atividades Recentes</h2>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {historyEntries.length > 0 ? (
              historyEntries.slice(0, 8).map((entry) => {
                const equipmentItem = equipment.find(e => e.id === entry.equipmentId);
                return (
                  <div key={entry.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="mt-1">
                      {entry.changeType === 'criou' && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                      {entry.changeType === 'editou' && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      {entry.changeType === 'excluiu' && (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{entry.user}</span>
                        {' '}
                        <span className="text-gray-600">{getChangeTypeText(entry.changeType)}</span>
                        {' '}
                        <span className="font-medium text-gray-900">
                          {equipmentItem?.assetNumber || 'equipamento'}
                        </span>
                      </p>
                      {entry.field && entry.newValue && (
                        <p className="text-xs text-gray-500 mt-1">
                          {entry.field}: {entry.oldValue || 'vazio'} → {entry.newValue}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDateTime(entry.timestamp)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma atividade registrada</p>
              </div>
            )}
          </div>
        </div>

        {/* Distribuição de Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Distribuição</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {/* Gráfico Circular Simples */}
            <div className="relative w-40 h-40 mx-auto">
              <svg className="transform -rotate-90 w-40 h-40">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#f3f4f6"
                  strokeWidth="12"
                  fill="none"
                />
                {stats.total > 0 && (
                  <>
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#10b981"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(stats.active / stats.total) * 439.82} 439.82`}
                      className="transition-all duration-1000"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#f59e0b"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(stats.maintenance / stats.total) * 439.82} 439.82`}
                      strokeDashoffset={`-${(stats.active / stats.total) * 439.82}`}
                      className="transition-all duration-1000"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#ef4444"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(stats.inactive / stats.total) * 439.82} 439.82`}
                      strokeDashoffset={`-${((stats.active + stats.maintenance) / stats.total) * 439.82}`}
                      className="transition-all duration-1000"
                    />
                  </>
                )}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-xs text-gray-500">total</p>
                </div>
              </div>
            </div>

            {/* Legenda */}
            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Ativos</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Manutenção</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.maintenance}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Inativos</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.inactive}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;