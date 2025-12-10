// pages/EquipmentPurchaseList.tsx
import React, { useState } from 'react';
import { EquipmentPurchase, PurchaseUrgency, PurchaseStatus } from '../types/purchaseTypes';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  ShoppingCart,
  Clock,
  AlertTriangle,
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
  // Estados para filtragem e ordenação
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof EquipmentPurchase>('requestDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Aplicar filtros
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

  // Aplicar ordenação
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

  // Alternar ordenação
  const handleSort = (field: keyof EquipmentPurchase) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Estatísticas
  const stats = {
    total: purchases.length,
    pending: purchases.filter(p => p.status === 'pendente').length,
    approved: purchases.filter(p => p.status === 'aprovado').length,
    acquired: purchases.filter(p => p.status === 'adquirido').length
  };

  // Obter ícone de status
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

  // Obter cor de urgência
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

  // Formatar data mês/ano
  const formatMonthYear = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const month = date.toLocaleDateString('pt-BR', { month: 'short' });
    const year = date.getFullYear();
    return `${month}/${year}`;
  };

  // Renderizar indicador de ordenação
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
          <h1 className="text-3xl font-bold text-gray-900">Equipamentos a Adquirir</h1>
          <p className="mt-2 text-sm text-gray-600">Gerencie as solicitações de compra de novos equipamentos</p>
        </div>
        <Button
          className="w-full sm:w-auto shadow-lg hover:shadow-xl"
          onClick={onAddNew}
          icon={<PlusCircle size={18} />}
        >
          Nova Solicitação
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-secondary to-secondary border-0 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-primary-light">Total de Solicitações</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-2 bg-secondary bg-opacity-60 rounded-lg">
              <ShoppingCart size={20} className="text-primary-light" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-accent-light to-accent-light border-0 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white">Pendentes</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.pending}</p>
            </div>
            <div className="p-2 bg-accent-light bg-opacity-60 rounded-lg">
              <Clock size={20} className="text-white" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-primary to-primary border-0 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-secondary">Aprovadas</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.approved}</p>
            </div>
            <div className="p-2 bg-primary bg-opacity-60 rounded-lg">
              <CheckCircle size={20} className="text-secondary" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-900 border-0 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400">Adquiridas</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.acquired}</p>
            </div>
            <div className="p-2 bg-gray-900 bg-opacity-60 rounded-lg">
              <Receipt size={20} className="text-gray-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros e Pesquisa */}
      <Card>
        <div className="space-y-4">
          {/* Barra de pesquisa e toggle de filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por descrição, fornecedor, marca ou modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={<Filter size={18} />}
              className="whitespace-nowrap"
            >
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </Button>
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent"
                >
                  <option value="all">Todos</option>
                  <option value="pendente">Pendente</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="rejeitado">Rejeitado</option>
                  <option value="adquirido">Adquirido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgência</label>
                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent"
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

          {/* Informações dos Resultados */}
          <div className="flex items-center justify-between px-2">
            <p className="text-sm text-gray-600">
              Mostrando <span className="font-semibold text-gray-900">{sortedPurchases.length}</span> de{' '}
              <span className="font-semibold text-gray-900">{purchases.length}</span> solicitações
            </p>
            {(searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setUrgencyFilter('all');
                }}
                className="text-gray-800 hover:text-blue-700"
              >
                Limpar filtros
              </Button>
            )}
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto -mx-6">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('description')}
                  >
                    Descrição {renderSortIndicator('description')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('urgency')}
                  >
                    Urgência {renderSortIndicator('urgency')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    Status {renderSortIndicator('status')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('expectedDate')}
                  >
                    Data Esperada {renderSortIndicator('expectedDate')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fornecedor Sugerido
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-gray-500">Nenhuma solicitação encontrada</p>
                      <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros ou criar uma nova solicitação</p>
                    </td>
                  </tr>
                ) : (
                  sortedPurchases.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.description}
                          </div>
                          {(item.brand || item.model) && (
                            <div className="text-xs text-gray-400 mt-1">
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
                          {getStatusIcon(item.status)}
                          <span className={`text-sm font-medium ${
                            item.status === 'pendente' ? 'text-yellow-600' :
                            item.status === 'aprovado' ? 'text-green-600' :
                            item.status === 'rejeitado' ? 'text-red-600' :
                            'text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatMonthYear(item.expectedDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.supplier ? (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Briefcase className="h-3.5 w-3.5" />
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(item.id)}
                                icon={<Edit size={16} />}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onMarkAsAcquired(item.id)}
                                icon={<CheckCircle size={16} />}
                                className="text-green-600 hover:text-green-700"
                              >
                                Adquirido
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(item.id)}
                            icon={<Trash size={16} />}
                            className="text-red-600 hover:text-red-700"
                          >
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EquipmentPurchaseList;