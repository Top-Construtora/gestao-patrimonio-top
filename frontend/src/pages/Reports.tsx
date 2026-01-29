import React, { useState } from 'react';
import { Equipment } from '../types';
import {
  FileText,
  Download,
  Filter,
  PieChart,
  Package,
  DollarSign,
  MapPin,
  AlertCircle,
  ChevronDown,
  Eye,
  Laptop,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BarChart3,
  Calendar
} from 'lucide-react';

interface ReportsProps {
  equipment: Equipment[];
}

const Reports: React.FC<ReportsProps> = ({ equipment }) => {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const locations = [...new Set(equipment.map(item => item.location))];

  const filteredEquipment = equipment.filter(item => {
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesLocation = selectedLocation === 'all' || item.location === selectedLocation;

    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const itemDate = new Date(item.acquisitionDate);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDate = itemDate >= startDate && itemDate <= endDate;
    }

    return matchesStatus && matchesLocation && matchesDate;
  });

  const totalValue = filteredEquipment.reduce((sum, item) => sum + item.value, 0);

  const statusData = {
    active: filteredEquipment.filter(item => item.status === 'ativo').length,
    maintenance: filteredEquipment.filter(item => item.status === 'manutenção').length,
    inactive: filteredEquipment.filter(item => item.status === 'desativado').length
  };

  const handleExport = () => {
    const headers = [
      'Número do Patrimônio',
      'Localização',
      'Responsável',
      'Status',
      'Descrição',
      'Modelo',
      'Marca',
      'Especificações',
      'Valor',
      'Data de Aquisição'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredEquipment.map(item => [
        `"${item.assetNumber}"`,
        `"${item.location}"`,
        `"${item.responsible}"`,
        `"${item.status}"`,
        `"${item.description}"`,
        `"${item.model}"`,
        `"${item.brand}"`,
        `"${item.specs || ''}"`,
        item.value,
        item.acquisitionDate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_equipamentos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const statusLabels: Record<string, string> = {
    'ativo': 'Ativo',
    'manutenção': 'Em Manutenção',
    'desativado': 'Desativado',
    'all': 'Todos'
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const clearFilters = () => {
    setSelectedStatus('all');
    setSelectedLocation('all');
    setDateRange({ start: '', end: '' });
  };

  const hasActiveFilters = selectedStatus !== 'all' || selectedLocation !== 'all' || dateRange.start || dateRange.end;

  const total = statusData.active + statusData.maintenance + statusData.inactive;
  const activePercentage = total > 0 ? (statusData.active / total) * 100 : 0;
  const maintenancePercentage = total > 0 ? (statusData.maintenance / total) * 100 : 0;
  const inactivePercentage = total > 0 ? (statusData.inactive / total) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
          <p className="text-gray-500 mt-1 text-sm">Analise e exporte dados do inventário</p>
        </div>
        <button
          onClick={handleExport}
          disabled={filteredEquipment.length === 0}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-white font-medium text-sm rounded-lg hover:bg-secondary-dark transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          Exportar CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 transition-all duration-200 hover:border-secondary hover:shadow-lg hover:shadow-secondary/10 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-secondary uppercase tracking-wide">Em Operação</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{filteredEquipment.length}</p>
              <p className="text-xs text-gray-400 mt-1">equipamentos</p>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
              <Laptop className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </div>

        {/* Ativos */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 transition-all duration-200 hover:border-primary hover:shadow-lg hover:shadow-primary/10 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wide">Ativos</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{statusData.active}</p>
              <p className="text-xs text-gray-400 mt-1">{Math.round(activePercentage)}%</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Manutenção */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 transition-all duration-200 hover:border-accent hover:shadow-lg hover:shadow-accent/10 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-accent uppercase tracking-wide">Manutenção</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{statusData.maintenance}</p>
              <p className="text-xs text-gray-400 mt-1">{Math.round(maintenancePercentage)}%</p>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
              <AlertTriangle className="h-6 w-6 text-accent" />
            </div>
          </div>
        </div>

        {/* Valor Total */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 transition-all duration-200 hover:border-primary hover:shadow-lg group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Valor Total</p>
              <p className="text-2xl font-bold text-white mt-2">{formatCurrency(totalValue)}</p>
              <p className="text-xs text-gray-500 mt-1">patrimônio</p>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg group-hover:bg-gray-600 transition-colors">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Filter size={16} className="text-secondary" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Filtros</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-primary hover:text-primary-dark font-medium transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Desktop Filters */}
        <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Período de Aquisição</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
              <input
                type="date"
                className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Status</label>
            <select
              className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="manutenção">Em Manutenção</option>
              <option value="desativado">Desativado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Localização</label>
            <select
              className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="all">Todas as Localizações</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="sm:hidden space-y-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Período</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
                <input
                  type="date"
                  className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>

            <select
              className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="manutenção">Em Manutenção</option>
              <option value="desativado">Desativado</option>
            </select>

            <select
              className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="all">Todas as Localizações</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Grid: Gráfico + Tabela */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-100">
            <div className="p-2 bg-primary/10 rounded-lg">
              <PieChart className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Distribuição</h3>
          </div>

          {total > 0 ? (
            <>
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="#f3f4f6"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="#12b0a0"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${activePercentage * 3.27} 327`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="#baa673"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${maintenancePercentage * 3.27} 327`}
                    strokeDashoffset={`-${activePercentage * 3.27}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="#ef4444"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${inactivePercentage * 3.27} 327`}
                    strokeDashoffset={`-${(activePercentage + maintenancePercentage) * 3.27}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{total}</p>
                    <p className="text-[10px] text-gray-400 uppercase">total</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm text-gray-700">Ativos</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">{statusData.active}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-accent/5 border border-accent/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    <span className="text-sm text-gray-700">Manutenção</span>
                  </div>
                  <span className="text-sm font-semibold text-accent">{statusData.maintenance}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Inativos</span>
                  </div>
                  <span className="text-sm font-semibold text-red-500">{statusData.inactive}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <BarChart3 className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-sm text-gray-500">Sem dados para exibir</p>
            </div>
          )}
        </div>

        {/* Tabela Detalhada */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <FileText className="h-4 w-4 text-accent" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Detalhamento</h3>
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-primary hover:text-primary-dark font-medium transition-colors flex items-center gap-1"
              >
                <Eye size={14} />
                {showDetails ? 'Ver menos' : 'Ver todos'}
              </button>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Patrimônio
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Localização
                  </th>
                  <th className="hidden lg:table-cell px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Responsável
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEquipment.length > 0 ? (
                  filteredEquipment.slice(0, showDetails ? undefined : 5).map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors border-l-2 border-transparent hover:border-primary"
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-800">{item.assetNumber}</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <MapPin size={14} className="text-gray-400" />
                          {item.location}
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-5 py-3.5 whitespace-nowrap text-sm text-gray-600">
                        {item.responsible}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${item.status === 'ativo'
                          ? 'bg-primary/10 text-primary'
                          : item.status === 'manutenção'
                            ? 'bg-accent/10 text-accent'
                            : 'bg-red-100 text-red-600'
                          }`}>
                          {item.status === 'ativo' && <CheckCircle size={12} />}
                          {item.status === 'manutenção' && <AlertTriangle size={12} />}
                          {item.status === 'desativado' && <XCircle size={12} />}
                          {statusLabels[item.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-sm font-medium text-gray-800">
                        {formatCurrency(item.value)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <FileText size={24} className="text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">Nenhum equipamento encontrado</p>
                      <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros aplicados</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {!showDetails && filteredEquipment.length > 5 && (
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-center">
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                >
                  Ver todos ({filteredEquipment.length} itens)
                </button>
              </div>
            )}
          </div>

          {/* Mobile List */}
          <div className="sm:hidden p-4 space-y-3">
            {filteredEquipment.length > 0 ? (
              filteredEquipment.slice(0, showDetails ? undefined : 3).map((item) => (
                <div key={item.id} className="bg-gray-50 border border-gray-100 rounded-lg p-4 space-y-2 hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{item.assetNumber}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'ativo'
                      ? 'bg-primary/10 text-primary'
                      : item.status === 'manutenção'
                        ? 'bg-accent/10 text-accent'
                        : 'bg-red-100 text-red-600'
                      }`}>
                      {statusLabels[item.status]}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin size={12} />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-800">{formatCurrency(item.value)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Nenhum equipamento encontrado</p>
              </div>
            )}
            {!showDetails && filteredEquipment.length > 3 && (
              <button
                onClick={() => setShowDetails(true)}
                className="w-full py-2.5 text-sm text-primary font-medium bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg transition-colors"
              >
                Ver todos ({filteredEquipment.length} itens)
              </button>
            )}
            {showDetails && filteredEquipment.length > 3 && (
              <button
                onClick={() => setShowDetails(false)}
                className="w-full py-2.5 text-sm text-gray-600 font-medium bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Ver menos
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Footer - Mobile Only */}
      <div className="sm:hidden bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Resumo</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Filtrado</p>
            <p className="font-bold text-gray-800 mt-1">{filteredEquipment.length} itens</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Valor Total</p>
            <p className="font-bold text-gray-800 mt-1">{formatCurrency(totalValue)}</p>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
            <Filter size={12} />
            <span>Filtros: {[
              selectedStatus !== 'all' && statusLabels[selectedStatus],
              selectedLocation !== 'all' && selectedLocation,
              dateRange.start && 'Período'
            ].filter(Boolean).join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
