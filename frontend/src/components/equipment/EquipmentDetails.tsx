import React, { useState, useRef } from 'react';
import { Equipment, HistoryEntry, Attachment } from '../../types';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { 
  Edit, 
  Trash, 
  Clock, 
  Download, 
  FileText, 
  Laptop,
  MapPin,
  User,
  Calendar,
  DollarSign,
  Package,
  Activity,
  ChevronRight,
  History,
  Paperclip,
  Upload,
  File,
  Image,
  FileSpreadsheet,
  X,
  Eye,
  Receipt,
  AlertTriangle,
  Info,
  CheckCircle,
  Wrench,
  Tag,
  ArrowRight,
  Building2,
  Cpu,
  HardDrive,
  Monitor,
  Shield,
  Server,
  Printer,
  Router,
  Smartphone,
  Tablet,
  Watch,
  Camera,
  Headphones,
  Mouse,
  Keyboard
} from 'lucide-react';

interface EquipmentDetailsProps {
  equipment: Equipment;
  history: HistoryEntry[];
  attachments: Attachment[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onUploadAttachment: (file: File) => void;
  onDeleteAttachment: (attachmentId: string) => void;
  onDownloadAttachment: (attachment: Attachment) => void;
  onTransfer?: () => void;
}

const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({ 
  equipment, 
  history,
  attachments,
  onEdit,
  onDelete,
  onUploadAttachment,
  onDeleteAttachment,
  onDownloadAttachment,
  onTransfer
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'attachments'>('info');
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const dateOnly = dateString.includes('T') ? dateString.split('T')[0] : dateString;
      const date = new Date(dateOnly + 'T00:00:00');
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getEquipmentIcon = () => {
    const desc = equipment.description.toLowerCase();
    if (desc.includes('notebook') || desc.includes('laptop')) return <Laptop className="h-6 w-6" />;
    if (desc.includes('monitor')) return <Monitor className="h-6 w-6" />;
    if (desc.includes('cpu') || desc.includes('desktop')) return <Cpu className="h-6 w-6" />;
    if (desc.includes('servidor') || desc.includes('server')) return <Server className="h-6 w-6" />;
    if (desc.includes('impressora') || desc.includes('printer')) return <Printer className="h-6 w-6" />;
    if (desc.includes('roteador') || desc.includes('router')) return <Router className="h-6 w-6" />;
    if (desc.includes('celular') || desc.includes('smartphone')) return <Smartphone className="h-6 w-6" />;
    if (desc.includes('tablet')) return <Tablet className="h-6 w-6" />;
    if (desc.includes('mouse')) return <Mouse className="h-6 w-6" />;
    if (desc.includes('teclado') || desc.includes('keyboard')) return <Keyboard className="h-6 w-6" />;
    return <Package className="h-6 w-6" />;
  };

  const getChangeTypeDetails = (changeType: string) => {
    switch (changeType) {
      case 'criou':
        return { icon: <Package className="h-4 w-4" />, color: 'text-gray-600 bg-gray-50', action: 'criou o equipamento' };
      case 'editou':
        return { icon: <Edit className="h-4 w-4" />, color: 'text-gray-800 bg-blue-50', action: 'editou' };
      case 'excluiu':
        return { icon: <Trash className="h-4 w-4" />, color: 'text-red-600 bg-red-50', action: 'excluiu' };
      case 'manutenção':
        return { icon: <Wrench className="h-4 w-4" />, color: 'text-orange-600 bg-orange-50', action: 'registrou manutenção' };
      case 'alterou status':
        return { icon: <Activity className="h-4 w-4" />, color: 'text-yellow-600 bg-yellow-50', action: 'alterou o status' };
      case 'anexou arquivo':
        return { icon: <Paperclip className="h-4 w-4" />, color: 'text-gray-600 bg-gray-50', action: 'anexou arquivo' };
      case 'removeu arquivo':
        return { icon: <X className="h-4 w-4" />, color: 'text-pink-600 bg-pink-50', action: 'removeu arquivo' };
      case 'transferiu':
        return { icon: <ArrowRight className="h-4 w-4" />, color: 'text-gray-600 bg-gray-50', action: 'transferiu' };
      default:
        return { icon: <Clock className="h-4 w-4" />, color: 'text-gray-600 bg-gray-50', action: changeType };
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (type.includes('image')) return <Image className="h-8 w-8 text-gray-700" />;
    if (type.includes('sheet') || type.includes('excel')) return <FileSpreadsheet className="h-8 w-8 text-gray-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadAttachment(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      onUploadAttachment(file);
    }
  };

  const handleDeleteClick = (attachment: Attachment) => {
    setAttachmentToDelete(attachment);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (attachmentToDelete) {
      onDeleteAttachment(attachmentToDelete.id);
      setShowDeleteModal(false);
      setAttachmentToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setAttachmentToDelete(null);
  };

  const tabs = [
    { id: 'info' as const, label: 'Informações', icon: <Info className="h-4 w-4" /> },
    { id: 'history' as const, label: 'Histórico', icon: <History className="h-4 w-4" />, count: history.length },
    { id: 'attachments' as const, label: 'Anexos', icon: <Paperclip className="h-4 w-4" />, count: attachments.length }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header com gradiente suave */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
              {getEquipmentIcon()}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{equipment.description}</h1>
              <div className="flex items-center gap-4 text-blue-100">
                <span className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4" />
                  {equipment.assetNumber}
                </span>
                <Badge
                  variante={
                    equipment.status === 'ativo' ? 'success' : 
                    equipment.status === 'manutenção' ? 'warning' : 
                    'error'
                  }
                  className="bg-white/20 backdrop-blur-sm text-white border-transparent"
                >
                  {equipment.status === 'ativo' ? 'Ativo' : 
                   equipment.status === 'manutenção' ? 'Em Manutenção' : 
                   'Desativado'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-100 text-sm">Localização</p>
            <p className="text-white font-semibold">{equipment.location}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-100 text-sm">Responsável</p>
            <p className="text-white font-semibold">{equipment.responsible}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-100 text-sm">Aquisição</p>
            <p className="text-white font-semibold">{formatDate(equipment.acquisitionDate)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-100 text-sm">Valor</p>
            <p className="text-white font-semibold">{formatCurrency(equipment.value)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <nav className="flex gap-1 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative ${
                activeTab === tab.id
                  ? 'text-gray-800'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-1.5 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-gray-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Especificações Técnicas */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-gray-800" />
                Especificações Técnicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500">Marca</label>
                  <p className="text-base font-medium text-gray-900 mt-1">{equipment.brand}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Modelo</label>
                  <p className="text-base font-medium text-gray-900 mt-1">{equipment.model}</p>
                </div>
              </div>
              {equipment.specs && (
                <div className="mt-6">
                  <label className="text-sm text-gray-500">Especificações Detalhadas</label>
                  <div className="mt-2 bg-white rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line">
                    {equipment.specs}
                  </div>
                </div>
              )}
            </div>

            {/* Rastreamento e Controle */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-800" />
                Rastreamento e Controle
              </h3>
              <div className="space-y-4">
                {equipment.createdAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cadastrado em</span>
                    <span className="text-sm font-medium text-gray-900">{formatDateTime(equipment.createdAt)}</span>
                  </div>
                )}
                {equipment.updatedAt && equipment.updatedAt !== equipment.createdAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Última atualização</span>
                    <span className="text-sm font-medium text-gray-900">{formatDateTime(equipment.updatedAt)}</span>
                  </div>
                )}
                {equipment.invoiceDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Data da Nota Fiscal</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(equipment.invoiceDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Observações de Manutenção */}
            {equipment.status === 'manutenção' && equipment.maintenanceDescription && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Wrench className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-900 mb-2">Observações de Manutenção</h4>
                    <p className="text-sm text-orange-800 whitespace-pre-line">
                      {equipment.maintenanceDescription}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Resumo de Atividades */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="h-8 w-8 text-gray-600" />
                  <span className="text-2xl font-bold text-gray-900">{history.length}</span>
                </div>
                <p className="text-sm font-medium text-gray-700">Total de Alterações</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <ArrowRight className="h-8 w-8 text-gray-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    {history.filter(h => h.changeType === 'transferiu').length}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700">Transferências</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <Wrench className="h-8 w-8 text-gray-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    {history.filter(h => h.changeType === 'manutenção').length}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700">Manutenções</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((entry, index) => {
                  const details = getChangeTypeDetails(entry.changeType);
                  return (
                    <div key={entry.id} className="relative">
                      {index < history.length - 1 && (
                        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                      )}
                      <div className="flex gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${details.color}`}>
                          {details.icon}
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {entry.user} {details.action}
                                {entry.field && ` ${
                                  entry.field === 'location' ? 'a localização' :
                                  entry.field === 'responsible' ? 'o responsável' :
                                  entry.field === 'status' ? 'o status' :
                                  entry.field === 'assetNumber' ? 'o número do patrimônio' : 
                                  entry.field
                                }`}
                              </p>
                              {entry.field && (entry.oldValue || entry.newValue) && (
                                <div className="mt-2 flex items-center gap-2 text-sm">
                                  <span className="text-gray-500">{entry.oldValue || '—'}</span>
                                  <ArrowRight className="h-3 w-3 text-gray-400" />
                                  <span className="font-medium text-gray-900">{entry.newValue || '—'}</span>
                                </div>
                              )}
                              {entry.changeType === 'manutenção' && entry.newValue && (
                                <p className="mt-2 text-sm text-gray-600">{entry.newValue}</p>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                              {formatDateTime(entry.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Nenhum histórico disponível</p>
                <p className="text-sm text-gray-400 mt-1">As alterações futuras serão registradas aqui</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'attachments' && (
          <div className="space-y-6">
            {/* Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                isDragging 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleFileDrop}
            >
              <Upload className={`mx-auto h-16 w-16 mb-4 ${
                isDragging ? 'text-gray-700' : 'text-gray-400'
              }`} />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Arraste arquivos aqui
              </p>
              <p className="text-sm text-gray-500 mb-6">
                ou clique para selecionar arquivos do seu computador
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.svg,.xls,.xlsx,.csv,.doc,.docx"
              />
              <Button 
                variant="primary" 
                icon={<Upload size={18} />}
                onClick={() => fileInputRef.current?.click()}
              >
                Selecionar Arquivo
              </Button>
              <p className="text-xs text-gray-400 mt-4">
                Formatos aceitos: PDF, Imagens, Planilhas, Documentos • Tamanho máximo: 10MB
              </p>
            </div>

            {/* Attachments Grid */}
            {attachments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                    <div className="flex flex-col items-center text-center">
                      {getFileIcon(attachment.type)}
                      <h4 className="mt-3 font-medium text-gray-900 text-sm truncate max-w-full">
                        {attachment.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDateTime(attachment.uploadedAt)}
                      </p>
                      <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Download size={16} />}
                          onClick={() => onDownloadAttachment(attachment)}
                        >
                          Baixar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash size={16} />}
                          onClick={() => handleDeleteClick(attachment)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Paperclip className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Nenhum anexo disponível</p>
                <p className="text-sm text-gray-400 mt-1">
                  Adicione documentos, imagens ou outros arquivos relevantes
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && attachmentToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-6">
              <Trash className="h-8 w-8 text-red-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
              Excluir Anexo?
            </h3>
            
            <p className="text-gray-600 text-center mb-8">
              O arquivo <span className="font-semibold text-gray-900">"{attachmentToDelete.name}"</span> será permanentemente removido.
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                icon={<Trash size={18} />}
                className="flex-1"
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentDetails;