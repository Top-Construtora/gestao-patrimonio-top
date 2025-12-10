// pages/AddEquipmentPurchase.tsx
import React, { useState, useEffect } from 'react';
import { EquipmentPurchase, PurchaseUrgency } from '../types/purchaseTypes';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { 
  ArrowLeft, 
  Save, 
  AlertCircle,
  Calendar,
  MapPin,
  Building2,
  FileText,
  AlertTriangle,
  Briefcase,
  Package,
  Monitor,
  Cpu
} from 'lucide-react';
import { useToast } from '../components/common/Toast';

interface AddEquipmentPurchaseProps {
  onBack: () => void;
  onSubmit: (data: Omit<EquipmentPurchase, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'approvedBy' | 'approvalDate' | 'rejectionReason'>) => Promise<void>;
}

const AddEquipmentPurchase: React.FC<AddEquipmentPurchaseProps> = ({ onBack, onSubmit }) => {
  const { showError, showInfo } = useToast();
  
  const [formData, setFormData] = useState({
    description: '',
    brand: '',
    model: '',
    specifications: '',
    location: '',
    expectedMonthYear: '',
    supplier: '',
    observations: '',
    urgency: 'média' as PurchaseUrgency,
    requestedBy: 'Administrador',
    requestDate: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.brand.trim()) {
      newErrors.brand = 'Marca é obrigatória';
    }
    
    if (!formData.model.trim()) {
      newErrors.model = 'Modelo é obrigatório';
    }
    
    if (!formData.specifications.trim()) {
      newErrors.specifications = 'Especificações técnicas são obrigatórias';
    } else if (formData.specifications.trim().length < 10) {
      newErrors.specifications = 'Especificações devem ter pelo menos 10 caracteres';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Localização é obrigatória';
    }
    
    if (!formData.expectedMonthYear) {
      newErrors.expectedMonthYear = 'Mês/ano esperado é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validação em tempo real
  const validateField = (name: string, value: any) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'brand':
        if (!value.trim()) {
          newErrors.brand = 'Marca é obrigatória';
        } else {
          delete newErrors.brand;
        }
        break;
        
      case 'model':
        if (!value.trim()) {
          newErrors.model = 'Modelo é obrigatório';
        } else {
          delete newErrors.model;
        }
        break;
        
      case 'specifications':
        if (!value.trim()) {
          newErrors.specifications = 'Especificações técnicas são obrigatórias';
        } else if (value.trim().length < 10) {
          newErrors.specifications = 'Especificações devem ter pelo menos 10 caracteres';
        } else {
          delete newErrors.specifications;
        }
        break;
        
      case 'location':
        if (!value.trim()) {
          newErrors.location = 'Localização é obrigatória';
        } else {
          delete newErrors.location;
        }
        break;
        
      case 'expectedMonthYear':
        if (!value) {
          newErrors.expectedMonthYear = 'Mês/ano esperado é obrigatório';
        } else {
          delete newErrors.expectedMonthYear;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  // Lidar com mudanças nos campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    const parsedValue = type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
    
    // Marcar campo como tocado
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validar campo em tempo real se já foi tocado
    if (touched[name]) {
      validateField(name, parsedValue);
    }
  };

  // Lidar com blur para validação
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, parsedValue);
  };

  // Formatar valor monetário
  const handleValueChange = (field: 'estimatedUnitValue') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    const numericValue = parseInt(rawValue, 10) / 100 || 0;
    
    setFormData(prev => ({
      ...prev,
      [field]: numericValue
    }));
    
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (touched[field]) {
      validateField(field, numericValue);
    }
  };

  // Formatar moeda para exibição
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Submeter formulário
  const handleSubmit = async () => {
    // Marcar todos os campos como tocados
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    if (!validateForm()) {
      showError('Por favor, corrija os erros no formulário');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Preparar dados para envio
      const submitData = {
        description: `${formData.brand} ${formData.model}`,
        brand: formData.brand,
        model: formData.model,
        specifications: formData.specifications,
        location: formData.location,
        urgency: formData.urgency,
        requestedBy: formData.requestedBy,
        requestDate: formData.requestDate,
        expectedDate: formData.expectedMonthYear ? `${formData.expectedMonthYear}-01` : undefined,
        supplier: formData.supplier || undefined,
        observations: formData.observations || undefined
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      showError('Erro ao criar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancelar e voltar
  const handleCancel = () => {
    const hasChanges = Object.values(formData).some(value => {
      if (typeof value === 'string') {
        return value !== '' && value !== 'média' && value !== 'Administrador' && value !== new Date().toISOString().split('T')[0];
      }
      return false;
    });
    
    if (hasChanges) {
      if (window.confirm('Existem alterações não salvas. Deseja realmente sair?\n\nTodos os dados serão perdidos.')) {
        onBack();
      }
    } else {
      onBack();
    }
  };

  // Verificar se tem erros
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleCancel}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors group mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
          Voltar
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">Nova Solicitação de Compra</h1>
        <p className="mt-2 text-sm text-gray-600">
          Preencha os dados para solicitar a compra de novos equipamentos
        </p>
      </div>

      {/* Alerta de erros */}
      {hasErrors && Object.keys(touched).length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Existem erros no formulário
              </p>
              <p className="text-sm text-red-700 mt-1">
                Por favor, corrija os campos destacados antes de continuar.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Formulário */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda - Informações do Equipamento */}
        <div className="space-y-6">
          {/* Card de Informações Básicas */}
          <Card>
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <Package className="h-5 w-5 text-primary-dark" />
                Informações do Equipamento
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
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-colors ${
                    errors.brand && touched.brand ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Dell, HP, Lenovo"
                />
                {errors.brand && touched.brand && (
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
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-colors ${
                    errors.model && touched.model ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Latitude 5420, EliteBook 840"
                />
                {errors.model && touched.model && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.model}
                  </p>
                )}
              </div>

              {/* Especificações Técnicas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especificações Técnicas *
                </label>
                <textarea
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-colors resize-none ${
                    errors.specifications && touched.specifications ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Intel Core i5-1135G7, 8GB RAM, SSD 256GB, Tela 14 Full HD"
                />
                {errors.specifications && touched.specifications && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.specifications}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Card de Localização e Prazo */}
          <Card>
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <MapPin className="h-5 w-5 text-accent-dark" />
                Localização e Prazo
              </div>

              {/* Localização */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localização *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-colors ${
                    errors.location && touched.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Sala de TI, Recepção, Diretoria"
                />
                {errors.location && touched.location && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.location}
                  </p>
                )}
              </div>

              {/* Mês/Ano Esperado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mês e Ano Esperado de Aquisição *
                </label>
                <input
                  type="month"
                  name="expectedMonthYear"
                  value={formData.expectedMonthYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-colors ${
                    errors.expectedMonthYear && touched.expectedMonthYear ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.expectedMonthYear && touched.expectedMonthYear && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.expectedMonthYear}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Coluna Direita - Fornecedor e Urgência */}
        <div className="space-y-6">
          {/* Card de Fornecedor e Observações */}
          <Card>
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <Briefcase className="h-5 w-5 text-secondary" />
                Fornecedor e Observações
              </div>

              {/* Fornecedor Sugerido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fornecedor Sugerido
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-colors"
                  placeholder="Nome do fornecedor (opcional)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Informe se houver preferência ou cotação prévia
                </p>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  name="observations"
                  value={formData.observations}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-colors resize-none"
                  placeholder="Informações adicionais relevantes para a análise..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Qualquer informação adicional que julgar importante
                </p>
              </div>
            </div>
          </Card>

          {/* Card de Urgência */}
          <Card>
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                Nível de Urgência
              </div>

              {/* Urgência */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selecione o Nível de Urgência *
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-colors"
                >
                  <option value="baixa">Baixa - Pode aguardar</option>
                  <option value="média">Média - Prazo regular</option>
                  <option value="alta">Alta - Necessário em breve</option>
                  <option value="crítica">Crítica - Urgente</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
        <Button
          variant="outline"
          onClick={handleCancel}
          className="flex-1 sm:flex-initial"
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || (hasErrors && Object.keys(touched).length > 0)}
          isLoading={isSubmitting}
          loadingText="Criando solicitação..."
          icon={<Save size={16} />}
          className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white"
        >
          Criar Solicitação
        </Button>
      </div>
    </div>
  );
};

export default AddEquipmentPurchase;