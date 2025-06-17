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
  DollarSign,
  Calendar,
  User,
  Eye,
  Edit,
  Trash
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
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof EquipmentPurchase>('requestDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Obter categorias únicas
  const categories = [...new Set(purchases.map(item => item.category))];

  // Aplicar filtros
  const filteredPurchases = purchases.filter(item => {
    const matchesSearch = 
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || item.urgency === urgencyFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesUrgency && matchesCategory;
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

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Lidar com ordenação
  const handleSort = (field: keyof EquipmentPurchase) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Renderizar indicador de ordenação
  const renderSortIndicator = (field: keyof EquipmentPurchase) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 ml-1 inline" />
      : <ChevronDown className="h-4 w-4 ml-1 inline" />;
  };

  // Obter cor do badge de urgência
  const getUrgencyColor = (urgency: PurchaseUrgency): 'default' | 'warning' | 'error' => {
    const colors = {
      baixa: 'default' as const,
      média: 'warning' as const,
      alta: 'error' as const,
      crítica: 'error' as const
    };
    return colors[urgency];
  };

  // Obter cor do badge de status
  const getStatusColor = (status: PurchaseStatus): 'default' | 'warning' | 'success' | 'error' => {
    const colors = {
      pendente: 'warning' as const,
      adquirido: 'success' as const,
      aprovado: 'success' as const,
      rejeitado: 'error' as const
    };
    return colors[status];
  };

  // Obter ícone do status
  const getStatusIcon = (status: PurchaseStatus) => {
    const icons = {
      pendente: <Clock className="h-4 w-4" />,
      adquirido: <CheckCircle className="h-4 w-4" />,
      aprovado: <CheckCircle className="h-4 w-4" />,
      rejeitado: <XCircle className="h-4 w-4" />
    };
    return icons[status];
  };

  // Estatísticas
  const stats = {
    total: purchases.length,
    pending: purchases.filter(p => p.status === 'pendente').length,
    acquired: purchases.filter(p => p.status === 'adquirido').length,
    totalValue: purchases.reduce((sum, p) => sum + p.estimatedTotalValue, 0),
    critical: purchases.filter(p => p.urgency === 'crítica' && p.status === 'pendente').length
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
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200" 
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
              <p className="text-xs font-medium text-secondary-dark">Adquiridas</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.acquired}</p>
            </div>
            <div className="p-2 bg-primary bg-opacity-60 rounded-lg">
              <CheckCircle size={20} className="text-secondary-dark" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-900 border-0 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400">Valor Total Estimado</p>
              <p className="text-lg font-bold text-white mt-1">{formatCurrency(stats.totalValue)}</p>
            </div>
            <div className="p-2 bg-gray-900 bg-opacity-60 rounded-lg">
              <DollarSign size={20} className="text-gray-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Alertas */}
      {stats.critical > 0 && (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">
              <span className="font-semibold">{stats.critical}</span> solicitação(ões) com urgência crítica aguardando aprovação
            </p>
          </div>
        </Card>
      )}

      {/* Filtros e Tabela */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="space-y-6">
          {/* Busca e Filtros */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Busca */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Buscar por descrição, justificativa, solicitante ou fornecedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Botão de Filtros Mobile */}
              <Button
                variant="outline"
                size="sm"
                icon={<Filter size={16} />}
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden w-full sm:w-auto"
              >
                Filtros {showFilters ? '▲' : '▼'}
              </Button>

              {/* Filtros Desktop */}
              <div className="hidden lg:flex items-center gap-3">
                <select
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos os Status</option>
                  <option value="pendente">Pendente</option>
                  <option value="adquirido">Adquirido</option>
                </select>

                <select
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                >
                  <option value="all">Todas as Urgências</option>
                  <option value="baixa">Baixa</option>
                  <option value="média">Média</option>
                  <option value="alta">Alta</option>
                  <option value="crítica">Crítica</option>
                </select>

                <select
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">Todas as Categorias</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtros Mobile */}
            {showFilters && (
              <div className="lg:hidden grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                <select
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos os Status</option>
                  <option value="pendente">Pendente</option>
                  <option value="adquirido">Adquirido</option>
                </select>

                <select
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                >
                  <option value="all">Todas as Urgências</option>
                  <option value="baixa">Baixa</option>
                  <option value="média">Média</option>
                  <option value="alta">Alta</option>
                  <option value="crítica">Crítica</option>
                </select>

                <select
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">Todas as Categorias</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Informações dos Resultados */}
          <div className="flex items-center justify-between px-2">
            <p className="text-sm text-gray-600">
              Mostrando <span className="font-semibold text-gray-900">{sortedPurchases.length}</span> de{' '}
              <span className="font-semibold text-gray-900">{purchases.length}</span> solicitações
            </p>
            {(searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all' || categoryFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setUrgencyFilter('all');
                  setCategoryFilter('all');
                }}
                className="text-blue-600 hover:text-blue-700"
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
                    onClick={() => handleSort('category')}
                  >
                    Categoria {renderSortIndicator('category')}
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
                    className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('estimatedTotalValue')}
                  >
                    Valor Total {renderSortIndicator('estimatedTotalValue')}
                  </th>
                  <th 
                    className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('requestDate')}
                  >
                    Solicitado em {renderSortIndicator('requestDate')}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPurchases.length > 0 ? (
                  sortedPurchases.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => onViewDetails(item.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="max-w-xs">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Qtd: {item.estimatedQuantity} unidade(s)
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{item.category}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variante={getUrgencyColor(item.urgency)}
                          className={item.urgency === 'crítica' ? 'animate-pulse' : ''}
                        >
                          {item.urgency.charAt(0).toUpperCase() + item.urgency.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <Badge variante={getStatusColor(item.status)}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.estimatedTotalValue)}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm text-gray-900">{formatDate(item.requestDate)}</p>
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <User className="h-3 w-3 mr-1" />
                            {item.requestedBy}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails(item.id)}
                            icon={<Eye size={16} />}
                          >
                            {' '}
                          </Button>
                          
                          {item.status === 'pendente' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(item.id)}
                                icon={<Edit size={16} />}
                              >
                                {' '}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onMarkAsAcquired(item.id)}
                                icon={<ShoppingCart size={16} />}
                              >
                                Converter em Equipamento
                              </Button>
                            </>
                          )}
                          
                          {item.status === 'adquirido' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(item.id)}
                              icon={<Trash size={16} />}
                            >
                              {' '}
                            </Button>
                          )}
                          {(item.status === 'aprovado' || item.status === 'rejeitado') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(item.id)}
                              icon={<Trash size={16} />}
                            >
                              {' '}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                          <ShoppingCart size={24} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Nenhuma solicitação encontrada</p>
                        <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros de busca</p>
                      </div>
                    </td>
                  </tr>
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