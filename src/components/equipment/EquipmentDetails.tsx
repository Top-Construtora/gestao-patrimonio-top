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
  Tag
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
}

const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({ 
  equipment, 
  history,
  attachments,
  onEdit,
  onDelete,
  onUploadAttachment,
  onDeleteAttachment,
  onDownloadAttachment
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'attachments'>('details');
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const dateOnly = dateString.includes('T') ? dateString.split('T')[0] : dateString;
    const [year, month, day] = dateOnly.split('-').map(Number);
    const date = new Date(year, month - 1, day); 
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para traduzir nomes dos campos
  const getFieldDisplayName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      assetNumber: 'Número do Patrimônio',
      description: 'Descrição',
      brand: 'Marca',
      model: 'Modelo',
      specs: 'Especificações',
      status: 'Status',
      location: 'Localização',
      responsible: 'Responsável',
      acquisitionDate: 'Data de Aquisição',
      invoiceDate: 'Data da Nota Fiscal',
      value: 'Valor',
      maintenanceDescription: 'Observações de Manutenção',
      observacoesManutenção: 'Observações de Manutenção'
    };
    return fieldNames[field] || field;
  };

  const getChangeTypeText = (changeType: string) => {
    switch (changeType) {
      case 'criou':
        return 'Criação';
      case 'editou':
        return 'Edição';
      case 'excluiu':
        return 'Exclusão';
      case 'manutenção':
        return 'Manutenção';
      case 'anexou arquivo':
        return 'Anexo Adicionado';
      case 'removeu arquivo':
        return 'Anexo Removido';
      default:
        return 'Alteração';
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return <Image className="h-5 w-5 text-gray-500" />;
    } else if (['pdf'].includes(extension)) {
      return <FileText className="h-5 w-5 text-gray-500" />;
    } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
      return <FileSpreadsheet className="h-5 w-5 text-gray-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onUploadAttachment(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUploadAttachment(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDeleteAttachmentClick = (attachment: Attachment) => {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="bg-blue-50 p-6 rounded-t-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start gap-4">
            <Package className="h-10 w-10 text-blue-600 mt-1" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{equipment.description}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Tag className="h-4 w-4" />
                  <span className="font-medium">{equipment.assetNumber}</span>
                </div>
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
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onEdit(equipment.id)}
              icon={<Edit size={16} />}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              onClick={() => onDelete(equipment.id)}
              icon={<Trash size={16} />}
            >
              Excluir
            </Button>
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
                <Info className="h-5 w-5 text-blue-600" />
                Informações Gerais
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <MapPin className="h-4 w-4 mr-2" />
                    Localização
                  </div>
                  <p className="text-gray-900">{equipment.location}</p>
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
                <Laptop className="h-5 w-5 text-purple-600" />
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

              {equipment.createdAt && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Cadastrado em {formatDateTime(equipment.createdAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((entry) => (
                <div 
                  key={entry.id} 
                  className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="mt-1">
                    {entry.changeType === 'criou' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                    {entry.changeType === 'editou' && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    {entry.changeType === 'excluiu' && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                    {entry.changeType === 'manutenção' && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    )}
                    {(entry.changeType === 'anexou arquivo' || entry.changeType === 'removeu arquivo') && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {entry.user}
                      </span>
                      <span className="text-sm text-gray-600">
                        {getChangeTypeText(entry.changeType).toLowerCase()}
                      </span>
                      {entry.field && (
                        <span className="text-sm text-gray-600">
                          {getFieldDisplayName(entry.field).toLowerCase()}
                        </span>
                      )}
                    </div>
                    
                    {entry.changeType === 'manutenção' && entry.newValue && (
                      <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-700 whitespace-pre-line">
                          {entry.newValue}
                        </p>
                      </div>
                    )}
                    
                    {entry.changeType === 'anexou arquivo' && entry.newValue && (
                      <p className="text-sm text-gray-600">
                        Arquivo: <span className="font-medium">{entry.newValue}</span>
                      </p>
                    )}
                    
                    {entry.changeType === 'removeu arquivo' && entry.oldValue && (
                      <p className="text-sm text-gray-600">
                        Arquivo: <span className="font-medium">{entry.oldValue}</span>
                      </p>
                    )}
                    
                    {entry.field && entry.changeType === 'editou' && (
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <span className="text-gray-500">{entry.oldValue || 'Vazio'}</span>
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-900 font-medium">{entry.newValue || 'Vazio'}</span>
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
              <div className="space-y-3">
                {attachments.map((attachment) => (
                  <div 
                    key={attachment.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {getFileIcon(attachment.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(attachment.size)} • {attachment.uploadedBy} • {formatDateTime(attachment.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => onDownloadAttachment(attachment)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Baixar arquivo"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAttachmentClick(attachment)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover anexo"
                      >
                        <Trash size={16} />
                      </button>
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