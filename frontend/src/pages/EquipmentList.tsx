import React, { useState } from 'react';
import { Equipment } from '../types';
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
  XCircle,
  DollarSign
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Equipment>('assetNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  const locations = [...new Set(equipment.map(item => item.location))];

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleSort = (field: keyof Equipment) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIndicator = (field: keyof Equipment) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc'
      ? <ChevronUp className="h-4 w-4 ml-1 inline" />
      : <ChevronDown className="h-4 w-4 ml-1 inline" />;
  };

  const stats = {
    total: equipment.length,
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
          <h1 className="text-2xl font-bold text-gray-800">Equipamentos</h1>
          <p className="text-gray-500 mt-1 text-sm">Gerencie todos os equipamentos do seu inventário</p>
        </div>
        <button
          onClick={onAddNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-white font-medium text-sm rounded-lg hover:bg-secondary-dark transition-all duration-200 hover:shadow-lg"
        >
          <PlusCircle size={18} />
          Adicionar Equipamento
        </button>
      </div>

      {/* Stats Cards - Estilo GIO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 transition-all duration-200 hover:border-secondary hover:shadow-lg hover:shadow-secondary/10 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-secondary uppercase tracking-wide">Total</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
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
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.active}</p>
              <p className="text-xs text-gray-400 mt-1">em operação</p>
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
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.maintenance}</p>
              <p className="text-xs text-gray-400 mt-1">em reparo</p>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
              <AlertTriangle className="h-6 w-6 text-accent" />
            </div>
          </div>
        </div>

        {/* Inativos */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 transition-all duration-200 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-500 uppercase tracking-wide">Inativos</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.inactive}</p>
              <p className="text-xs text-gray-400 mt-1">desativados</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 sm:p-6 space-y-4">
          {/* Search and Filter Header */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                placeholder="Buscar por patrimônio, descrição, marca, modelo ou responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Toggle Button for Mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Filter size={16} />
              Filtros {showFilters ? '▲' : '▼'}
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-3">
              <select
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="manutenção">Em Manutenção</option>
                <option value="desativado">Desativado</option>
              </select>

              <select
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
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
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="manutenção">Em Manutenção</option>
                <option value="desativado">Desativado</option>
              </select>

              <select
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
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

          {/* Results Info */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Mostrando <span className="font-semibold text-gray-800">{sortedEquipment.length}</span> de{' '}
              <span className="font-semibold text-gray-800">{equipment.length}</span> equipamentos
            </p>
            {(searchTerm || statusFilter !== 'all' || locationFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setLocationFilter('all');
                }}
                className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden border-t border-gray-200">
          {/* Header */}
          <div className="overflow-x-auto bg-gray-50">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('assetNumber')}
                  >
                    <div className="flex items-center">
                      <Package size={14} className="mr-1.5 text-gray-400" />
                      <span>Patrimônio</span>
                      {renderSortIndicator('assetNumber')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="hidden sm:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center">
                      <Laptop size={14} className="mr-1.5 text-gray-400" />
                      <span>Descrição</span>
                      {renderSortIndicator('description')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1.5 text-gray-400" />
                      <span>Localização</span>
                      {renderSortIndicator('location')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      <span>Status</span>
                      {renderSortIndicator('status')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="hidden lg:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('value')}
                  >
                    <div className="flex items-center">
                      <DollarSign size={14} className="mr-1.5 text-gray-400" />
                      <span>Valor</span>
                      {renderSortIndicator('value')}
                    </div>
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Body */}
          <div className="overflow-x-auto overflow-y-auto max-h-[480px] bg-white">
            <table className="min-w-full">
              <tbody className="divide-y divide-gray-100">
                {sortedEquipment.length > 0 ? (
                  sortedEquipment.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors group border-l-2 border-transparent hover:border-primary"
                      onClick={() => onViewDetails(item.id)}
                    >
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors">
                            {item.assetNumber}
                          </span>
                          <span className="text-xs text-gray-400 sm:hidden mt-1">
                            {item.description}
                          </span>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-800">
                            {item.description}
                          </span>
                          <span className="text-xs text-gray-400 mt-0.5">
                            {item.brand} {item.model}
                          </span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
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
                        <span className="text-sm font-medium text-gray-800">
                          {formatCurrency(item.value)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                          <Package size={28} className="text-gray-300" />
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
    </div>
  );
};

export default EquipmentList;
