import React, { useState, useEffect } from 'react';
import { Equipment, HistoryEntry, Attachment } from '../types';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import EquipmentDetails from '../components/equipment/EquipmentDetails';
import LoadingOverlay from '../components/common/LoadingOverlay';
import { 
  ArrowLeft, 
  AlertTriangle, 
  Package,
  RefreshCw,
  Paperclip,
  Clock,
  History as HistoryIcon
} from 'lucide-react';
import inventoryService from '../services/inventoryService';

interface EquipmentDetailsPageProps {
  equipmentId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const EquipmentDetailsPage: React.FC<EquipmentDetailsPageProps> = ({
  equipmentId,
  onBack,
  onEdit,
  onDelete
}) => {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEquipmentData = async () => {
    try {
      setError(null);
      
      // Load equipment details
      const equipmentData = await inventoryService.getEquipmentById(equipmentId);
      if (!equipmentData) {
        throw new Error('Equipamento não encontrado');
      }
      setEquipment(equipmentData);

      // Load equipment history
      const historyData = await inventoryService.getEquipmentHistory(equipmentId);
      setHistory(historyData);

      // Load equipment attachments
      const attachmentsData = await inventoryService.getEquipmentAttachments(equipmentId);
      setAttachments(attachmentsData);
    } catch (err) {
      console.error('Error loading equipment details:', err);
      setError((err as Error).message || 'Erro ao carregar detalhes do equipamento');
    }
  };

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await loadEquipmentData();
      setLoading(false);
    };

    if (equipmentId) {
      initialLoad();
    }
  }, [equipmentId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEquipmentData();
    setRefreshing(false);
  };

  const handleUploadAttachment = async (file: File) => {
    try {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Tamanho máximo permitido: 10MB');
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não permitido');
      }

      const attachment = await inventoryService.uploadAttachment(equipmentId, file, 'Administrador');
      setAttachments(prev => [...prev, attachment]);
      
      // Reload history to show new entry
      const historyData = await inventoryService.getEquipmentHistory(equipmentId);
      setHistory(historyData);
    } catch (err) {
      console.error('Error uploading attachment:', err);
      throw err;
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await inventoryService.deleteAttachment(attachmentId, 'Administrador');
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
      
      // Reload history to show new entry
      const historyData = await inventoryService.getEquipmentHistory(equipmentId);
      setHistory(historyData);
    } catch (err) {
      console.error('Error deleting attachment:', err);
      throw err;
    }
  };

  const handleDownloadAttachment = async (attachment: Attachment) => {
    try {
      await inventoryService.downloadAttachment(attachment);
    } catch (err) {
      console.error('Error downloading attachment:', err);
      throw err;
    }
  };

  // Calculate statistics
  const calculateAge = () => {
    if (!equipment?.acquisitionDate) return 'N/A';
    const years = Math.floor((Date.now() - new Date(equipment.acquisitionDate).getTime()) / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((Date.now() - new Date(equipment.acquisitionDate).getTime()) / (1000 * 60 * 60 * 24 * 30)) % 12;
    
    if (years === 0) {
      return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    }
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  };

  if (loading) {
    return <LoadingOverlay message="Carregando equipamento..." submessage="Por favor, aguarde" />;
  }

  if (error || !equipment) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Equipamento não encontrado'}
          </h3>
          <p className="text-gray-500 mb-6">
            Não foi possível carregar os detalhes deste equipamento.
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={handleRefresh} 
              icon={<RefreshCw size={16} />} 
              variant="primary"
            >
              Tentar Novamente
            </Button>
            <Button 
              onClick={onBack} 
              icon={<ArrowLeft size={16} />} 
              variant="outline"
            >
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detalhes do Equipamento</h1>
            <p className="text-gray-600 mt-2">Visualize e gerencie informações, histórico e anexos</p>
          </div>
        </div>

        
      </div>

      {/* Equipment Details Component */}
      <EquipmentDetails 
        equipment={equipment}
        history={history}
        attachments={attachments}
        onEdit={onEdit}
        onDelete={onDelete}
        onUploadAttachment={handleUploadAttachment}
        onDeleteAttachment={handleDeleteAttachment}
        onDownloadAttachment={handleDownloadAttachment}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-600">Tempo de Uso</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {calculateAge()}
              </p>
            </div>
            <div className="p-3 bg-white bg-opacity-60 rounded-full ml-3 flex-shrink-0">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-purple-600">Alterações</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{history.length}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-60 rounded-full ml-3 flex-shrink-0">
              <HistoryIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-600">Anexos</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{attachments.length}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-60 rounded-full ml-3 flex-shrink-0">
              <Paperclip className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className={`border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${
          equipment.status === 'ativo' 
            ? 'bg-gradient-to-br from-emerald-50 to-emerald-100' 
            : equipment.status === 'manutenção'
            ? 'bg-gradient-to-br from-yellow-50 to-yellow-100'
            : 'bg-gradient-to-br from-red-50 to-red-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${
                equipment.status === 'ativo' 
                  ? 'text-emerald-600' 
                  : equipment.status === 'manutenção'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>Status</p>
              <p className="text-sm font-bold text-gray-900 mt-2">
                {equipment.status === 'ativo' ? 'Ativo' : 
                 equipment.status === 'manutenção' ? 'Em Manutenção' : 
                 'Desativado'}
              </p>
            </div>
            <div className={`p-3 bg-white bg-opacity-60 rounded-full ml-3 flex-shrink-0`}>
              <Package className={`w-6 h-6 ${
                equipment.status === 'ativo' 
                  ? 'text-emerald-600' 
                  : equipment.status === 'manutenção'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EquipmentDetailsPage;