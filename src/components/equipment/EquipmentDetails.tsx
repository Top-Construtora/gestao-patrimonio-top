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
  Eye
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

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'criou':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'editou':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'excluiu':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manutenção':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return <Image className="h-5 w-5 text-green-600" />;
    } else if (['pdf'].includes(extension)) {
      return <FileText className="h-5 w-5 text-red-600" />;
    } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
      return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />;
    } else {
      return <File className="h-5 w-5 text-gray-600" />;
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

  const handleExportDetails = () => {
    const content = `
RELATÓRIO DE EQUIPAMENTO
========================

Número de Patrimônio: ${equipment.assetNumber}
Descrição: ${equipment.description}
Marca: ${equipment.brand}
Modelo: ${equipment.model}
Especificações: ${equipment.specs || 'N/A'}
Status: ${equipment.status}
Localização: ${equipment.location}
Responsável: ${equipment.responsible}
Data de Aquisição: ${formatDate(equipment.acquisitionDate)}
Valor: ${formatCurrency(equipment.value)}

Gerado em: ${new Date().toLocaleString('pt-BR')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `equipamento-${equipment.assetNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start lg:items-center flex-col lg:flex-row gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{equipment.assetNumber}</h2>
                <p className="text-sm text-gray-600 mt-0.5">{equipment.description}</p>
              </div>
            </div>
            <Badge variante={equipment.status}>
              {equipment.status === 'ativo' ? 'Ativo' : 
               equipment.status === 'manutenção' ? 'Em Manutenção' : 'Desativado'}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              icon={<Edit size={16} />}
              onClick={() => onEdit(equipment.id)}
            >
              Editar
            </Button>
            <Button 
              variant="danger" 
              size="sm" 
              icon={<Trash size={16} />}
              onClick={() => onDelete(equipment.id)}
            >
              Excluir
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              icon={<Download size={16} />}
              onClick={handleExportDetails}
            >
              Exportar
            </Button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex mt-6 -mb-px">
          <button
            className={`py-3 px-6 rounded-t-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'details'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('details')}
          >
            <div className="flex items-center gap-2">
              <FileText size={16} />
              Detalhes
            </div>
          </button>
          <button
            className={`ml-2 py-3 px-6 rounded-t-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'history'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('history')}
          >
            <div className="flex items-center gap-2">
              <History size={16} />
              Histórico
              {history.length > 0 && (
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                  {history.length}
                </span>
              )}
            </div>
          </button>
          <button
            className={`ml-2 py-3 px-6 rounded-t-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'attachments'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('attachments')}
          >
            <div className="flex items-center gap-2">
              <Paperclip size={16} />
              Anexos
              {attachments.length > 0 && (
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                  {attachments.length}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText size={16} className="text-blue-600" />
                </div>
                Informações Básicas
              </h3>
              
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-medium">{equipment.location}</dd>
                    </div>
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-medium">{equipment.responsible}</dd>
                    </div>
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Aquisição</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-medium">{formatDate(equipment.acquisitionDate)}</dd>
                    </div>
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <dt className="text-xs font-medium text-blue-700 uppercase tracking-wider">Valor de Aquisição</dt>
                      <dd className="mt-1 text-lg text-blue-900 font-bold">{formatCurrency(equipment.value)}</dd>
                    </div>
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Detalhes Técnicos */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Laptop size={16} className="text-purple-600" />
                </div>
                Detalhes Técnicos
              </h3>
              
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{equipment.brand}</dd>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{equipment.model}</dd>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Especificações</dt>
                  <dd className="mt-2 text-sm text-gray-900 whitespace-pre-line">
                    {equipment.specs || 'Nenhuma especificação cadastrada'}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((entry) => (
                <div 
                  key={entry.id} 
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Activity className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getChangeTypeColor(entry.changeType)}`}>
                            {entry.changeType === 'criou' ? 'Criação' : 
                             entry.changeType === 'editou' ? 'Edição' : 
                             entry.changeType === 'excluiu' ? 'Exclusão' : 
                             entry.changeType === 'manutenção' ? 'Manutenção' :
                             'Alteração de Status'}
                          </span>
                          <span className="text-xs text-gray-500">
                            por <span className="font-medium text-gray-700">{entry.user}</span>
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-700">
                          {entry.changeType === 'criou' ? (
                            <p>Equipamento cadastrado no sistema</p>
                          ) : entry.changeType === 'excluiu' ? (
                            <p>Equipamento removido do sistema</p>
                          ) : entry.changeType === 'manutenção' ? (
                            <div className="space-y-2">
                              <p className="font-medium text-orange-800">🔧 Equipamento enviado para manutenção</p>
                              {entry.newValue && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                  <p className="text-sm font-medium text-orange-800 mb-1">Observações:</p>
                                  <p className="text-sm text-orange-700 whitespace-pre-line">{entry.newValue}</p>
                                </div>
                              )}
                            </div>
                          ) : entry.field ? (
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900">{entry.field}</p>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-red-600 line-through">{entry.oldValue || 'Vazio'}</span>
                                <ChevronRight className="h-3 w-3 text-gray-400" />
                                <span className="text-green-600 font-medium">{entry.newValue || 'Vazio'}</span>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDateTime(entry.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum histórico disponível</p>
                <p className="text-sm text-gray-400 mt-2">As alterações futuras serão registradas aqui</p>
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
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleFileDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-2">
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
                <h4 className="text-sm font-medium text-gray-900">Arquivos Anexados ({attachments.length})</h4>
                {attachments.map((attachment) => (
                  <div 
                    key={attachment.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getFileIcon(attachment.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(attachment.size)} • {formatDateTime(attachment.uploadedAt)} • {attachment.uploadedBy}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => onDownloadAttachment(attachment)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Baixar arquivo"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir este anexo?')) {
                            onDeleteAttachment(attachment.id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir anexo"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Paperclip className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum arquivo anexado</p>
                <p className="text-sm text-gray-400 mt-2">
                  Anexe manuais, notas fiscais, fotos e documentos importantes
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentDetails;