import React from 'react';
import { Equipment, HistoryEntry } from '../types';
import {
  Package,
  CheckCircle,
  AlertTriangle,
  Activity,
  Clock,
  DollarSign,
  BarChart3,
  Zap,
  Wrench
} from 'lucide-react';

interface DashboardProps {
  equipment: Equipment[];
  historyEntries: HistoryEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ equipment, historyEntries }) => {
  const activeEquipment = equipment.filter(item =>
    item.status === 'ativo' || item.status === 'manutenção'
  );

  const stats = {
    total: activeEquipment.length,
    active: activeEquipment.filter(item => item.status === 'ativo').length,
    maintenance: activeEquipment.filter(item => item.status === 'manutenção').length,
    totalValue: activeEquipment.reduce((sum, item) => sum + item.value, 0),
  };

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

  const getChangeTypeText = (changeType: string) => {
    const types: Record<string, string> = {
      'criou': 'adicionou',
      'editou': 'atualizou',
      'excluiu': 'removeu',
      'alterou status': 'alterou status de'
    };
    return types[changeType] || changeType;
  };

  const activePercentage = stats.total > 0 ? (stats.active / stats.total) * 100 : 0;
  const maintenancePercentage = stats.total > 0 ? (stats.maintenance / stats.total) * 100 : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Página Inicial</h1>
        <p className="text-gray-500 mt-1 text-sm">Visão geral dos equipamentos em operação</p>
      </div>

      {/* Cards de Métricas - Estilo GIO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Em Operação */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 transition-all duration-200 hover:border-secondary hover:shadow-lg hover:shadow-secondary/10 group cursor-default">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wide">Em Operação</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
              <p className="text-xs text-gray-400 mt-1">equipamentos</p>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
              <Package className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </div>

        {/* Ativos */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 transition-all duration-200 hover:border-primary hover:shadow-lg hover:shadow-primary/10 group cursor-default">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wide">Ativos</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.active}</p>
              <p className="text-xs text-gray-400 mt-1">
                {stats.total > 0 ? `${Math.round(activePercentage)}%` : '0%'}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Manutenção */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 transition-all duration-200 hover:border-accent hover:shadow-lg hover:shadow-accent/10 group cursor-default">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-accent uppercase tracking-wide">Manutenção</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.maintenance}</p>
              <p className="text-xs text-gray-400 mt-1">
                {stats.total > 0 ? `${Math.round(maintenancePercentage)}%` : '0%'}
              </p>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
              <AlertTriangle className="h-6 w-6 text-accent" />
            </div>
          </div>
        </div>

        {/* Valor Total */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 transition-all duration-200 hover:border-primary hover:shadow-lg group cursor-default">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Valor Total</p>
              <p className="text-2xl font-bold text-white mt-2">{formatCurrency(stats.totalValue)}</p>
              <p className="text-xs text-gray-500 mt-1">patrimônio ativo</p>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg group-hover:bg-gray-600 transition-colors">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Seção Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atividades Recentes */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Activity className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-base font-semibold text-gray-800">Atividades Recentes</h2>
          </div>

          <div className="space-y-1">
            {historyEntries.length > 0 ? (
              historyEntries.slice(0, 8).map((entry) => {
                const equipmentItem = equipment.find(e => e.id === entry.equipmentId);
                return (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border-l-2 border-transparent hover:border-primary"
                  >
                    <div className="mt-1.5 flex-shrink-0">
                      {entry.changeType === 'criou' && (
                        <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      )}
                      {entry.changeType === 'editou' && (
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                      )}
                      {entry.changeType === 'excluiu' && (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                      {entry.changeType === 'alterou status' && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-secondary">{entry.user}</span>
                        {' '}
                        <span className="text-gray-500">{getChangeTypeText(entry.changeType)}</span>
                        {' '}
                        <span className="font-medium text-gray-800">
                          {equipmentItem?.assetNumber || 'equipamento'}
                        </span>
                      </p>
                      {entry.field && entry.newValue && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {(() => {
                            const fieldName = entry.field === 'location' ? 'Localização' :
                                             entry.field === 'responsible' ? 'Responsável' :
                                             entry.field === 'status' ? 'Status' :
                                             entry.field === 'description' ? 'Descrição' :
                                             entry.field === 'brand' ? 'Marca' :
                                             entry.field === 'model' ? 'Modelo' :
                                             entry.field === 'value' ? 'Valor' :
                                             entry.field === 'acquisitionDate' ? 'Data de Aquisição' :
                                             entry.field === 'assetNumber' ? 'Patrimônio' :
                                             entry.field === 'specs' ? 'Especificações' :
                                             entry.field === 'observacoes' ? 'Observações' :
                                             entry.field;

                            const hasValidOldValue = entry.oldValue &&
                                                   entry.oldValue.trim() !== '' &&
                                                   entry.oldValue.toLowerCase() !== 'undefined' &&
                                                   entry.oldValue.toLowerCase() !== 'null';

                            if (!hasValidOldValue) {
                              return (
                                <>
                                  {fieldName}: <span className="text-primary font-medium">{entry.newValue}</span>
                                </>
                              );
                            }

                            return (
                              <>
                                {fieldName}: {entry.oldValue} → <span className="text-primary font-medium">{entry.newValue}</span>
                              </>
                            );
                          })()}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                      {formatDateTime(entry.timestamp)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Clock className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">Nenhuma atividade registrada</p>
                <p className="text-sm text-gray-400 mt-1">As próximas atividades aparecerão aqui</p>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-secondary" />
            </div>
            <h2 className="text-base font-semibold text-gray-800">Status</h2>
          </div>

          <div className="space-y-6">
            {/* Gráfico Circular */}
            {stats.total > 0 ? (
              <div className="relative w-36 h-36 mx-auto">
                <svg className="transform -rotate-90 w-36 h-36">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#f3f4f6"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#12b0a0"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${(stats.active / stats.total) * 377} 377`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#baa673"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${(stats.maintenance / stats.total) * 377} 377`}
                    strokeDashoffset={`-${(stats.active / stats.total) * 377}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">total</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-36 h-36 mx-auto flex items-center justify-center bg-gray-50 rounded-full">
                <div className="text-center">
                  <Package className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Sem dados</p>
                </div>
              </div>
            )}

            {/* Legenda */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-gray-700">Ativos</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary">{stats.active}</span>
                  <span className="text-xs text-gray-400 ml-1">
                    ({stats.total > 0 ? Math.round(activePercentage) : 0}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-accent/5 border border-accent/20 rounded-lg hover:bg-accent/10 transition-colors">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-gray-700">Manutenção</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-accent">{stats.maintenance}</span>
                  <span className="text-xs text-gray-400 ml-1">
                    ({stats.total > 0 ? Math.round(maintenancePercentage) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
