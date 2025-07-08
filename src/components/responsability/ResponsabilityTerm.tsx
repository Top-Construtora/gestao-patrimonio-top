import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Send, 
  X, 
  Calendar,
  User,
  Mail,
  Phone,
  Building2,
  CreditCard,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileSignature,
  Loader2,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';

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
  responsibleCPF: string;
  responsibleDepartment: string;
  termDate: string;
  status: 'draft' | 'sent' | 'signed' | 'cancelled';
  observations?: string;
  assinafyDocumentId?: string;
  assinafySignerId?: string;
  assinafySignedAt?: string;
  pdfUrl?: string;
  signedPdfUrl?: string;
}

// Mock da biblioteca jsPDF removido - agora usa a API real

// Componente Principal
const ResponsibilityTermAssinafy: React.FC<{
  equipment: Equipment;
  onClose: () => void;
  onTermCreated?: (term: ResponsibilityTerm) => void;
}> = ({ equipment, onClose, onTermCreated }) => {
  const [loading, setLoading] = useState(false);
  const [loadingTerms, setLoadingTerms] = useState(true);
  const [existingTerms, setExistingTerms] = useState<ResponsibilityTerm[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<ResponsibilityTerm | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  
  // Formulário
  const [formData, setFormData] = useState({
    responsiblePerson: equipment.responsible || '',
    responsibleEmail: '',
    responsiblePhone: '',
    responsibleCPF: '',
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
      console.error('Erro ao carregar termos:', error);
    } finally {
      setLoadingTerms(false);
    }
  };

  // Validação de CPF
  const validateCPF = (cpf: string) => {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    
    // Validação básica de CPF
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
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

    if (!formData.responsibleCPF.trim()) {
      newErrors.responsibleCPF = 'CPF é obrigatório';
    } else if (!validateCPF(formData.responsibleCPF)) {
      newErrors.responsibleCPF = 'CPF inválido';
    }

    if (!formData.responsibleDepartment.trim()) {
      newErrors.responsibleDepartment = 'Departamento é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Criar e enviar termo
  const handleCreateAndSend = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { api } = await import('../../services/api');
      
      const newTerm = await api.responsibilityTerms.createAndSend(equipment, formData);
      
      // Atualizar lista
      setExistingTerms([newTerm, ...existingTerms]);
      setActiveTab('list');
      
      // Limpar formulário
      setFormData({
        responsiblePerson: '',
        responsibleEmail: '',
        responsiblePhone: '',
        responsibleCPF: '',
        responsibleDepartment: '',
        observations: ''
      });
      
      if (onTermCreated) {
        onTermCreated(newTerm);
      }
      
      alert('Termo enviado com sucesso! O responsável receberá um e-mail para assinatura.');
    } catch (error) {
      console.error('Erro ao criar e enviar termo:', error);
      alert('Erro ao processar termo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Verificar status do documento
  const checkDocumentStatus = async (term: ResponsibilityTerm) => {
    setLoading(true);
    try {
      const { api } = await import('../../services/api');
      
      const updatedTerm = await api.responsibilityTerms.checkStatus(term.id);
      
      // Atualizar termo na lista
      setExistingTerms(existingTerms.map(t => 
        t.id === updatedTerm.id ? updatedTerm : t
      ));
      
      if (updatedTerm.status === 'signed') {
        alert('Documento assinado com sucesso! O PDF assinado foi anexado ao equipamento.');
      } else {
        alert('Documento ainda não foi assinado.');
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      alert('Erro ao verificar status do documento.');
    } finally {
      setLoading(false);
    }
  };

  // Formatar telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  };

  // Formatar CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileSignature className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Termo de Responsabilidade Digital</h2>
                <p className="text-blue-100">Equipamento: {equipment.assetNumber} - {equipment.description}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'create'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('create')}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Novo Termo</span>
              </div>
            </button>
            <button
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'list'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('list')}
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Termos Enviados ({existingTerms.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {activeTab === 'create' && (
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Como funciona:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Preencha os dados do responsável pelo equipamento</li>
                      <li>O sistema gerará o PDF do termo automaticamente</li>
                      <li>O responsável receberá um e-mail para assinar digitalmente</li>
                      <li>Após assinado, o documento será anexado ao equipamento</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-4 max-w-2xl mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.responsiblePerson}
                    onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.responsiblePerson ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.responsiblePerson && (
                    <p className="text-red-500 text-xs mt-1">{errors.responsiblePerson}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPF *
                    </label>
                    <input
                      type="text"
                      value={formData.responsibleCPF}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        responsibleCPF: formatCPF(e.target.value) 
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.responsibleCPF ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                    {errors.responsibleCPF && (
                      <p className="text-red-500 text-xs mt-1">{errors.responsibleCPF}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone *
                    </label>
                    <input
                      type="text"
                      value={formData.responsiblePhone}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        responsiblePhone: formatPhone(e.target.value) 
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.responsiblePhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                    {errors.responsiblePhone && (
                      <p className="text-red-500 text-xs mt-1">{errors.responsiblePhone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={formData.responsibleEmail}
                    onChange={(e) => setFormData({ ...formData, responsibleEmail: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.responsibleEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.responsibleEmail && (
                    <p className="text-red-500 text-xs mt-1">{errors.responsibleEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento/Setor *
                  </label>
                  <input
                    type="text"
                    value={formData.responsibleDepartment}
                    onChange={(e) => setFormData({ ...formData, responsibleDepartment: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.responsibleDepartment ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.responsibleDepartment && (
                    <p className="text-red-500 text-xs mt-1">{errors.responsibleDepartment}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Informações adicionais sobre o equipamento ou condições especiais..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateAndSend}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Gerar e Enviar para Assinatura</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'list' && (
            <div className="p-6">
              {loadingTerms ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : existingTerms.length > 0 ? (
                <div className="space-y-4">
                  {existingTerms.map((term) => (
                    <div
                      key={term.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{term.responsiblePerson}</h4>
                          <p className="text-sm text-gray-600">{term.responsibleEmail}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Enviado em: {new Date(term.termDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              term.status === 'signed'
                                ? 'bg-green-100 text-green-800'
                                : term.status === 'sent'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {term.status === 'signed' ? (
                              <span className="flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Assinado
                              </span>
                            ) : term.status === 'sent' ? (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Aguardando Assinatura
                              </span>
                            ) : (
                              'Rascunho'
                            )}
                          </span>
                          {term.status === 'sent' && (
                            <button
                              onClick={() => checkDocumentStatus(term)}
                              disabled={loading}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Verificar Status"
                            >
                              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                          )}
                          {term.pdfUrl && (
                            <button
                              onClick={() => alert('Visualizar PDF')}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                              title="Visualizar PDF"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {term.signedPdfUrl && (
                            <button
                              onClick={() => alert('Baixar PDF Assinado')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Baixar PDF Assinado"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      {term.assinafySignedAt && (
                        <p className="text-xs text-green-600 mt-2">
                          Assinado em: {new Date(term.assinafySignedAt).toLocaleString('pt-BR')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Nenhum termo enviado ainda</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Clique em "Novo Termo" para criar o primeiro
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponsibilityTermAssinafy;