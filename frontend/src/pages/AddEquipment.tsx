import React, { useState, useRef, useEffect } from 'react';
import { Equipment } from '../types';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useToast } from '../components/common/Toast';
import inventoryService from '../services/inventoryService';
import { validateFiles, ALLOWED_EXTENSIONS } from '../utils/fileValidation';
import {
  Package,
  MapPin,
  User,
  DollarSign,
  AlertCircle,
  Upload,
  X,
  FileText,
  Image,
  File,
  CheckCircle,
  Info,
  Save,
  Laptop,
  Settings,
  Calendar
} from 'lucide-react';

interface AddEquipmentProps {
  onBack: () => void;
  onSubmit: (data: Omit<Equipment, 'id'>, attachmentFiles?: File[]) => void;
}

interface FormData extends Omit<Equipment, 'id'> {
  invoiceDate?: string;
}

interface Errors {
  [key: string]: string;
}

interface TempAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
}

const AddEquipment: React.FC<AddEquipmentProps> = ({ onBack, onSubmit }) => {
  const { showError, showSuccess, showWarning } = useToast();
  const [loadingAssetNumber, setLoadingAssetNumber] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    assetNumber: '',
    description: '',
    brand: '',
    model: '',
    specs: '',
    status: 'ativo',
    location: '',
    responsible: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    invoiceDate: undefined,
    value: 0,
    maintenanceDescription: undefined
  });

  const [errors, setErrors] = useState<Errors>({});
  const [hasFormChanges, setHasFormChanges] = useState(false);
  const [attachments, setAttachments] = useState<TempAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadAssetNumber = async () => {
      try {
        setLoadingAssetNumber(true);
        const nextNumber = await inventoryService.getNextAssetNumber();
        setFormData(prev => ({ ...prev, assetNumber: nextNumber }));
        showSuccess(`Número de patrimônio ${nextNumber} gerado automaticamente`);
      } catch (error) {
        showError('Erro ao gerar número de patrimônio automático');
        setFormData(prev => ({ ...prev, assetNumber: '' }));
      } finally {
        setLoadingAssetNumber(false);
      }
    };

    loadAssetNumber();
  }, []);

  const validateAssetNumber = async (assetNumber: string): Promise<boolean> => {
    if (!assetNumber.trim()) {
      setErrors(prev => ({ ...prev, assetNumber: 'Número do patrimônio é obrigatório' }));
      return false;
    }

    if (!assetNumber.match(/^TOP-\d{4}$/)) {
      setErrors(prev => ({ ...prev, assetNumber: 'Formato inválido. Use TOP-0000' }));
      return false;
    }

    try {
      const validation = await inventoryService.validateAssetNumber(assetNumber);
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, assetNumber: validation.message || 'Número inválido' }));
        return false;
      }
      return true;
    } catch (error) {
      setErrors(prev => ({ ...prev, assetNumber: 'Erro ao validar número' }));
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.assetNumber.trim()) {
      newErrors.assetNumber = 'Número do patrimônio é obrigatório';
    } else if (!formData.assetNumber.match(/^TOP-\d{4}$/)) {
      newErrors.assetNumber = 'Formato inválido. Use TOP-0000';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Marca é obrigatória';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Modelo é obrigatório';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Localização é obrigatória';
    }

    if (!formData.responsible.trim()) {
      newErrors.responsible = 'Responsável é obrigatório';
    }

    if (!formData.acquisitionDate) {
      newErrors.acquisitionDate = 'Data de aquisição é obrigatória';
    }

    if (formData.value <= 0) {
      newErrors.value = 'Valor deve ser maior que zero';
    }

    if (formData.status === 'manutenção' && !formData.maintenanceDescription?.trim()) {
      newErrors.maintenanceDescription = 'Descrição da manutenção é obrigatória quando o status é "Em Manutenção"';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setHasFormChanges(true);

    setFormData(prev => ({
      ...prev,
      [name]: name === 'value' ? parseFloat(value) || 0 : value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === 'status' && value !== 'manutenção') {
      setFormData(prev => ({ ...prev, maintenanceDescription: undefined }));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.maintenanceDescription;
        return newErrors;
      });
    }

    if (name === 'assetNumber' && value) {
      const timeoutId = setTimeout(async () => {
        await validateAssetNumber(value);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleSubmit = async () => {
    const isAssetNumberValid = await validateAssetNumber(formData.assetNumber);
    if (!isAssetNumberValid) {
      showError('Número de patrimônio inválido ou já existe');
      return;
    }

    if (!validateForm()) {
      showError('Por favor, corrija os erros no formulário');
      return;
    }

    const attachmentFiles = attachments.map(att => att.file);
    await onSubmit(formData, attachmentFiles);
  };

  const handleCancel = () => {
    if (hasFormChanges || attachments.length > 0) {
      setShowCancelModal(true);
    } else {
      onBack();
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    onBack();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFiles = (files: File[]) => {
    const { validFiles, errors } = validateFiles(files);
    errors.forEach(error => showError(error));

    const newAttachments: TempAttachment[] = validFiles.map(file => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
    setHasFormChanges(true);

    if (newAttachments.length > 0) {
      showSuccess(`${newAttachments.length} arquivo(s) adicionado(s)`);
    }
  };

  const handleFileRemove = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    showWarning('Arquivo removido');
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
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
      return <Image className="h-5 w-5 text-primary" />;
    } else if (['pdf'].includes(extension || '')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Novo Equipamento</h1>
        <p className="text-gray-500 mt-1 text-sm">Cadastre um novo equipamento no sistema</p>
      </div>

      {/* Form Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda */}
        <div className="space-y-6">
          {/* Identificação */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Laptop className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Identificação</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                    Patrimônio *
                  </label>
                  <input
                    type="text"
                    name="assetNumber"
                    value={formData.assetNumber}
                    onChange={handleChange}
                    disabled={loadingAssetNumber}
                    readOnly
                    placeholder={loadingAssetNumber ? "Carregando..." : "TOP-0000"}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all duration-200 ${errors.assetNumber
                        ? 'border-red-300 bg-red-50 focus:ring-red-200'
                        : loadingAssetNumber
                          ? 'bg-gray-100 cursor-not-allowed border-gray-200'
                          : 'border-gray-200 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                      }`}
                  />
                  {errors.assetNumber && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.assetNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="manutenção">Em Manutenção</option>
                    <option value="desativado">Desativado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                  Descrição *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Descreva o equipamento..."
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm resize-none transition-all duration-200 ${errors.description
                      ? 'border-red-300 bg-red-50 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    }`}
                />
                {errors.description && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.description}
                  </p>
                )}
              </div>

              {formData.status === 'manutenção' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                    Descrição da Manutenção *
                  </label>
                  <textarea
                    name="maintenanceDescription"
                    value={formData.maintenanceDescription || ''}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Descreva o que será feito na manutenção..."
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm resize-none transition-all duration-200 ${errors.maintenanceDescription
                        ? 'border-red-300 bg-red-50 focus:ring-red-200'
                        : 'border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                      }`}
                  />
                  {errors.maintenanceDescription && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.maintenanceDescription}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Detalhes Técnicos */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Settings className="h-4 w-4 text-secondary" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Detalhes Técnicos</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                    Marca *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Ex: Dell"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all duration-200 ${errors.brand
                        ? 'border-red-300 bg-red-50 focus:ring-red-200'
                        : 'border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                      }`}
                  />
                  {errors.brand && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.brand}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="Ex: OptiPlex 7090"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all duration-200 ${errors.model
                        ? 'border-red-300 bg-red-50 focus:ring-red-200'
                        : 'border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                      }`}
                  />
                  {errors.model && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.model}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                  Especificações Técnicas
                </label>
                <textarea
                  name="specs"
                  value={formData.specs}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Ex: Intel Core i7, 16GB RAM, 512GB SSD..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita */}
        <div className="space-y-6">
          {/* Localização e Responsável */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <div className="p-2 bg-accent/10 rounded-lg">
                <MapPin className="h-4 w-4 text-accent" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Localização</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                  Localização *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ex: Sala de TI - 2º Andar"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all duration-200 ${errors.location
                      ? 'border-red-300 bg-red-50 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    }`}
                />
                {errors.location && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.location}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                  Responsável *
                </label>
                <input
                  type="text"
                  name="responsible"
                  value={formData.responsible}
                  onChange={handleChange}
                  placeholder="Nome do responsável"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all duration-200 ${errors.responsible
                      ? 'border-red-300 bg-red-50 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    }`}
                />
                {errors.responsible && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.responsible}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Informações Financeiras */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <div className="p-2 bg-gray-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-gray-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Financeiro</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                    Data Aquisição *
                  </label>
                  <input
                    type="date"
                    name="acquisitionDate"
                    value={formData.acquisitionDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all duration-200 ${errors.acquisitionDate
                        ? 'border-red-300 bg-red-50 focus:ring-red-200'
                        : 'border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                      }`}
                  />
                  {errors.acquisitionDate && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.acquisitionDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                    Data Nota Fiscal
                  </label>
                  <input
                    type="date"
                    name="invoiceDate"
                    value={formData.invoiceDate || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                  Valor (R$) *
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value || ''}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all duration-200 ${errors.value
                      ? 'border-red-300 bg-red-50 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    }`}
                />
                {errors.value && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.value}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Anexos - Largura Total */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Upload className="h-4 w-4 text-secondary" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Anexos</h3>
            </div>

            {/* Área de Upload */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleFileDrop}
            >
              <Upload className={`mx-auto h-10 w-10 mb-3 ${isDragging ? 'text-primary' : 'text-gray-400'
                }`} />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Arraste arquivos aqui ou clique para selecionar
              </p>
              <p className="text-xs text-gray-400 mb-4">
                PDF, Imagens, Planilhas, Documentos (máx. 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                multiple
                accept={ALLOWED_EXTENSIONS.join(',')}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Upload size={16} />
                Selecionar Arquivos
              </button>
            </div>

            {/* Lista de Anexos */}
            {attachments.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-600 mb-3 uppercase tracking-wide">
                  Arquivos Selecionados ({attachments.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getFileIcon(attachment.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatFileSize(attachment.size)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleFileRemove(attachment.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover anexo"
                        type="button"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mensagens de Status - Largura Total */}
        <div className="lg:col-span-2 space-y-3">
          {/* Success Preview */}
          {Object.keys(errors).length === 0 && formData.assetNumber && formData.description && (
            <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <span className="font-medium">Pronto para salvar!</span>
                <span className="ml-2 text-gray-500">
                  Todos os campos obrigatórios foram preenchidos.
                  {attachments.length > 0 && ` ${attachments.length} anexo(s) será(ão) incluído(s).`}
                </span>
              </div>
            </div>
          )}

          {/* Form Instructions */}
          <div className="flex items-start gap-3 p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
            <Info className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-700 mb-1">Instruções de Cadastro:</p>
              <ul className="text-xs space-y-0.5 list-disc list-inside text-gray-500">
                <li>O número de patrimônio é gerado automaticamente no formato TOP-0000</li>
                <li>Campos marcados com asterisco (*) são obrigatórios</li>
                <li>Anexe documentos relevantes como notas fiscais e manuais</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          onClick={handleCancel}
          className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={Object.keys(errors).length > 0 || loadingAssetNumber}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-secondary text-white font-medium text-sm rounded-lg hover:bg-secondary-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          Salvar Equipamento
        </button>
      </div>

      {/* Modal de Confirmação de Cancelamento */}
      <ConfirmationModal
        isOpen={showCancelModal}
        title="Descartar alterações?"
        message="Existem alterações não salvas. Deseja realmente sair?"
        description="Os dados inseridos e anexos serão perdidos."
        confirmLabel="Sair"
        cancelLabel="Continuar editando"
        variant="warning"
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
};

export default AddEquipment;
