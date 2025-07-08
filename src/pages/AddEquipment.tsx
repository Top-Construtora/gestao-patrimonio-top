import React, { useState, useRef, useEffect } from 'react';
import { Equipment } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useToast } from '../components/common/Toast';
import inventoryService from '../services/inventoryService';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  User, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  Plus, 
  Upload, 
  X,
  FileText,
  Image,
  File,
  CheckCircle,
  Info,
  Trash,
  Save,
  RefreshCw,
  Laptop
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

  // Carregar número de patrimônio automaticamente
  useEffect(() => {
    const loadAssetNumber = async () => {
      try {
        setLoadingAssetNumber(true);
        const nextNumber = await inventoryService.getNextAssetNumber();
        setFormData(prev => ({ ...prev, assetNumber: nextNumber }));
        showSuccess(`Número de patrimônio ${nextNumber} gerado automaticamente`);
      } catch (error) {
        console.error('Erro ao gerar número de patrimônio:', error);
        showError('Erro ao gerar número de patrimônio automático');
        setFormData(prev => ({ ...prev, assetNumber: '' }));
      } finally {
        setLoadingAssetNumber(false);
      }
    };

    loadAssetNumber();
  }, []);

  // Validação do número de patrimônio
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
    
    // Limpar erro do campo ao modificar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Validação especial para status de manutenção
    if (name === 'status' && value !== 'manutenção') {
      setFormData(prev => ({ ...prev, maintenanceDescription: undefined }));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.maintenanceDescription;
        return newErrors;
      });
    }

    // Validação em tempo real do número de patrimônio
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
      if (window.confirm('Existem alterações não salvas. Deseja realmente sair?\n\nOs dados inseridos e anexos serão perdidos.')) {
        onBack();
      }
    } else {
      onBack();
    }
  };

  // Funções de anexo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        showError(`${file.name} excede o tamanho máximo de 10MB`);
        return false;
      }
      return true;
    });

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
      return <Image className="h-5 w-5 text-gray-700" />;
    } else if (['pdf'].includes(extension || '')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Novo Equipamento</h1>
            <p className="text-gray-600 mt-1">Cadastre um novo equipamento no sistema</p>
          </div>
        </div>
      </div>

      {/* Form Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda */}
        <div className="space-y-6">
          {/* Identificação */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Laptop className="h-5 w-5 text-primary light" />
              <h3 className="text-lg font-semibold text-gray-900">Identificação</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número do Patrimônio *
                  </label>
                  <input
                    type="text"
                    name="assetNumber"
                    value={formData.assetNumber}
                    onChange={handleChange}
                    disabled={loadingAssetNumber}
                    readOnly
                    placeholder={loadingAssetNumber ? "Carregando..." : "TOP-0000"}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all text-sm ${
                      errors.assetNumber ? 
                      'border-red-300 bg-red-50' : 
                      loadingAssetNumber ? 
                      'bg-gray-100 cursor-not-allowed' : 
                      'border-gray-300 bg-gray-50'
                    }`}
                  />
                  {errors.assetNumber && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.assetNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all text-sm bg-white"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="manutenção">Em Manutenção</option>
                    <option value="desativado">Desativado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Descreva o equipamento..."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all resize-none text-sm ${
                    errors.description ? 
                    'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>

              {formData.status === 'manutenção' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição da Manutenção *
                  </label>
                  <textarea
                    name="maintenanceDescription"
                    value={formData.maintenanceDescription || ''}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Descreva o que será feito na manutenção..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all resize-none text-sm ${
                      errors.maintenanceDescription ? 
                      'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.maintenanceDescription && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.maintenanceDescription}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Detalhes Técnicos */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-secondary-dark" />
              <h3 className="text-lg font-semibold text-gray-900">Detalhes Técnicos</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Ex: Dell"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all text-sm ${
                      errors.brand ? 
                      'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.brand && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.brand}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="Ex: OptiPlex 7090"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all text-sm ${
                      errors.model ? 
                      'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.model && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.model}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especificações Técnicas
                </label>
                <textarea
                  name="specs"
                  value={formData.specs}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Ex: Intel Core i7, 16GB RAM, 512GB SSD..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all resize-none text-sm"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Coluna Direita */}
        <div className="space-y-6">
          {/* Localização e Responsável */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-accent-dark" />
              <h3 className="text-lg font-semibold text-gray-900">Localização e Responsável</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localização *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ex: Sala de TI - 2º Andar"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all text-sm ${
                    errors.location ? 
                    'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.location && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.location}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsável *
                </label>
                <input
                  type="text"
                  name="responsible"
                  value={formData.responsible}
                  onChange={handleChange}
                  placeholder="Nome do responsável"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all text-sm ${
                    errors.responsible ? 
                    'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.responsible && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.responsible}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Informações Financeiras */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Informações Financeiras</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Aquisição *
                  </label>
                  <input
                    type="date"
                    name="acquisitionDate"
                    value={formData.acquisitionDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all text-sm ${
                      errors.acquisitionDate ? 
                      'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.acquisitionDate && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.acquisitionDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data da Nota Fiscal
                  </label>
                  <input
                    type="date"
                    name="invoiceDate"
                    value={formData.invoiceDate || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all text-sm ${
                    errors.value ? 
                    'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.value && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.value}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Seção de Anexos - Largura Total */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Upload className="h-5 w-5 text-black" />
              <h3 className="text-lg font-semibold text-gray-900">Anexos</h3>
            </div>
            
            {/* Área de Upload */}
            <div 
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                isDragging 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleFileDrop}
            >
              <Upload className={`mx-auto h-10 w-10 mb-3 ${
                isDragging ? 'text-gray-700' : 'text-gray-400'
              }`} />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Arraste arquivos aqui ou clique para selecionar
              </p>
              <p className="text-xs text-gray-500 mb-3">
                PDF, Imagens, Planilhas, Documentos (máx. 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.svg,.xls,.xlsx,.csv,.doc,.docx"
              />
              <Button 
                variant="outline" 
                size="sm" 
                icon={<Upload size={16} />}
                onClick={() => fileInputRef.current?.click()}
              >
                Selecionar Arquivos
              </Button>
            </div>

            {/* Lista de Anexos */}
            {attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Arquivos Selecionados ({attachments.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {attachments.map((attachment) => (
                    <div 
                      key={attachment.id} 
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all group"
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
                            {formatFileSize(attachment.size)}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleFileRemove(attachment.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
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
          </Card>
        </div>

        {/* Mensagens de Status - Largura Total */}
        <div className="lg:col-span-2 space-y-4">
          {/* Success Preview */}
          {Object.keys(errors).length === 0 && formData.assetNumber && formData.description && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <span className="font-medium">Pronto para salvar!</span>
                <span className="ml-2">
                  Todos os campos obrigatórios foram preenchidos.
                  {attachments.length > 0 && ` ${attachments.length} anexo(s) será(ão) incluído(s).`}
                </span>
              </div>
            </div>
          )}

          {/* Form Instructions */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-5 w-5 text-gray-800 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Instruções de Cadastro:</p>
              <ul className="text-xs space-y-0.5 list-disc list-inside">
                <li>O número de patrimônio é gerado automaticamente no formato TOP-0000</li>
                <li>Campos marcados com asterisco (*) são obrigatórios</li>
                <li>Anexe documentos relevantes como notas fiscais e manuais</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
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
          disabled={Object.keys(errors).length > 0 || loadingAssetNumber}
          className="w-full sm:w-auto"
        >
          Salvar Equipamento
        </Button>
      </div>
    </div>
  );
};

export default AddEquipment;