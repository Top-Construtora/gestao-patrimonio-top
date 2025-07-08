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
  Building2
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
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'attachments'>('details');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'success';
      case 'manutenção':
        return 'warning';
      case 'desativado':
        return 'error';
      default:
        return 'default';
    }
  };

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'criou':
        return <Package className="h-4 w-4" />;
      case 'editou':
        return <Edit className="h-4 w-4" />;
      case 'excluiu':
        return <Trash className="h-4 w-4" />;
      case 'manutenção':
        return <Wrench className="h-4 w-4" />;
      case 'alterou status':
        return <Activity className="h-4 w-4" />;
      case 'anexou arquivo':
        return <Paperclip className="h-4 w-4" />;
      case 'removeu arquivo':
        return <X className="h-4 w-4" />;
      case 'transferiu':
        return <ArrowRight className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-600" />;
    if (type.includes('image')) return <Image className="h-5 w-5 text-blue-600" />;
    if (type.includes('sheet') || type.includes('excel')) return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    return <File className="h-5 w-5 text-gray-600" />;
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

  // Buscar última transferência no histórico
  const lastTransfer = history.find(entry => entry.changeType === 'transferiu' && entry.field === 'location');

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{equipment.description}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    {equipment.assetNumber}
                  </span>
                  <Badge
                    variante={
                      equipment.status === 'ativo' ? 'success' : 
                      equipment.status === 'manutenção' ? 'warning' : 
                      'error'
                    }
                  >
                    {equipment.status === 'ativo' ? 'Ativo' : 
                     equipment.status === 'manutenção' ? 'Em Manutenção' : 
                     'Desativado'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            {onTransfer && (
              <Button
                variant="outline"
                onClick={onTransfer}
                icon={<ArrowRight size={16} />}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Transferir
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 sm:flex-initial px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'details'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <Eye size={16} />
            Detalhes
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 sm:flex-initial px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <History size={16} />
            Histórico
            {history.length > 0 && (
              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-medium">
                {history.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`flex-1 sm:flex-initial px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'attachments'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <Paperclip size={16} />
            Anexos
            {attachments.length > 0 && (
              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-medium">
                {attachments.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações Gerais */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <Info className="h-5 w-5 text-accent" />
                Informações Gerais
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <MapPin className="h-4 w-4 mr-2" />
                    Localização Atual
                  </div>
                  <p className="text-gray-900 font-medium">{equipment.location}</p>
                  
                  {/* Mostrar última transferência se existir */}
                  {lastTransfer && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-blue-900 font-medium">Última Transferência</p>
                          <p className="text-blue-700">
                            De: <span className="font-medium">{lastTransfer.oldValue}</span> → Para: <span className="font-medium">{lastTransfer.newValue}</span>
                          </p>
                          <p className="text-blue-600 text-xs mt-1">
                            Por {lastTransfer.user} em {formatDateTime(lastTransfer.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <User className="h-4 w-4 mr-2" />
                    Responsável
                  </div>
                  <p className="text-gray-900">{equipment.responsible}</p>
                </div>
                
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Data de Aquisição
                  </div>
                  <p className="text-gray-900">{formatDate(equipment.acquisitionDate)}</p>
                </div>
                
                {equipment.invoiceDate && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Receipt className="h-4 w-4 mr-2" />
                      Data de Emissão da Nota Fiscal
                    </div>
                    <p className="text-gray-900">{formatDate(equipment.invoiceDate)}</p>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Valor do Equipamento
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(equipment.value)}
                  </p>
                </div>
              </div>

              {equipment.maintenanceDescription && equipment.status === 'manutenção' && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start">
                    <Wrench className="h-5 w-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-orange-800 mb-1">
                        Observações de Manutenção
                      </p>
                      <p className="text-sm text-orange-700 whitespace-pre-line">
                        {equipment.maintenanceDescription}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Detalhes Técnicos */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <Laptop className="h-5 w-5 text-secondary-light" />
                Detalhes Técnicos
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    MARCA
                  </p>
                  <p className="text-gray-900 font-medium">{equipment.brand}</p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    MODELO
                  </p>
                  <p className="text-gray-900 font-medium">{equipment.model}</p>
                </div>
                
                {equipment.specs && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      ESPECIFICAÇÕES TÉCNICAS
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {equipment.specs}
                    </p>
                  </div>
                )}
              </div>

              {/* Informações de Rastreamento */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Clock className="h-4 w-4" />
                  Informações de Rastreamento
                </div>
                <div className="space-y-2 text-sm">
                  {equipment.createdAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Cadastrado em:</span>
                      <span className="text-gray-900">{formatDateTime(equipment.createdAt)}</span>
                    </div>
                  )}
                  {equipment.updatedAt && equipment.createdAt && equipment.updatedAt !== equipment.createdAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Última atualização:</span>
                      <span className="text-gray-900">{formatDateTime(equipment.updatedAt)}</span>
                    </div>
                  )}
                  {history.filter(h => h.changeType === 'transferiu').length > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-gray-600">Total de transferências:</span>
                      <span className="text-gray-900 font-medium">
                        {history.filter(h => h.changeType === 'transferiu').length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`p-2 rounded-lg ${
                    entry.changeType === 'criou' ? 'bg-green-100 text-green-600' :
                    entry.changeType === 'editou' ? 'bg-blue-100 text-blue-600' :
                    entry.changeType === 'excluiu' ? 'bg-red-100 text-red-600' :
                    entry.changeType === 'manutenção' ? 'bg-orange-100 text-orange-600' :
                    entry.changeType === 'alterou status' ? 'bg-yellow-100 text-yellow-600' :
                    entry.changeType === 'anexou arquivo' ? 'bg-indigo-100 text-indigo-600' :
                    entry.changeType === 'removeu arquivo' ? 'bg-pink-100 text-pink-600' :
                    entry.changeType === 'transferiu' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {getChangeTypeIcon(entry.changeType)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {entry.user} {entry.changeType} 
                      {entry.field && ` ${
                        entry.field === 'location' ? 'a localização' :
                        entry.field === 'responsible' ? 'o responsável' :
                        entry.field === 'status' ? 'o status' :
                        entry.field
                      }`}
                    </p>
                    
                    {entry.field && (entry.changeType === 'editou' || entry.changeType === 'alterou status') && (
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <span className="text-gray-500">{entry.oldValue || 'Vazio'}</span>
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-900 font-medium">{entry.newValue || 'Vazio'}</span>
                      </div>
                    )}
                    
                    {entry.field && entry.changeType === 'transferiu' && (
                      <div className="mt-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">{entry.oldValue}</span>
                          <ArrowRight className="h-3 w-3 text-purple-500" />
                          <span className="text-purple-700 font-medium">{entry.newValue}</span>
                        </div>
                      </div>
                    )}
                    
                    {entry.changeType === 'manutenção' && entry.newValue && (
                      <div className="mt-2 p-2 bg-orange-50 rounded text-sm text-orange-700">
                        {entry.newValue}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateTime(entry.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum histórico disponível</p>
                <p className="text-sm text-gray-400 mt-1">
                  As alterações futuras serão registradas aqui
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'attachments' && (
          <div className="space-y-6">
            {/* Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                isDragging 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleFileDrop}
            >
              <Upload className={`mx-auto h-12 w-12 mb-3 ${
                isDragging ? 'text-blue-500' : 'text-gray-400'
              }`} />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Arraste arquivos aqui ou clique para selecionar
              </p>
              <p className="text-xs text-gray-500 mb-4">
                PDF, Imagens, Planilhas, Documentos (máx. 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.svg,.xls,.xlsx,.csv,.doc,.docx"
              />
              <Button 
                variant="outline" 
                size="sm" 
                icon={<Upload size={16} />}
                onClick={() => fileInputRef.current?.click()}
              >
                Selecionar Arquivo
              </Button>
            </div>

            {/* Attachments List */}
            {attachments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="bg-gray-50 rounded-lg p-4 flex items-center gap-3 hover:bg-gray-100 transition-colors">
                    {getFileIcon(attachment.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(attachment.size / 1024).toFixed(1)} KB • {formatDateTime(attachment.uploadedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
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
                      icon={<Trash size={16} />}
                      className="flex-1"
                    >
                      Excluir Anexo
                    </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Paperclip className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum anexo disponível</p>
                <p className="text-sm text-gray-400 mt-1">
                  Adicione documentos, imagens ou outros arquivos relevantes
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão de Anexo */}
      {showDeleteModal && attachmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Trash className="h-6 w-6 text-red-600" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Confirmar Exclusão
            </h3>
            
            <p className="text-gray-600 text-center mb-6">
              Tem certeza que deseja excluir o anexo <span className="font-semibold text-gray-900">"{attachmentToDelete.name}"</span>?
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Atenção!</p>
                  <p>Esta ação não pode ser desfeita. O arquivo será permanentemente removido do sistema.</p>
                </div>
              </div>
            </div>
            
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
                icon={<Trash size={16} />}
                className="flex-1"
              >
                Excluir Anexo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentDetails;