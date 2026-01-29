import React, { useState } from 'react';
import { EquipmentPurchase, PurchaseUrgency, PurchaseStatus } from '../types/purchaseTypes';
import Badge from '../components/common/Badge';
import {
  PlusCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Edit,
  Trash,
  Briefcase,
  Receipt
} from 'lucide-react';

interface EquipmentPurchaseListProps {
  purchases: EquipmentPurchase[];
  onViewDetails: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onMarkAsAcquired: (id: string) => void;
}

const EquipmentPurchaseList: React.FC<EquipmentPurchaseListProps> = ({
  purchases,
  onViewDetails,
  onEdit,
  onDelete,
  onAddNew,
  onMarkAsAcquired
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof EquipmentPurchase>('requestDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const filteredPurchases = purchases.filter(item => {
    const matchesSearch =
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.model && item.model.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || item.urgency === urgencyFilter;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof EquipmentPurchase) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const stats = {
    total: purchases.length,
    pending: purchases.filter(p => p.status === 'pendente').length,
    approved: purchases.filter(p => p.status === 'aprovado').length,
    acquired: purchases.filter(p => p.status === 'adquirido').length
  };

  const getStatusIcon = (status: PurchaseStatus) => {
    switch (status) {
      case 'pendente':
        return <Clock size={14} />;
      case 'aprovado':
        return <CheckCircle size={14} />;
      case 'rejeitado':
        return <XCircle size={14} />;
      case 'adquirido':
        return <ShoppingCart size={14} />;
    }
  };

  const getUrgencyColor = (urgency: PurchaseUrgency): 'info' | 'warning' | 'error' | 'success' => {
    switch (urgency) {
      case 'baixa':
        return 'info';
      case 'média':
        return 'warning';
      case 'alta':
        return 'error';
      case 'crítica':
        return 'error';
      default:
        return 'info';
    }
  };

  const formatMonthYear = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const month = date.toLocaleDateString('pt-BR', { month: 'short' });
    const year = date.getFullYear();
    return `${month}/${year}`;
  };

  const renderSortIndicator = (field: keyof EquipmentPurchase) => {
    if (sortField !== field) return null;

    return sortDirection === 'asc' ?
      <ChevronUp className="inline-block h-3 w-3 ml-1" /> :
      <ChevronDown className="inline-block h-3 w-3 ml-1" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Solicitações de Compra</h1>
          <p className="text-gray-500 mt-1 text-sm">Gerencie as solicitações de compra de novos equipamentos</p>
        </div>
        <button
          onClick={onAddNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-white font-medium text-sm rounded-lg hover:bg-secondary-dark transition-all duration-200 hover:shadow-lg"
        >
          <PlusCircle size={18} />
          Nova Solicitação
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
              <p className="text-xs text-gray-400 mt-1">solicitações</p>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
              <ShoppingCart className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </div>

        {/* Pendentes */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 transition-all duration-200 hover:border-accent hover:shadow-lg hover:shadow-accent/10 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-accent uppercase tracking-wide">Pendentes</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pending}</p>
              <p className="text-xs text-gray-400 mt-1">aguardando</p>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
              <Clock className="h-6 w-6 text-accent" />
            </div>
          </div>
        </div>

        {/* Aprovadas */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 transition-all duration-200 hover:border-primary hover:shadow-lg hover:shadow-primary/10 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wide">Aprovadas</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.approved}</p>
              <p className="text-xs text-gray-400 mt-1">para compra</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Adquiridas */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 transition-all duration-200 hover:border-primary hover:shadow-lg group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Adquiridas</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.acquired}</p>
              <p className="text-xs text-gray-500 mt-1">finalizadas</p>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg group-hover:bg-gray-600 transition-colors">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 sm:p-6 space-y-4">
          {/* Search and Filter Header */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por descrição, fornecedor, marca ou modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Filter size={18} />
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="all">Todos</option>
                  <option value="pendente">Pendente</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="rejeitado">Rejeitado</option>
                  <option value="adquirido">Adquirido</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Urgência</label>
                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="all">Todas</option>
                  <option value="baixa">Baixa</option>
                  <option value="média">Média</option>
                  <option value="alta">Alta</option>
                  <option value="crítica">Crítica</option>
                </select>
              </div>
            </div>
          )}

          {/* Results Info */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Mostrando <span className="font-semibold text-gray-800">{sortedPurchases.length}</span> de{' '}
              <span className="font-semibold text-gray-800">{purchases.length}</span> solicitações
            </p>
            {(searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setUrgencyFilter('all');
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
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('description')}
                  >
                    Descrição {renderSortIndicator('description')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('urgency')}
                  >
                    Urgência {renderSortIndicator('urgency')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    Status {renderSortIndicator('status')}
                  </th>
                  <th
                    className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('expectedDate')}
                  >
                    Previsão {renderSortIndicator('expectedDate')}
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sortedPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                          <ShoppingCart className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">Nenhuma solicitação encontrada</p>
                        <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros ou criar uma nova solicitação</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedPurchases.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors border-l-2 border-transparent hover:border-primary"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-800">
                            {item.description}
                          </div>
                          {(item.brand || item.model) && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              {item.brand && <span>{item.brand}</span>}
                              {item.brand && item.model && <span> - </span>}
                              {item.model && <span>{item.model}</span>}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variante={getUrgencyColor(item.urgency)} size="sm">
                          {item.urgency}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`${item.status === 'pendente' ? 'text-accent' :
                              item.status === 'aprovado' ? 'text-primary' :
                                item.status === 'rejeitado' ? 'text-red-500' :
                                  'text-gray-600'
                            }`}>
                            {getStatusIcon(item.status)}
                          </span>
                          <span className={`text-sm font-medium ${item.status === 'pendente' ? 'text-accent' :
                              item.status === 'aprovado' ? 'text-primary' :
                                item.status === 'rejeitado' ? 'text-red-500' :
                                  'text-gray-600'
                            }`}>
                            {item.status}
                          </span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {formatMonthYear(item.expectedDate)}
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        {item.supplier ? (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                            {item.supplier}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          {item.status !== 'adquirido' && (
                            <>
                              <button
                                onClick={() => onEdit(item.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-secondary hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Edit size={14} />
                                <span className="hidden sm:inline">Editar</span>
                              </button>
                              <button
                                onClick={() => onMarkAsAcquired(item.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              >
                                <CheckCircle size={14} />
                                <span className="hidden sm:inline">Adquirido</span>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => onDelete(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash size={14} />
                            <span className="hidden sm:inline">Excluir</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentPurchaseList;
