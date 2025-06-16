// components/purchases/PurchaseToEquipmentModal.tsx
import React, { useState, useEffect } from 'react';
import { EquipmentPurchase } from '../../types/purchaseTypes';
import { Equipment } from '../../types';
import Button from '../common/Button';
import { 
  X, 
  Package, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  DollarSign,
  MapPin,
  User,
  FileText,
  Tag,
  Wrench,
  ShoppingCart,
  ArrowRight
} from 'lucide-react';
import inventoryService from '../../services/inventoryService';
import { useToast } from '../common/Toast';

interface PurchaseToEquipmentModalProps {
  isOpen: boolean;
  purchase: EquipmentPurchase | null;
  onClose: () => void;
  onSuccess: (equipmentData: Omit<Equipment, 'id'>) => void;
}

interface ConversionFormData {
  assetNumber: string;
  brand: string;
  model: string;
  specs: string;
  location: string;
  responsible: string;
  acquisitionDate: string;
  invoiceDate: string;
  value: number;
  status: 'ativo' | 'manutenção' | 'desativado';
  maintenanceDescription?: string;
}

const PurchaseToEquipmentModal: React.FC<PurchaseToEquipmentModalProps> = ({
  isOpen,
  purchase,
  onClose,
  onSuccess
}) => {
  const { showError, showSuccess } = useToast();
  const [loadingAssetNumber, setLoadingAssetNumber] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ConversionFormData>({
    assetNumber: '',
    brand: '',
    model: '',
    specs: '',
    location: '',
    responsible: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    invoiceDate: '',
    value: 0,
    status: 'ativo',
    maintenanceDescription: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preencher dados automaticamente quando o modal abrir
  useEffect(() => {
    if (isOpen && purchase) {
      // Preencher com dados da solicitação
      setFormData(prev => ({
        ...prev,
        value: purchase.estimatedTotalValue,
        responsible: purchase.requestedBy,
        acquisitionDate: new Date().toISOString().split('T')[0]
      }));

      // Gerar número de patrimônio automaticamente
      loadAssetNumber();
    }
  }, [isOpen, purchase]);

  const loadAssetNumber = async () => {
    try {
      setLoadingAssetNumber(true);
      const nextNumber = await inventoryService.getNextAssetNumber();
      setFormData(prev => ({ ...prev, assetNumber: nextNumber }));
    } catch (error) {
      console.error('Erro ao gerar número de patrimônio:', error);
      showError('Erro ao gerar número de patrimônio automático');
    } finally {
      setLoadingAssetNumber(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.assetNumber.trim()) {
      newErrors.assetNumber = 'Número de patrimônio é obrigatório';
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
    if (formData.value <= 0) {
      newErrors.value = 'Valor deve ser maior que zero';
    }
    if (formData.status === 'manutenção' && !formData.maintenanceDescription?.trim()) {
      newErrors.maintenanceDescription = 'Descrição da manutenção é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    
    // Limpar erro do campo
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

  const handleSubmit = async () => {
    if (!purchase) return;
    
    if (!validateForm()) {
      showError('Por favor, corrija os erros no formulário');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Criar objeto Equipment com os dados do formulário
      const newEquipment: Omit<Equipment, 'id'> = {
        assetNumber: formData.assetNumber,
        description: purchase.description,
        brand: formData.brand,
        model: formData.model,
        specs: formData.specs || undefined,
        status: formData.status,
        location: formData.location,
        responsible: formData.responsible,
        acquisitionDate: formData.acquisitionDate,
        invoiceDate: formData.invoiceDate || undefined,
        value: formData.value,
        maintenanceDescription: formData.status === 'manutenção' ? formData.maintenanceDescription : undefined
      };

      // Chamar a função de sucesso com os dados do equipamento
      onSuccess(newEquipment);
      
      showSuccess('Dados preenchidos com sucesso!');
    } catch (error) {
      console.error('Erro ao processar conversão:', error);
      showError('Erro ao processar dados');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        assetNumber: '',
        brand: '',
        model: '',
        specs: '',
        location: '',
        responsible: '',
        acquisitionDate: new Date().toISOString().split('T')[0],
        invoiceDate: '',
        value: 0,
        status: 'ativo',
        maintenanceDescription: ''
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen || !purchase) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Converter para Equipamento</h2>
              <p className="text-blue-100 text-sm">Registrar aquisição no inventário</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Informações da Solicitação */}
        <div className="bg-blue-50 px-6 py-4 border-b">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{purchase.description}</h3>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  {purchase.category}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {formatCurrency(purchase.estimatedTotalValue)}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Solicitado por {purchase.requestedBy}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna Esquerda */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="h-5 w-5 text-gray-600" />
                Identificação do Equipamento
              </h3>
              
              {/* Número de Patrimônio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número do Patrimônio *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="assetNumber"
                    value={formData.assetNumber}
                    onChange={handleChange}
                    disabled={loadingAssetNumber}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.assetNumber ? 'border-red-500' : 'border-gray-300'
                    } ${loadingAssetNumber ? 'bg-gray-100' : ''}`}
                    placeholder="TOP-0000"
                  />
                  {loadingAssetNumber && (
                    <div className="absolute right-3 top-2.5">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
                {errors.assetNumber && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.assetNumber}
                  </p>
                )}
              </div>

              {/* Marca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca *
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.brand ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Dell, HP, Lenovo"
                />
                {errors.brand && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.brand}
                  </p>
                )}
              </div>

              {/* Modelo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.model ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Latitude 5420"
                />
                {errors.model && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.model}
                  </p>
                )}
              </div>

              {/* Especificações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especificações Técnicas
                </label>
                <textarea
                  name="specs"
                  value={formData.specs}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Ex: Intel Core i5, 8GB RAM, 256GB SSD..."
                />
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                Informações de Aquisição
              </h3>

              {/* Localização */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localização *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Sala de TI, Escritório Central"
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.location}
                  </p>
                )}
              </div>

              {/* Responsável */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsável *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="responsible"
                    value={formData.responsible}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.responsible ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nome do responsável"
                  />
                </div>
                {errors.responsible && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.responsible}
                  </p>
                )}
              </div>

              {/* Datas */}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data da Nota Fiscal
                  </label>
                  <input
                    type="date"
                    name="invoiceDate"
                    value={formData.invoiceDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Final *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formatCurrency(formData.value)}
                    onChange={handleValueChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.value ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="R$ 0,00"
                  />
                </div>
                {errors.value && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.value}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status do Equipamento *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ativo">Ativo</option>
                  <option value="manutenção">Em Manutenção</option>
                  <option value="desativado">Desativado</option>
                </select>
              </div>

              {/* Descrição de Manutenção */}
              {formData.status === 'manutenção' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição da Manutenção *
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3">
                      <Wrench className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      name="maintenanceDescription"
                      value={formData.maintenanceDescription}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                        errors.maintenanceDescription ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Descreva o que está sendo feito..."
                    />
                  </div>
                  {errors.maintenanceDescription && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.maintenanceDescription}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Após conversão, a solicitação será marcada como adquirida</span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              isLoading={isSubmitting}
              loadingText="Convertendo..."
              icon={<ArrowRight size={16} />}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              Converter para Equipamento
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseToEquipmentModal;