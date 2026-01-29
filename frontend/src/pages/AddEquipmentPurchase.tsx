import React, { useState } from 'react';
import { EquipmentPurchase, PurchaseUrgency } from '../types/purchaseTypes';
import ConfirmationModal from '../components/common/ConfirmationModal';
import {
  Save,
  AlertCircle,
  MapPin,
  Briefcase,
  Package,
  AlertTriangle,
  Cpu,
  Calendar,
  Info,
  CheckCircle
} from 'lucide-react';
import { useToast } from '../components/common/Toast';

interface AddEquipmentPurchaseProps {
  onBack: () => void;
  onSubmit: (data: Omit<EquipmentPurchase, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'approvedBy' | 'approvalDate' | 'rejectionReason'>) => Promise<void>;
}

const AddEquipmentPurchase: React.FC<AddEquipmentPurchaseProps> = ({ onBack, onSubmit }) => {
  const { showError } = useToast();
  const [showCancelModal, setShowCancelModal] = useState(false);

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

  const validateField = (name: string, value: string) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    const parsedValue = type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value;

    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));

    setTouched(prev => ({ ...prev, [name]: true }));

    if (touched[name]) {
      validateField(name, parsedValue as string);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value;

    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, parsedValue as string);
  };

  const handleSubmit = async () => {
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
      showError('Erro ao criar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = Object.values(formData).some(value => {
      if (typeof value === 'string') {
        return value !== '' && value !== 'média' && value !== 'Administrador' && value !== new Date().toISOString().split('T')[0];
      }
      return false;
    });

    if (hasChanges) {
      setShowCancelModal(true);
    } else {
      onBack();
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    onBack();
  };

  const hasErrors = Object.keys(errors).length > 0;
  const isFormValid = formData.brand && formData.model && formData.specifications && formData.location && formData.expectedMonthYear && !hasErrors;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Nova Solicitação de Compra</h1>
        <p className="text-gray-500 mt-1 text-sm">Preencha os dados para solicitar a compra de novos equipamentos</p>
      </div>

      {/* Form Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda */}
        <div className="space-y-6">
          {/* Informações do Equipamento */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Informações do Equipamento</h3>
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
                    onBlur={handleBlur}
                    placeholder="Ex: Dell, HP, Lenovo"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all duration-200 ${errors.brand && touched.brand
                      ? 'border-red-300 bg-red-50 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                      }`}
                  />
                  {errors.brand && touched.brand && (
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
                    onBlur={handleBlur}
                    placeholder="Ex: Latitude 5420"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all duration-200 ${errors.model && touched.model
                      ? 'border-red-300 bg-red-50 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                      }`}
                  />
                  {errors.model && touched.model && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.model}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                  Especificações Técnicas *
                </label>
                <textarea
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={4}
                  placeholder="Ex: Intel Core i5-1135G7, 8GB RAM, SSD 256GB, Tela 14 Full HD"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm resize-none transition-all duration-200 ${errors.specifications && touched.specifications
                    ? 'border-red-300 bg-red-50 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    }`}
                />
                {errors.specifications && touched.specifications && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.specifications}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Localização e Prazo */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <div className="p-2 bg-accent/10 rounded-lg">
                <MapPin className="h-4 w-4 text-accent" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Localização e Prazo</h3>
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
                  onBlur={handleBlur}
                  placeholder="Ex: Sala de TI, Recepção, Diretoria"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all duration-200 ${errors.location && touched.location
                    ? 'border-red-300 bg-red-50 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    }`}
                />
                {errors.location && touched.location && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.location}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                  Mês e Ano Esperado *
                </label>
                <input
                  type="month"
                  name="expectedMonthYear"
                  value={formData.expectedMonthYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all duration-200 ${errors.expectedMonthYear && touched.expectedMonthYear
                    ? 'border-red-300 bg-red-50 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    }`}
                />
                {errors.expectedMonthYear && touched.expectedMonthYear && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.expectedMonthYear}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita */}
        <div className="space-y-6">
          {/* Fornecedor e Observações */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Briefcase className="h-4 w-4 text-secondary" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Fornecedor</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                  Fornecedor Sugerido
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  placeholder="Nome do fornecedor (opcional)"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Informe se houver preferência ou cotação prévia
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                  Observações
                </label>
                <textarea
                  name="observations"
                  value={formData.observations}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Informações adicionais relevantes para a análise..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Nível de Urgência */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Nível de Urgência</h3>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                Selecione o Nível *
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              >
                <option value="baixa">Baixa - Pode aguardar</option>
                <option value="média">Média - Prazo regular</option>
                <option value="alta">Alta - Necessário em breve</option>
                <option value="crítica">Crítica - Urgente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mensagens de Status - Largura Total */}
        <div className="lg:col-span-2 space-y-3">
          {/* Success Preview */}
          {isFormValid && (
            <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <span className="font-medium">Pronto para enviar!</span>
                <span className="ml-2 text-gray-500">
                  Todos os campos obrigatórios foram preenchidos.
                </span>
              </div>
            </div>
          )}

          {/* Form Instructions */}
          <div className="flex items-start gap-3 p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
            <Info className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-700 mb-1">Instruções:</p>
              <ul className="text-xs space-y-0.5 list-disc list-inside text-gray-500">
                <li>Campos marcados com asterisco (*) são obrigatórios</li>
                <li>A solicitação será analisada pela equipe responsável</li>
                <li>Você pode acompanhar o status na lista de solicitações</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          onClick={handleCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (hasErrors && Object.keys(touched).length > 0)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-secondary text-white font-medium text-sm rounded-lg hover:bg-secondary-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Criando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Criar Solicitação
            </>
          )}
        </button>
      </div>

      {/* Modal de Confirmação de Cancelamento */}
      <ConfirmationModal
        isOpen={showCancelModal}
        title="Descartar alterações?"
        message="Existem alterações não salvas. Deseja realmente sair?"
        description="Todos os dados serão perdidos."
        confirmLabel="Sair"
        cancelLabel="Continuar editando"
        variant="warning"
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
};

export default AddEquipmentPurchase;
