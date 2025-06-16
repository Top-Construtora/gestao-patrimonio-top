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
  DollarSign,
  Info,
  Package,
  FileText,
  AlertTriangle,
  Briefcase,
  Calculator,
  Hash,
  User
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
    category: '',
    estimatedQuantity: 1,
    estimatedUnitValue: 0,
    estimatedTotalValue: 0,
    urgency: 'média' as PurchaseUrgency,
    requestedBy: 'Administrador',
    requestDate: new Date().toISOString().split('T')[0],
    expectedDate: '',
    supplier: '',
    observations: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Categorias predefinidas
  const categories = [
    'Computadores',
    'Notebooks',
    'Monitores',
    'Impressoras',
    'Periféricos',
    'Rede e Conectividade',
    'Servidores',
    'Armazenamento',
    'Software',
    'Licenças',
    'Acessórios',
    'Mobiliário de TI',
    'Outros'
  ];

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    } else if (formData.description.trim().length < 5) {
      newErrors.description = 'Descrição deve ter pelo menos 5 caracteres';
    }
    
    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }
    
    if (formData.estimatedUnitValue <= 0) {
      newErrors.estimatedUnitValue = 'Valor deve ser maior que zero';
    }
    
    if (formData.expectedDate) {
      const today = new Date().toISOString().split('T')[0];
      if (formData.expectedDate < today) {
        newErrors.expectedDate = 'Data esperada não pode ser no passado';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validação em tempo real
  const validateField = (name: string, value: any) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'description':
        if (!value.trim()) {
          newErrors.description = 'Descrição é obrigatória';
        } else if (value.trim().length < 5) {
          newErrors.description = 'Descrição deve ter pelo menos 5 caracteres';
        } else {
          delete newErrors.description;
        }
        break;
        
      case 'justification':
        if (!value.trim()) {
          newErrors.justification = 'Justificativa é obrigatória';
        } else if (value.trim().length < 20) {
          newErrors.justification = 'Justificativa deve ter pelo menos 20 caracteres';
        } else {
          delete newErrors.justification;
        }
        break;
        
      case 'category':
        if (!value) {
          newErrors.category = 'Categoria é obrigatória';
        } else {
          delete newErrors.category;
        }
        break;
        
      case 'estimatedQuantity':
        if (value <= 0) {
          newErrors.estimatedQuantity = 'Quantidade deve ser maior que zero';
        } else {
          delete newErrors.estimatedQuantity;
        }
        break;
        
      case 'estimatedUnitValue':
        if (value <= 0) {
          newErrors.estimatedUnitValue = 'Valor deve ser maior que zero';
        } else {
          delete newErrors.estimatedUnitValue;
        }
        break;
        
      case 'expectedDate':
        if (value) {
          const today = new Date().toISOString().split('T')[0];
          if (value < today) {
            newErrors.expectedDate = 'Data esperada não pode ser no passado';
          } else {
            delete newErrors.expectedDate;
          }
        } else {
          delete newErrors.expectedDate;
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
      await onSubmit(formData);
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
      if (typeof value === 'number') {
        return value !== 0 && value !== 1;
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
        {/* Coluna Esquerda - Informações Básicas */}
        <Card>
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <Package className="h-5 w-5 text-blue-600" />
              Informações do Equipamento
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição do Equipamento *
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.description && touched.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Notebook Dell Latitude 5420"
              />
              {errors.description && touched.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.category && touched.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && touched.category && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Urgência */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nível de Urgência *
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="baixa">Baixa - Pode aguardar</option>
                <option value="média">Média - Prazo regular</option>
                <option value="alta">Alta - Necessário em breve</option>
                <option value="crítica">Crítica - Urgente</option>
              </select>
              {formData.urgency === 'crítica' && (
                <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800 flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" />
                    Solicitações críticas requerem justificativa detalhada e são analisadas com prioridade máxima.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Coluna Direita - Valores e Datas */}
        <div className="space-y-6">
          {/* Card de Valores */}
          <Card>
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <Calculator className="h-5 w-5 text-green-600" />
                Informações Financeiras
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Estimado *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formatCurrency(formData.estimatedUnitValue)}
                    onChange={handleValueChange('estimatedUnitValue')}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, estimatedUnitValue: true }));
                      validateField('estimatedUnitValue', formData.estimatedUnitValue);
                    }}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.estimatedUnitValue && touched.estimatedUnitValue ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="R$ 0,00"
                  />
                </div>
                {errors.estimatedUnitValue && touched.estimatedUnitValue && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.estimatedUnitValue}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Card de Informações Adicionais */}
          <Card>
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <FileText className="h-5 w-5 text-purple-600" />
                Informações Adicionais
              </div>

              {/* Data Esperada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Esperada de Aquisição
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="expectedDate"
                    value={formData.expectedDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.expectedDate && touched.expectedDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.expectedDate && touched.expectedDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.expectedDate}
                  </p>
                )}
              </div>

              {/* Fornecedor Sugerido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fornecedor Sugerido
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Nome do fornecedor (opcional)"
                  />
                </div>
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
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Informações adicionais relevantes para a análise..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Inclua especificações técnicas, referências ou qualquer outra informação importante
                </p>
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
          className="flex-1 sm:flex-initial bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
        >
          Criar Solicitação
        </Button>
      </div>
    </div>
  );
};

export default AddEquipmentPurchase;    