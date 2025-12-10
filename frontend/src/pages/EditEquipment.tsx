import React, { useState, useEffect } from 'react';
import { Equipment } from '../types';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingOverlay from '../components/common/LoadingOverlay';
import { 
  ArrowLeft, 
  Save,
  Package,
  MapPin,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  Info,
  AlertTriangle,
  Laptop,
  Edit,
  RefreshCw,
  Settings,
  Wrench,
  Receipt
} from 'lucide-react';
import inventoryService from '../services/inventoryService';

interface EditEquipmentProps {
  equipmentId: string;
  onBack: () => void;
  onSubmit: (data: Partial<Equipment>) => void;
}

const EditEquipment: React.FC<EditEquipmentProps> = ({ 
  equipmentId, 
  onBack, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<Equipment | null>(null);
  const [originalData, setOriginalData] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [observacoesManutenção, setObservacoesManutenção] = useState('');

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const data = await inventoryService.getEquipmentById(equipmentId);
        if (!data) {
          throw new Error('Equipamento não encontrado');
        }
        setFormData(data);
        setOriginalData(data);
        
        if (data.status === 'manutenção' && data.observacoesManutenção) {
          setObservacoesManutenção(data.observacoesManutenção);
        }
      } catch (err) {
        console.error('Error loading equipment:', err);
        setError((err as Error).message || 'Erro ao carregar equipamento');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [equipmentId]);

  useEffect(() => {
    if (formData && originalData) {
      const dataWithMaintenance = {
        ...formData,
        observacoesManutenção: formData.status === 'manutenção' ? observacoesManutenção : undefined
      };
      
      const originalWithMaintenance = {
        ...originalData,
        observacoesManutenção: originalData?.observacoesManutenção || ''
      };
      
      const changed = JSON.stringify(dataWithMaintenance) !== JSON.stringify(originalWithMaintenance);
      setHasChanges(changed);
    }
  }, [formData, originalData, observacoesManutenção]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    
    const { name, value } = e.target;
    
    let parsedValue: string | number = value;
    if (name === 'value') {
      parsedValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    }
    
    setFormData(prev => ({
      ...prev!,
      [name]: parsedValue
    }));
    
    if (name === 'status' && value !== 'manutenção') {
      setObservacoesManutenção('');
    }
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    const numericValue = parseInt(rawValue, 10) / 100 || 0;
    
    setFormData(prev => ({
      ...prev!,
      value: numericValue
    }));
  };

  const handleObservacoesManutenção = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObservacoesManutenção(e.target.value);
    
    if (errors.observacoesManutenção) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.observacoesManutenção;
        return newErrors;
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const validate = (): boolean => {
    if (!formData) return false;
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.assetNumber.trim()) newErrors.assetNumber = 'Obrigatório';
    if (!formData.description.trim()) newErrors.description = 'Obrigatório';
    if (!formData.brand.trim()) newErrors.brand = 'Obrigatório';
    if (!formData.model.trim()) newErrors.model = 'Obrigatório';
    if (!formData.location.trim()) newErrors.location = 'Obrigatório';
    if (!formData.responsible.trim()) newErrors.responsible = 'Obrigatório';
    if (formData.value <= 0) newErrors.value = 'Valor inválido';
    
    if (formData.status === 'manutenção' && !observacoesManutenção.trim()) {
      newErrors.observacoesManutenção = 'Descreva o que será feito na manutenção';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!formData) return;
    
    if (validate()) {
      const changedData: Partial<Equipment> = {};
      
      Object.keys(formData).forEach(key => {
        const typedKey = key as keyof Equipment;
        if (formData[typedKey] !== originalData?.[typedKey]) {
          changedData[typedKey] = formData[typedKey] as any;
        }
      });
      
      if (formData.status === 'manutenção') {
        changedData.observacoesManutenção = observacoesManutenção;
      }
      
      changedData.id = equipmentId;
      onSubmit(changedData);
    }
  };

  const handleCancel = () => {
    if (!hasChanges || confirm('Tem certeza que deseja cancelar? As alterações não salvas serão perdidas.')) {
      onBack();
    }
  };

  if (loading) {
    return <LoadingOverlay message="Carregando equipamento..." submessage="Por favor, aguarde" />;
  }

  if (error || !formData) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Botão Voltar */}
        <div className="mb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
            Voltar
          </button>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Equipamento</h1>
          <p className="text-gray-600 mt-2">Erro ao carregar equipamento</p>
        </div>

        <Card 
          status="error"
          icon={<AlertTriangle className="h-8 w-8 text-red-600" />}
          className="text-center py-12"
        >
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">
              {error || 'Equipamento não encontrado'}
            </h3>
            <p className="text-gray-500">
              Não foi possível carregar os detalhes deste equipamento.
            </p>
            <Button
              variant="primary"
              onClick={onBack}
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Voltar para a lista
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Botão Voltar */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
          Voltar para detalhes
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Equipamento</h1>
          <p className="text-gray-600 mt-2">Atualize as informações do equipamento</p>
        </div>

        <div className="flex items-center gap-2 text-gray-800 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
          <Edit className="h-4 w-4" />
          <span className="text-sm font-medium">
            {formData.assetNumber}
          </span>
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        {/* Identificação */}
        <Card 
          title="Identificação" 
          subtitle="Informações básicas do equipamento"
          icon={<Package className="h-5 w-5 text-primary-dark" />}
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all ${
                  errors.assetNumber ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.assetNumber && (
                <div className="mt-2 flex items-center text-xs text-red-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all hover:border-gray-400"
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all resize-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.description && (
                <div className="mt-2 flex items-center text-xs text-red-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.description}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Status de Manutenção */}
        {formData.status === 'manutenção' && (
          <Card 
            status="warning"
            icon={<Wrench className="h-5 w-5 text-orange-600" />}
            className="border-orange-200 bg-orange-50"
          >
            <div>
              <label className="block text-sm font-medium text-orange-800 mb-2">
                Observações sobre a Manutenção *
              </label>
              <textarea
                value={observacoesManutenção}
                onChange={handleObservacoesManutenção}
                rows={4}
                placeholder="Descreva o que será feito na manutenção, problemas identificados, peças necessárias, etc."
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none ${
                  errors.observacoesManutenção ? 'border-red-300 bg-red-50' : 'border-orange-300 hover:border-orange-400 bg-white'
                }`}
              />
              {errors.observacoesManutenção && (
                <div className="mt-2 flex items-center text-xs text-red-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.observacoesManutenção}
                </div>
              )}
              <p className="mt-2 text-xs text-orange-700">
                Estas informações serão registradas no histórico do equipamento
              </p>
            </div>
          </Card>
        )}

        {/* Informações Técnicas */}
        <Card 
          title="Informações Técnicas" 
          subtitle="Detalhes técnicos do equipamento"
          icon={<Settings className="h-5 w-5 text-secondary" />}
          variant="elevated"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca *
              </label>
              <div className="relative">
                <Laptop className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all ${
                    errors.brand ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
              </div>
              {errors.brand && (
                <div className="mt-2 flex items-center text-xs text-red-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all ${
                  errors.model ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.model && (
                <div className="mt-2 flex items-center text-xs text-red-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.model}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especificações Técnicas
              </label>
              <textarea
                name="specs"
                value={formData.specs || ''}
                onChange={handleChange}
                rows={4}
                placeholder="Processador, memória, armazenamento, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all resize-none hover:border-gray-400"
              />
            </div>
          </div>
        </Card>

        {/* Localização e Responsável */}
        <Card 
          title="Localização e Responsável" 
          subtitle="Onde está e quem cuida do equipamento"
          icon={<MapPin className="h-5 w-5 text-accent" />}
          variant="elevated"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localização *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all ${
                    errors.location ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
              </div>
              {errors.location && (
                <div className="mt-2 flex items-center text-xs text-red-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.location}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsável *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="responsible"
                  value={formData.responsible}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all ${
                    errors.responsible ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
              </div>
              {errors.responsible && (
                <div className="mt-2 flex items-center text-xs text-red-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.responsible}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Datas e Valores */}
        <Card 
          title="Datas e Valores" 
          subtitle="Informações financeiras e temporais"
          icon={<DollarSign className="h-5 w-5 text-gray-400" />}
          variant="elevated"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Aquisição *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  name="acquisitionDate"
                  value={formData.acquisitionDate}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all ${
                    errors.acquisitionDate ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
              </div>
              {errors.acquisitionDate && (
                <div className="mt-2 flex items-center text-xs text-red-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.acquisitionDate}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data da Nota Fiscal
              </label>
              <div className="relative">
                <Receipt className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate || ''}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all border-gray-300 hover:border-gray-400"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Data de emissão da nota fiscal (opcional)
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor do Equipamento (R$) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="value"
                  value={formatCurrency(formData.value)}
                  onChange={handleValueChange}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all ${
                    errors.value ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
              </div>
              {errors.value && (
                <div className="mt-2 flex items-center text-xs text-red-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.value}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Success Preview */}
        {hasChanges && Object.keys(errors).length === 0 && (
          <Card 
            status="success"
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
            className="border-green-200 bg-green-50"
          >
            <div className="text-sm text-green-800">
              <p className="font-semibold">Alterações detectadas</p>
              <p className="mt-1">Clique em "Salvar Alterações" para aplicar as mudanças.</p>
            </div>
          </Card>
        )}

        {/* Form Instructions */}
        <Card 
          status="info"
          icon={<Info className="h-5 w-5 text-gray-800" />}
          className="border-blue-200 bg-blue-50"
        >
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-2">Instruções de Edição</p>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li>Altere apenas os campos necessários</li>
              <li>Para equipamentos de obra, mantenha a localização atualizada</li>
              <li>Ao selecionar "Em Manutenção", descreva detalhadamente o que será feito</li>
              <li>As alterações serão registradas no histórico do equipamento</li>
              <li>Todos os campos marcados com (*) são obrigatórios</li>
              <li>O sistema detecta automaticamente as mudanças realizadas</li>
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
            disabled={!hasChanges || Object.keys(errors).length > 0}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditEquipment;