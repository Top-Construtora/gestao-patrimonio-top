import React, { useState } from 'react';
import { Equipment } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Package,
  MapPin,
  BarChart3,
  Laptop,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface EquipmentListProps {
  equipment: Equipment[];
  onViewDetails: (id: string) => void;
  onAddNew: () => void;
}

const EquipmentList: React.FC<EquipmentListProps> = ({
  equipment,
  onViewDetails,
  onAddNew
}) => {
  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Equipment>('assetNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique locations for filter
  const locations = [...new Set(equipment.map(item => item.location))];

  // Apply filters
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = 
      item.assetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.responsible.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || item.location === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Apply sorting
  const sortedEquipment = [...filteredEquipment].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Handle sort
  const handleSort = (field: keyof Equipment) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field: keyof Equipment) => {
    if (sortField !== field) return null;

    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 ml-1 inline" />
      : <ChevronDown className="h-4 w-4 ml-1 inline" />;
  };

  // Stats for cards
  const stats = {
    active: equipment.filter(item => item.status === 'ativo').length,
    maintenance: equipment.filter(item => item.status === 'manutenção').length,
    inactive: equipment.filter(item => item.status === 'desativado').length,
    totalValue: equipment.reduce((sum, item) => sum + item.value, 0)
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipamentos</h1>
          <p className="mt-2 text-sm text-gray-600">Gerencie todos os equipamentos do seu inventário</p>
        </div>
        <Button
          className="w-full sm:w-auto shadow-lg hover:shadow-xl"
          onClick={onAddNew}
          icon={<PlusCircle size={18} />}
        >
          Adicionar Equipamento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-secondary to-secondary border-0 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-primary-light">Total</p>
              <p className="text-2xl font-bold text-white mt-1">{equipment.length}</p>
            </div>
            <div className="p-2 bg-secondary bg-opacity-60 rounded-lg">
              <Laptop size={20} className="text-primary-light" />
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-primary to-primary border-0 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-secondary-dark">Ativos</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.active}</p>
            </div>
            <div className="p-2 bg-primary bg-opacity-60 rounded-lg">
              <CheckCircle size={20} className="text-secondary-dark" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-accent-light to-accent-light border-0 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white">Manutenção</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.maintenance}</p>
            </div>
            <div className="p-2 bg-accent-light bg-opacity-60 rounded-lg">
              <AlertTriangle size={20} className="text-white" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-800 to-red-800 border-0 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-400">Inativos</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.inactive}</p>
            </div>
            <div className="p-2 bg-red bg-opacity-60 rounded-lg">
              <XCircle size={20} className="text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="space-y-6">
          {/* Search and Filter Header */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all duration-200"
                  placeholder="Buscar por patrimônio, descrição, marca, modelo ou responsável..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Toggle Button for Mobile */}
              <Button
                variant="outline"
                size="sm"
                icon={<Filter size={16} />}
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden w-full sm:w-auto"
              >
                Filtros {showFilters ? '▲' : '▼'}
              </Button>

              {/* Desktop Filters */}
              <div className="hidden lg:flex items-center gap-3">
                <select
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all duration-200"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos os Status</option>
                  <option value="ativo">Ativo</option>
                  <option value="manutenção">Em Manutenção</option>
                  <option value="desativado">Desativado</option>
                </select>

                <select
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all duration-200"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
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
              <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                <select
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all duration-200"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos os Status</option>
                  <option value="ativo">Ativo</option>
                  <option value="manutenção">Em Manutenção</option>
                  <option value="desativado">Desativado</option>
                </select>

                <select
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all duration-200"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="all">Todas as Localizações</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between px-2">
            <p className="text-sm text-gray-600">
              Mostrando <span className="font-semibold text-gray-900">{sortedEquipment.length}</span> de{' '}
              <span className="font-semibold text-gray-900">{equipment.length}</span> equipamentos
            </p>
            {(searchTerm || statusFilter !== 'all' || locationFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setLocationFilter('all');
                }}
                className="text-gray-800 hover:text-blue-700"
              >
                Limpar filtros
              </Button>
            )}
          </div>

          {/* Table Container with Vertical Scroll */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            {/* Fixed Header */}
            <div className="overflow-x-auto bg-gray-50">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th 
                      scope="col" 
                      className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('assetNumber')}
                    >
                      <div className="flex items-center">
                        <Package size={14} className="mr-1 text-gray-500" />
                        <span>Patrimônio</span>
                        {renderSortIndicator('assetNumber')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="hidden sm:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('description')}
                    >
                      <div className="flex items-center">
                        <Laptop size={14} className="mr-1 text-gray-500" />
                        <span>Descrição</span>
                        {renderSortIndicator('description')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('location')}
                    >
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-1 text-gray-500" />
                        <span>Localização</span>
                        {renderSortIndicator('location')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        <span>Status</span>
                        {renderSortIndicator('status')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="hidden lg:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('value')}
                    >
                      <div className="flex items-center">
                        <BarChart3 size={14} className="mr-1 text-gray-500" />
                        <span>Valor</span>
                        {renderSortIndicator('value')}
                      </div>
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-x-auto overflow-y-auto max-h-96 bg-white">
              <table className="min-w-full">
                <tbody className="divide-y divide-gray-100">
                  {sortedEquipment.length > 0 ? (
                    sortedEquipment.map((item, index) => (
                      <tr 
                        key={item.id} 
                        className="hover:bg-gray-50 cursor-pointer transition-all duration-150 group"
                        onClick={() => onViewDetails(item.id)}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">
                              {item.assetNumber}
                            </span>
                            <span className="text-xs text-gray-500 sm:hidden mt-1">
                              {item.description}
                            </span>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {item.description}
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5">
                              {item.brand} {item.model}
                            </span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-700">
                            <MapPin size={14} className="mr-1.5 text-gray-400" />
                            {item.location}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variante={item.status}
                            size="sm"
                            pulse={item.status === 'manutenção'}
                          >
                            {item.status === 'ativo' ? 'Ativo' : 
                             item.status === 'manutenção' ? 'Manutenção' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.value)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <Package size={24} className="text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">Nenhum equipamento encontrado</p>
                          <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros de busca</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EquipmentList;