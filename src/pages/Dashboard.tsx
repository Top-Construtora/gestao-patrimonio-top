import React from 'react';
import { Equipment, HistoryEntry } from '../types';
import { 
  Package, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Clock,
  DollarSign,
  BarChart3,
  Zap,
  Settings,
  Notebook,
  Laptop
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
    averageValue: activeEquipment.length > 0 
      ? activeEquipment.reduce((sum, item) => sum + item.value, 0) / activeEquipment.length 
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

  // Calcular percentuais para o gráfico circular
  const activePercentage = stats.total > 0 ? (stats.active / stats.total) * 100 : 0;
  const maintenancePercentage = stats.total > 0 ? (stats.maintenance / stats.total) * 100 : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Página Inicial</h1>
        <p className="text-gray-600 mt-2">Visão geral dos equipamentos em operação</p>
      </div>

      {/* Métricas Principais - Apenas Ativos e Manutenção */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Equipamentos eDm Operação */}
        <div className="bg-gradient-to-br from-secondary to-secondary rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-light font-medium">Em Operação</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
              <p className="text-xs text-primary-light mt-1 font-medium">equipamentos</p>
            </div>
            <div className="p-3 bg-secondary bg-opacity-60 rounded-full">
              <Laptop className="h-6 w-6 text-primary-light" />
            </div>
          </div>
        </div>

        {/* Equipamentos Ativos */}
        <div className="bg-gradient-to-br from-primary to-primary rounded-xl p-6 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-dark font-medium">Ativos</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.active}</p>
              <p className="text-xs text-secondary-dark mt-1 font-medium">
                {stats.total > 0 ? `${Math.round(activePercentage)}% do total` : '0%'}
              </p>
            </div>
            <div className="p-3 bg-primary bg-opacity-60 rounded-full">
              <CheckCircle className="h-6 w-6 text-secondary-dark" />
            </div>
          </div>
        </div>

        {/* Equipamentos em Manutenção */}
        <div className="bg-gradient-to-br from-accent-light to-accent-light rounded-xl p-6 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium">Manutenção</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.maintenance}</p>
              <p className="text-xs text-white mt-1 font-medium">
                {stats.total > 0 ? `${Math.round(maintenancePercentage)}% do total` : '0%'}
              </p>
            </div>
            <div className="p-3 bg-accent-light bg-opacity-60 rounded-full">
              <AlertTriangle className="h-6 w-6 text-accent-dark" />
            </div>
          </div>
        </div>

        {/* Valor Total */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-900 rounded-xl p-6 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 font-medium">Valor Total</p>
              <p className="text-2xl font-bold text-white mt-2">{formatCurrency(stats.totalValue)}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">patrimônio ativo</p>
            </div>
            <div className="p-3 bg-gray bg-opacity-60 rounded-full">
              <DollarSign className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Seção Principal - Atividades e Distribuição */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atividades Recentes */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-200 rounded-lg">
                <Activity className="h-5 w-5 text-accent" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Atividades Recentes</h2>
            </div>
          </div>
          
          <div className="space-y-4">
            {historyEntries.length > 0 ? (
              historyEntries.slice(0, 8).map((entry) => {
                const equipmentItem = equipment.find(e => e.id === entry.equipmentId);
                return (
                  <div key={entry.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                    <div className="mt-1 flex-shrink-0">
                      {entry.changeType === 'criou' && (
                        <div className="w-2 h-2 bg-secondary-dark rounded-full"></div>
                      )}
                      {entry.changeType === 'editou' && (
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                      )}
                      {entry.changeType === 'excluiu' && (
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      )}
                      {entry.changeType === 'alterou status' && (
                        <div className="w-2 h-2 bg-primary-dark rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium text-primary">{entry.user}</span>
                        {' '}
                        <span className="text-gray-600">{getChangeTypeText(entry.changeType)}</span>
                        {' '}
                        <span className="font-medium text-gray-900">
                          {equipmentItem?.assetNumber || 'equipamento'}
                        </span>
                      </p>
                      {entry.field && entry.newValue && (
                        <p className="text-xs text-gray-500 mt-1">
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

                            // Verificar se há valor anterior válido
                            const hasValidOldValue = entry.oldValue && 
                                                   entry.oldValue.trim() !== '' && 
                                                   entry.oldValue.toLowerCase() !== 'undefined' &&
                                                   entry.oldValue.toLowerCase() !== 'null';

                            // Se não há valor anterior válido, mostrar apenas o novo valor
                            if (!hasValidOldValue) {
                              return (
                                <>
                                  {fieldName}: <span className="text-green-600 font-medium">{entry.newValue}</span>
                                </>
                              );
                            }

                            // Se há valor anterior válido, mostrar a transição
                            return (
                              <>
                                {fieldName}: {entry.oldValue} → <span className="text-green-600 font-medium">{entry.newValue}</span>
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
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Clock className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">Nenhuma atividade registrada</p>
                <p className="text-sm text-gray-400 mt-1">As próximas atividades aparecerão aqui</p>
              </div>
            )}
          </div>
        </div>

        {/* Distribuição Ativos vs Manutenção */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-200 rounded-lg">
                <BarChart3 className="h-5 w-5 text-secondary" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Status</h2>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Gráfico Circular Simplificado */}
            {stats.total > 0 ? (
              <div className="relative w-40 h-40 mx-auto">
                <svg className="transform -rotate-90 w-40 h-40">
                  {/* Background circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#f3f4f6"
                    strokeWidth="12"
                    fill="none"
                  />
                  {/* Active equipment arc */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#0f9b8d"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(stats.active / stats.total) * 439.82} 439.82`}
                    className="transition-all duration-1000 ease-out"
                  />
                  {/* Maintenance equipment arc */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#c4b285"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(stats.maintenance / stats.total) * 439.82} 439.82`}
                    strokeDashoffset={`-${(stats.active / stats.total) * 439.82}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-xs text-gray-500 font-medium">em operação</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-40 h-40 mx-auto flex items-center justify-center bg-gray-50 rounded-full">
                <div className="text-center">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Sem dados</p>
                </div>
              </div>
            )}

            {/* Legenda */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center">
                  <Zap className="w-4 h-4 text-primary-light mr-2" />
                  <span className="text-sm font-medium text-primary-light">Ativos</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary-light">{stats.active}</span>
                  <span className="text-xs text-primary-light ml-1">
                    ({stats.total > 0 ? Math.round(activePercentage) : 0}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="flex items-center">
                  <Settings className="w-4 h-4 text-white mr-2" />
                  <span className="text-sm font-medium text-white">Manutenção</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-white">{stats.maintenance}</span>
                  <span className="text-xs text-white ml-1">
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