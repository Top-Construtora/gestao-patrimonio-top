import React, { useState } from 'react';
import { Equipment } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { 
  FileText, 
  Download, 
  Filter, 
  PieChart, 
  TrendingUp, 
  Package, 
  DollarSign,
  Calendar,
  MapPin,
  AlertCircle,
  ChevronDown,
  Eye,
  Laptop
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
  const [chartView, setChartView] = useState<'status'>('status');
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

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">Analise e exporte dados do inventário</p>
        </div>
        <Button 
          className="w-full sm:w-auto" 
          onClick={handleExport}
          icon={<Download size={16} />}
          disabled={filteredEquipment.length === 0}
          size="sm"
        >
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card className="bg-white shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Filter size={18} className="text-secondary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Filtros</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-800 hover:text-blue-700 font-medium"
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
          <div className={`hidden sm:grid grid-cols-1 md:grid-cols-3 gap-4 ${!showFilters ? '' : ''}`}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Período de Aquisição</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent text-sm"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
                <input
                  type="date"
                  className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent text-sm"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="manutenção">Em Manutenção</option>
                <option value="desativado">Desativado</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Localização</label>
              <select
                className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent text-sm"
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
            <div className="sm:hidden space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Período</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                  <input
                    type="date"
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>
              
              <select
                className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="manutenção">Em Manutenção</option>
                <option value="desativado">Desativado</option>
              </select>

              <select
                className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
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
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <Card className="bg-gradient-to-br from-secondary to-secondary border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-primary-light">Em operação</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mt-1 sm:mt-2">{filteredEquipment.length}</p>
              <p className="text-xs text-primary-light mt-1 truncate">
                equipamentos 
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-secondary bg-opacity-60 rounded-full ml-3 flex-shrink-0">
              <Laptop className="w-5 h-5 sm:w-6 sm:h-6 text-primary-light" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-900 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-400">Valor Total</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mt-1 sm:mt-2 truncate">
                {formatCurrency(totalValue)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Valor acumulado</p>
            </div>
            <div className="p-2 sm:p-3 bg-gray bg-opacity-60 rounded-full ml-3 flex-shrink-0">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      <Card className="bg-white shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 flex-1">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText size={18} className="text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Detalhamento</h3>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Eye className={`h-5 w-5 text-gray-500 ${showDetails ? 'text-gray-800' : ''}`} />
            </button>
          </div>
          
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto rounded-lg">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Patrimônio
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Localização
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                    Responsável
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEquipment.length > 0 ? (
                  filteredEquipment.slice(0, showDetails ? undefined : 5).map((item, index) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-800">{item.assetNumber}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-700">
                        {item.location}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-700 hidden lg:table-cell">
                        {item.responsible}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'ativo' 
                            ? 'bg-green-100 text-green-800' 
                            : item.status === 'manutenção'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {statusLabels[item.status]}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(item.value)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <FileText size={24} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500">Nenhum equipamento encontrado com os filtros aplicados</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {!showDetails && filteredEquipment.length > 5 && (
              <div className="px-6 py-3 bg-gray-50 text-center">
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-sm text-gray-800 hover:text-blue-700 font-medium"
                >
                  Ver todos ({filteredEquipment.length} itens)
                </button>
              </div>
            )}
          </div>

          {/* Mobile List */}
          <div className="sm:hidden space-y-3">
            {filteredEquipment.length > 0 ? (
              filteredEquipment.slice(0, showDetails ? undefined : 3).map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{item.assetNumber}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{item.description}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : item.status === 'manutenção'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {statusLabels[item.status]}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin size={12} />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">{formatCurrency(item.value)}</span>
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
                className="w-full py-2 text-sm text-gray-800 hover:text-blue-700 font-medium bg-gray-50 rounded-lg"
              >
                Ver todos ({filteredEquipment.length} itens)
              </button>
            )}
            {showDetails && filteredEquipment.length > 3 && (
              <button
                onClick={() => setShowDetails(false)}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-700 font-medium bg-gray-50 rounded-lg"
              >
                Ver menos
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Summary Footer - Mobile Only */}
      <div className="sm:hidden bg-white rounded-lg shadow-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Resumo do Relatório</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-600">Total Filtrado</p>
            <p className="font-semibold text-gray-900">{filteredEquipment.length} itens</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-600">Valor Total</p>
            <p className="font-semibold text-gray-900">{formatCurrency(totalValue)}</p>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-xs text-gray-600 pt-2 border-t">
            <AlertCircle size={14} />
            <span>Filtros aplicados: {[
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