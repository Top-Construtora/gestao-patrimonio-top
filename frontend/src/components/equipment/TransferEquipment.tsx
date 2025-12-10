// src/components/equipment/TransferEquipmentModal.tsx
import React, { useState, useEffect } from 'react';
import { Equipment } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import { 
  X, 
  MapPin, 
  Calendar, 
  User,
  ArrowRight,
  Building2,
  AlertCircle,
  CheckCircle,
  Package,
  Clock,
  History,
  Info,
  MessageSquare
} from 'lucide-react';
import { useToast } from '../common/Toast';

interface TransferEquipmentModalProps {
  isOpen: boolean;
  equipment: Equipment | null;
  onClose: () => void;
  onSuccess: (equipmentId: string, newLocation: string, transferDate: string, responsiblePerson?: string, observations?: string) => Promise<void>;
}

interface TransferFormData {
  newLocation: string;
  transferDate: string;
  responsiblePerson: string;
  observations: string;
}

// Lista de localizações comuns para sugestão
const COMMON_LOCATIONS = [
  'Almoxarifado',
  'Recepção',
  'Sala de TI',
  'Administração',
  'Financeiro',
  'RH',
  'Sala de Reunião',
  'Diretoria',
  'Comercial',
  'Operacional'
];

const TransferEquipmentModal: React.FC<TransferEquipmentModalProps> = ({
  isOpen,
  equipment,
  onClose,
  onSuccess
}) => {
  const { showError, showSuccess, showWarning } = useToast();
  
  const [formData, setFormData] = useState<TransferFormData>({
    newLocation: '',
    transferDate: new Date().toISOString().split('T')[0],
    responsiblePerson: '',
    observations: ''
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof TransferFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        newLocation: '',
        transferDate: new Date().toISOString().split('T')[0],
        responsiblePerson: '',
        observations: ''
      });
      setErrors({});
      setShowPreview(false);
      setShowLocationSuggestions(false);
    }
  }, [isOpen]);

  // Filtrar sugestões de localização
  useEffect(() => {
    if (formData.newLocation.trim()) {
      const filtered = COMMON_LOCATIONS.filter(loc =>
        loc.toLowerCase().includes(formData.newLocation.toLowerCase()) &&
        loc.toLowerCase() !== equipment?.location.toLowerCase()
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations([]);
    }
  }, [formData.newLocation, equipment?.location]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TransferFormData, string>> = {};
    
    if (!formData.newLocation.trim()) {
      newErrors.newLocation = 'Nova localização é obrigatória';
    } else if (formData.newLocation.trim().length < 3) {
      newErrors.newLocation = 'Localização deve ter pelo menos 3 caracteres';
    } else if (equipment && formData.newLocation.trim().toLowerCase() === equipment.location.toLowerCase()) {
      newErrors.newLocation = 'Nova localização deve ser diferente da atual';
    }
    
    if (!formData.transferDate) {
      newErrors.transferDate = 'Data da transferência é obrigatória';
    } else {
      const transferDate = new Date(formData.transferDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (transferDate > today) {
        newErrors.transferDate = 'Data não pode ser futura';
      }
      
      if (equipment?.acquisitionDate) {
        const acquisitionDate = new Date(equipment.acquisitionDate);
        if (transferDate < acquisitionDate) {
          newErrors.transferDate = 'Data não pode ser anterior à aquisição';
        }
      }
    }
    
    if (!formData.responsiblePerson.trim()) {
      newErrors.responsiblePerson = 'Responsável pela transferência é obrigatório';
    } else if (formData.responsiblePerson.trim().length < 3) {
      newErrors.responsiblePerson = 'Nome deve ter pelo menos 3 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof TransferFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Mostrar sugestões para localização
    if (name === 'newLocation') {
      setShowLocationSuggestions(true);
    }
  };

  const handleLocationSelect = (location: string) => {
    setFormData(prev => ({ ...prev, newLocation: location }));
    setShowLocationSuggestions(false);
    setErrors(prev => ({ ...prev, newLocation: undefined }));
  };

  const handlePreview = () => {
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  const handleSubmit = async () => {
    if (!equipment || !validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSuccess(
        equipment.id,
        formData.newLocation.trim(),
        formData.transferDate,
        formData.responsiblePerson.trim(),
        formData.observations.trim()
      );
      
      showSuccess(
        `Equipamento ${equipment.assetNumber} transferido com sucesso!`,
        {
          description: `Nova localização: ${formData.newLocation}`,
          duration: 5000
        }
      );
      
      onClose();
    } catch (error) {
      console.error('Erro ao transferir equipamento:', error);
      showError('Erro ao transferir equipamento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !equipment) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <ArrowRight className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Transferir Equipamento</h2>
              <p className="text-gray-100 text-sm">Registrar movimentação de localização</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {!showPreview ? (
            <div className="space-y-6">
              {/* Equipment Info Card */}
              <Card variant="bordered" className="bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-start gap-4">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <Package className="h-6 w-6 text-gray-800" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{equipment.assetNumber}</h3>
                    <p className="text-gray-600">{equipment.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span>Localização atual: <strong className="text-gray-700">{equipment.location}</strong></span>
                      </div>
                      {equipment.responsible && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <User className="h-4 w-4" />
                          <span>Responsável: <strong className="text-gray-700">{equipment.responsible}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Transfer Form */}
              <div className="space-y-4">
                {/* New Location */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nova Localização *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="newLocation"
                      value={formData.newLocation}
                      onChange={handleChange}
                      onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                      placeholder="Ex: Sala 205, Almoxarifado, Recepção"
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all ${
                        errors.newLocation ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    
                    {/* Sugestões de localização */}
                    {showLocationSuggestions && filteredLocations.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredLocations.map((location, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleLocationSelect(location)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 hover:text-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <span>{location}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.newLocation && (
                    <div className="mt-1 flex items-center text-xs text-red-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.newLocation}
                    </div>
                  )}
                </div>

                {/* Transfer Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data da Transferência *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="transferDate"
                      value={formData.transferDate}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      min={equipment.acquisitionDate?.split('T')[0]}
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all ${
                        errors.transferDate ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                  </div>
                  {errors.transferDate && (
                    <div className="mt-1 flex items-center text-xs text-red-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.transferDate}
                    </div>
                  )}
                </div>

                {/* Responsible Person */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsável pela Transferência *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="responsiblePerson"
                      value={formData.responsiblePerson}
                      onChange={handleChange}
                      placeholder="Nome completo do responsável"
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all ${
                        errors.responsiblePerson ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                  </div>
                  {errors.responsiblePerson && (
                    <div className="mt-1 flex items-center text-xs text-red-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.responsiblePerson}
                    </div>
                  )}
                </div>

                {/* Observations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                    <span className="text-gray-400 font-normal ml-2">(opcional)</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      name="observations"
                      value={formData.observations}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Motivo da transferência, condições do equipamento ou outras informações relevantes"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all resize-none hover:border-gray-400"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.observations.length}/500 caracteres
                  </p>
                </div>
              </div>

              {/* Info Alert */}
              <Card variant="bordered" className="border-gray-200 bg-gray-50">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-gray-800 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-gray-900 font-medium mb-1">Importante</p>
                    <ul className="text-gray-700 space-y-1 list-disc list-inside">
                      <li>A transferência será registrada permanentemente no histórico</li>
                      <li>O equipamento permanecerá com o mesmo responsável</li>
                      <li>Para alterar o responsável, use a função "Editar"</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            /* Preview Screen */
            <div className="space-y-6">
              <Card variant="elevated" className="border-2 border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirmar Transferência</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Equipamento */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2 font-medium">Equipamento</p>
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-900">{equipment.assetNumber}</p>
                        <p className="text-sm text-gray-600">{equipment.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Transferência */}
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-700 mb-3 font-medium flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      Detalhes da Transferência
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">De:</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {equipment.location}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-800 mb-1">Para:</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-800" />
                          {formData.newLocation}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Informações adicionais */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Data da Transferência
                      </span>
                      <span className="font-medium text-gray-900">{formatDate(formData.transferDate)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Responsável
                      </span>
                      <span className="font-medium text-gray-900">{formData.responsiblePerson}</span>
                    </div>
                    
                    {formData.observations && (
                      <div className="pt-2">
                        <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Observações
                        </p>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{formData.observations}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
              
              <Card variant="bordered" className="border-orange-200 bg-orange-50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-orange-900 font-medium mb-1">Confirmação Necessária</p>
                    <p className="text-orange-700">
                      Após confirmar, a localização será atualizada imediatamente e a transferência será registrada no histórico do equipamento.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          {!showPreview ? (
            <>
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handlePreview}
                disabled={isSubmitting || Object.keys(errors).length > 0}
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Continuar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => setShowPreview(false)}
                disabled={isSubmitting}
                icon={<ArrowRight className="h-4 w-4 rotate-180" />}
              >
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  icon={isSubmitting ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                >
                  {isSubmitting ? 'Transferindo...' : 'Confirmar Transferência'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferEquipmentModal;