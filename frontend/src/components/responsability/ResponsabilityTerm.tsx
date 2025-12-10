import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  X,
  Calendar,
  User,
  Mail,
  Phone,
  Building2,
  CreditCard,
  PenTool,
  Trash2,
  Check,
  Download,
  Eye,
  FileSignature,
  Loader2,
  Printer
} from 'lucide-react';
import { downloadResponsibilityPDF } from '../../services/pdfGenerator';
import { useToastContext } from '../../contexts/ToastContext';

// Tipos
interface Equipment {
  id: string;
  assetNumber: string;
  description: string;
  brand: string;
  model: string;
  specs?: string;
  status: 'ativo' | 'manutenção' | 'desativado';
  location: string;
  responsible: string;
  acquisitionDate: string;
  value: number;
}

interface ResponsibilityTerm {
  id: string;
  equipmentId: string;
  responsiblePerson: string;
  responsibleEmail: string;
  responsiblePhone: string;
  responsibleDepartment: string;
  termDate: string;
  status: 'signed';
  observations?: string;
  manualSignature?: string;
  pdfUrl?: string;
}

// Componente de Assinatura
const SignaturePad: React.FC<{
  onSignatureChange: (signature: string | null) => void;
  initialSignature?: string;
}> = ({ onSignatureChange, initialSignature }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!initialSignature);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Configurar canvas com alta resolução
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(2, 2);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          setHasSignature(true);
        }
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const signature = canvas.toDataURL('image/png');
      onSignatureChange(signature);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    setHasSignature(false);
    onSignatureChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-semibold text-gray-700">
          <FileSignature className="inline w-4 h-4 mr-1.5" />
          Assinatura do Responsável (opcional)
        </label>
        {hasSignature && (
          <button
            type="button"
            onClick={clearSignature}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1.5 hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Limpar
          </button>
        )}
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full border-2 border-gray-300 rounded-lg bg-white cursor-crosshair touch-none shadow-sm hover:border-blue-400 transition-colors"
          style={{ height: '180px' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={(e) => {
            e.preventDefault();
            startDrawing(e);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            draw(e);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopDrawing();
          }}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <PenTool className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 font-medium">Assine aqui</p>
              <p className="text-xs text-gray-400 mt-1">Use o mouse ou toque na tela</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente Principal
const ResponsibilityTerm: React.FC<{
  equipment: Equipment;
  onClose: () => void;
  onTermCreated?: (term: ResponsibilityTerm) => void;
}> = ({ equipment, onClose, onTermCreated }) => {
  const { showSuccess, showError, showWarning } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [loadingTerms, setLoadingTerms] = useState(true);
  const [existingTerms, setExistingTerms] = useState<ResponsibilityTerm[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [manualSignature, setManualSignature] = useState<string | null>(null);
  
  // Formulário
  const [formData, setFormData] = useState({
    responsiblePerson: equipment.responsible || '',
    responsibleEmail: '',
    responsiblePhone: '',
    responsibleDepartment: '',
    observations: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar termos existentes
  useEffect(() => {
    loadExistingTerms();
  }, [equipment.id]);

  const loadExistingTerms = async () => {
    setLoadingTerms(true);
    try {
      const { api } = await import('../../services/api');
      const terms = await api.responsibilityTerms.list(equipment.id);
      setExistingTerms(terms);
    } catch (error) {
      // Erro silencioso na carga inicial
    } finally {
      setLoadingTerms(false);
    }
  };


  // Validação do formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.responsiblePerson.trim()) {
      newErrors.responsiblePerson = 'Nome é obrigatório';
    }

    if (!formData.responsibleEmail.trim()) {
      newErrors.responsibleEmail = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.responsibleEmail)) {
      newErrors.responsibleEmail = 'E-mail inválido';
    }

    if (!formData.responsiblePhone.trim()) {
      newErrors.responsiblePhone = 'Telefone é obrigatório';
    }

    if (!formData.responsibleDepartment.trim()) {
      newErrors.responsibleDepartment = 'Departamento é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Criar termo
  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { api } = await import('../../services/api');
      
      const termDataWithSignature = {
        ...formData,
        manualSignature
      };
      
      const newTerm = await api.responsibilityTerms.create(equipment, termDataWithSignature);
      
      // Atualizar lista
      setExistingTerms([newTerm, ...existingTerms]);
      setActiveTab('list');
      
      // Limpar formulário
      setFormData({
        responsiblePerson: '',
        responsibleEmail: '',
        responsiblePhone: '',
        responsibleDepartment: '',
        observations: ''
      });
      setManualSignature(null);
      
      if (onTermCreated) {
        onTermCreated(newTerm);
      }

      // Notificação de sucesso via Toast
      showSuccess('Termo criado e salvo nos anexos!');
      
    } catch (error) {
      showError('Erro ao processar termo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Formatação de telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <FileSignature className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Termo de Responsabilidade
                </h2>
                <p className="text-sm text-blue-100">
                  Equipamento: {equipment.assetNumber} - {equipment.description}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b bg-gray-50">
          <div className="flex">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
                activeTab === 'create'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <PenTool className="w-4 h-4" />
                Novo Termo
              </div>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-all relative ${
                activeTab === 'list'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Termos Assinados
                {existingTerms.length > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {existingTerms.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {activeTab === 'create' ? (
            <form className="p-6 space-y-6" onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
              {/* Info do equipamento */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Informações do Equipamento
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Patrimônio:</span>
                    <p className="font-semibold text-gray-900">{equipment.assetNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Localização:</span>
                    <p className="font-semibold text-gray-900">{equipment.location}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Marca/Modelo:</span>
                    <p className="font-semibold text-gray-900">{equipment.brand} {equipment.model}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Valor:</span>
                    <p className="font-semibold text-gray-900">R$ {equipment.value.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Dados do responsável */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Dados do Responsável
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.responsiblePerson}
                      onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.responsiblePerson ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="João da Silva"
                    />
                    {errors.responsiblePerson && (
                      <p className="mt-1 text-xs text-red-600">{errors.responsiblePerson}</p>
                    )}
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      value={formData.responsibleEmail}
                      onChange={(e) => setFormData({ ...formData, responsibleEmail: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.responsibleEmail ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="joao@empresa.com"
                    />
                    {errors.responsibleEmail && (
                      <p className="mt-1 text-xs text-red-600">{errors.responsibleEmail}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      value={formData.responsiblePhone}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        responsiblePhone: formatPhone(e.target.value) 
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.responsiblePhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                    {errors.responsiblePhone && (
                      <p className="mt-1 text-xs text-red-600">{errors.responsiblePhone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Departamento *
                    </label>
                    <input
                      type="text"
                      value={formData.responsibleDepartment}
                      onChange={(e) => setFormData({ ...formData, responsibleDepartment: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.responsibleDepartment ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Tecnologia da Informação"
                    />
                    {errors.responsibleDepartment && (
                      <p className="mt-1 text-xs text-red-600">{errors.responsibleDepartment}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Campo de assinatura */}
              <div>
                <SignaturePad 
                  onSignatureChange={setManualSignature}
                  initialSignature={manualSignature || undefined}
                />
                {errors.signature && (
                  <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                    {errors.signature}
                  </p>
                )}
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Observações (opcional)
                </label>
                <textarea
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  rows={3}
                  placeholder="Informações adicionais sobre o termo..."
                />
              </div>

              {/* Botão para gerar PDF de teste */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  Gerar PDF de Teste
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  Visualize como o termo ficará antes de salvar
                </p>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      downloadResponsibilityPDF(equipment, {
                        responsiblePerson: formData.responsiblePerson || 'Nome do Responsável',
                        responsibleEmail: formData.responsibleEmail || 'email@exemplo.com',
                        responsiblePhone: formData.responsiblePhone || '(00) 00000-0000',
                        responsibleDepartment: formData.responsibleDepartment || 'Departamento',
                        observations: formData.observations,
                        manualSignature: manualSignature
                      });
                    } catch (error) {
                      showError('Erro ao gerar PDF. Verifique se todos os campos obrigatórios estão preenchidos.');
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-md text-sm font-medium text-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Baixar PDF de Teste
                </button>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Criar e Salvar Termo
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6">
              {loadingTerms ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : existingTerms.length > 0 ? (
                <div className="space-y-4">
                  {existingTerms.map((term) => (
                    <div
                      key={term.id}
                      className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all bg-white"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {term.responsiblePerson}
                            </h4>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <Check className="w-3.5 h-3.5" />
                              Assinado
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              {term.responsibleDepartment}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-4 h-4 text-gray-400" />
                              {term.responsibleEmail}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {new Date(term.termDate).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          {term.manualSignature && (
                            <div className="mt-4">
                              <p className="text-xs text-gray-500 mb-2">Assinatura:</p>
                              <img 
                                src={term.manualSignature} 
                                alt="Assinatura" 
                                className="h-20 border border-gray-200 rounded-lg bg-white p-2"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          {/* Botão para gerar novo PDF */}
                          <button
                            onClick={() => {
                              try {
                                downloadResponsibilityPDF(equipment, {
                                  responsiblePerson: term.responsiblePerson,
                                  responsibleEmail: term.responsibleEmail,
                                  responsiblePhone: term.responsiblePhone,
                                  responsibleDepartment: term.responsibleDepartment,
                                  observations: term.observations,
                                  manualSignature: term.manualSignature
                                });
                              } catch (error) {
                                showError('Erro ao gerar PDF');
                              }
                            }}
                            className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 whitespace-nowrap"
                            title="Baixar PDF do Termo"
                          >
                            <Download className="w-4 h-4" />
                            Baixar PDF
                          </button>
                          
                          {/* Botões originais se houver pdfUrl */}
                          {term.pdfUrl && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  // Abrir PDF em nova aba
                                  const pdfWindow = window.open(term.pdfUrl, '_blank');
                                  if (!pdfWindow) {
                                    showWarning('Por favor, permita pop-ups para visualizar o PDF');
                                  }
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Visualizar PDF Salvo"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <a
                                href={term.pdfUrl}
                                download={`Termo_Responsabilidade_${term.responsiblePerson.replace(/\s+/g, '_')}.pdf`}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors inline-block"
                                title="Baixar PDF Salvo"
                              >
                                <FileText className="w-5 h-5" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      {term.observations && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Observações:</span> {term.observations}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Nenhum termo assinado ainda</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Clique em "Novo Termo" para criar o primeiro
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ResponsibilityTerm;