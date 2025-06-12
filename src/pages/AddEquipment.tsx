import React, { useState, useRef } from 'react';
import { Equipment } from '../types';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { 
  ArrowLeft, 
  Save,
  Package,
  MapPin,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Plus,
  Upload,
  File,
  Image,
  FileSpreadsheet,
  FileText,
  Trash,
  Paperclip,
  Info,
  Laptop,
  Receipt
} from 'lucide-react';

interface AddEquipmentProps {
  onBack: () => void;
  onSubmit: (data: Omit<Equipment, 'id'>, attachments?: File[]) => void;
}

// Interface para anexos temporários
interface TempAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
}

const AddEquipment: React.FC<AddEquipmentProps> = ({ onBack, onSubmit }) => {
  const [formData, setFormData] = useState<Omit<Equipment, 'id'>>({
    assetNumber: '',
    description: '',
    brand: '',
    model: '',
    specs: '',
    status: 'ativo',
    location: '',
    responsible: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    invoiceDate: '', 
    value: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<TempAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let parsedValue: string | number = value;
    if (name === 'value') {
      parsedValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    const numericValue = parseInt(rawValue, 10) / 100 || 0;
    
    setFormData(prev => ({
      ...prev,
      value: numericValue
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Funções para anexos
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
    files.forEach(file => handleFileAdd(file));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => handleFileAdd(file));
    }
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileAdd = (file: File) => {
    // Validar tamanho do arquivo (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande. Tamanho máximo permitido: 10MB');
      return;
    }

    // Validar tipo do arquivo
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo não permitido');
      return;
    }

    const tempAttachment: TempAttachment = {
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      size: file.size,
      type: file.type
    };

    setAttachments(prev => [...prev, tempAttachment]);
  };

  const handleFileRemove = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.assetNumber.trim()) newErrors.assetNumber = 'Obrigatório';
    if (!formData.description.trim()) newErrors.description = 'Obrigatório';
    if (!formData.brand.trim()) newErrors.brand = 'Obrigatório';
    if (!formData.model.trim()) newErrors.model = 'Obrigatório';
    if (!formData.location.trim()) newErrors.location = 'Obrigatório';
    if (!formData.responsible.trim()) newErrors.responsible = 'Obrigatório';
    if (formData.value <= 0) newErrors.value = 'Valor inválido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      // Extrair os arquivos dos anexos temporários
      const files = attachments.map(att => att.file);
      onSubmit(formData, files);
    }
  };

  const handleCancel = () => {
    if (Object.values(formData).some(value => value && value !== 'ativo' && value !== new Date().toISOString().split('T')[0] && value !== 0) || attachments.length > 0) {
      if (confirm('Tem certeza que deseja cancelar? Os dados inseridos e anexos serão perdidos.')) {
        onBack();
      }
    } else {
      onBack();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Novo Equipamento</h1>
            <p className="text-gray-600 mt-2">Cadastre um novo equipamento no sistema</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">Cadastro</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        {/* Identificação */}
        <Card 
          title="Identificação" 
          subtitle="Informações básicas do equipamento"
          icon={<Package className="h-5 w-5 text-blue-600" />}
          variant="elevated"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do Patrimônio *
              </label>
              <input
                type="text"
                name="assetNumber"
                value={formData.assetNumber}
                onChange={handleChange}
                placeholder="PAT-2024-001"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.assetNumber ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.assetNumber && (
                <div className="mt-2 flex items-center text-xs text-red-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.assetNumber}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
              >
                <option value="ativo">Ativo</option>
                <option value="manutenção">Em Manutenção</option>
                <option value="desativado">Desativado</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Descreva o equipamento..."
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.description && (
                <div className="mt-2 flex items-center text-xs text-red-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.description}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Localização e Responsável */}
        <Card 
          title="Localização e Responsável" 
          subtitle="Onde está e quem é responsável"
          icon={<MapPin className="h-5 w-5 text-purple-600" />}
          variant="elevated"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Localização *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Escritório Principal / Obra Central"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.location ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.location && (
                <div className="mt-2 flex items-center text-xs text-red-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.location}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Responsável *
              </label>
              <input
                type="text"
                name="responsible"
                value={formData.responsible}
                onChange={handleChange}
                placeholder="Nome do responsável"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.responsible ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.responsible && (
                <div className="mt-2 flex items-center text-xs text-red-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.responsible}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Informações Técnicas */}
        <Card 
          title="Informações Técnicas" 
          subtitle="Detalhes técnicos do equipamento"
          icon={<Laptop className="h-5 w-5 text-green-600" />}
          variant="elevated"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="inline h-4 w-4 mr-1" />
                Marca *
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Dell, HP, Lenovo..."
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.brand ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.brand && (
                <div className="mt-2 flex items-center text-xs text-red-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.brand}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo *
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="OptiPlex 7090"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.model ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.model && (
                <div className="mt-2 flex items-center text-xs text-red-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.model}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especificações
              </label>
              <textarea
                name="specs"
                value={formData.specs}
                onChange={handleChange}
                rows={3}
                placeholder="Processador, memória, armazenamento... (opcional)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 resize-none"
              />
            </div>
          </div>
        </Card>

        {/* Informações Financeiras */}
        <Card 
          title="Informações Financeiras" 
          subtitle="Valor e data de aquisição"
          icon={<DollarSign className="h-5 w-5 text-yellow-600" />}
          variant="elevated"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Data de Aquisição
              </label>
              <input
                type="date"
                name="acquisitionDate"
                value={formData.acquisitionDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-gray-400" />
                Data de Emissão da Nota Fiscal
              </label>
              <div>
                <input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                  placeholder="Data opcional"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                (opcional)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Valor *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="text"
                  name="value"
                  value={formatCurrency(formData.value).replace('R$', '').trim()}
                  onChange={handleValueChange}
                  placeholder="0,00"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.value ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
              </div>
              {errors.value && (
                <div className="mt-2 flex items-center text-xs text-red-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.value}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Anexos */}
        <Card 
          title="Anexos" 
          subtitle="Documentos e imagens (opcional)"
          icon={<Paperclip className="h-5 w-5 text-indigo-600" />}
          variant="elevated"
        >
          {/* Upload Area */}
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 mb-6 ${
              isDragging 
                ? 'border-blue-400 bg-blue-50 scale-105' 
                : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleFileDrop}
          >
            <div className="relative">
              <Upload className={`mx-auto h-12 w-12 mb-4 transition-all duration-300 ${
                isDragging ? 'text-blue-500 scale-110' : 'text-gray-400'
              }`} />
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
                multiple
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.svg,.xls,.xlsx,.csv,.doc,.docx"
              />
              <Button 
                variant="outline" 
                size="sm" 
                icon={<Upload size={16} />}
                onClick={() => fileInputRef.current?.click()}
                type="button"
                className="hover:scale-105 transition-transform"
              >
                Selecionar Arquivos
              </Button>
            </div>
          </div>

          {/* Lista de Anexos */}
          {attachments.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">
                  Arquivos Selecionados
                </h4>
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
                  {attachments.length}
                </span>
              </div>
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div 
                    key={attachment.id}
                    className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                        {getFileIcon(attachment.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(attachment.size)}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleFileRemove(attachment.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                      title="Remover anexo"
                      type="button"
                    >
                      <Trash size={16} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informações sobre anexos */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">Dicas para anexos:</p>
                <ul className="space-y-1 list-disc list-inside text-xs">
                  <li>Anexe notas fiscais, manuais, fotos do equipamento</li>
                  <li>Documentos de garantia e certificados</li>
                  <li>Arquivos serão salvos junto com o equipamento</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Success Preview */}
        {Object.keys(errors).length === 0 && formData.assetNumber && formData.description && (
          <Card 
            status="success"
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
            className="border-green-200 bg-green-50"
          >
            <div className="text-sm text-green-800">
              <p className="font-semibold">Pronto para salvar!</p>
              <p className="mt-1">
                Todos os campos obrigatórios foram preenchidos corretamente.
                {attachments.length > 0 && ` ${attachments.length} anexo(s) será(ão) incluído(s).`}
              </p>
            </div>
          </Card>
        )}

        {/* Form Instructions */}
        <Card 
          status="info"
          icon={<Info className="h-5 w-5 text-blue-600" />}
          className="border-blue-200 bg-blue-50"
        >
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-2">Instruções de Cadastro</p>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li>Use códigos padronizados para patrimônio (ex: COMP-001 para computadores, MOB-001 para móveis)</li>
              <li>Para equipamentos de obra, identifique claramente a localização da obra</li>
              <li>Mantenha as especificações técnicas detalhadas para melhor controle</li>
              <li>Os campos com asterisco (*) são obrigatórios</li>
              <li>Anexos ajudam na documentação e controle do equipamento</li>
            </ul>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            icon={<Save className="h-4 w-4" />}
            disabled={Object.keys(errors).length > 0}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Salvar Equipamento
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddEquipment;