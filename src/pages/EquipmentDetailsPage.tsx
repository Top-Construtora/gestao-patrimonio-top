import React, { useState, useEffect } from 'react';
import { Equipment, HistoryEntry, Attachment } from '../types';
import Button from '../components/common/Button';
import EquipmentDetails from '../components/equipment/EquipmentDetails';
import LoadingOverlay from '../components/common/LoadingOverlay';
import { 
  ArrowLeft, 
  AlertTriangle, 
  RefreshCw,
  Clock,
  History as HistoryIcon,
  Paperclip,
  Package
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
  const [error, setError] = useState<string | null>(null);

  const loadEquipmentData = async () => {
    try {
      setError(null);
      
      const [equipmentData, historyData, attachmentsData] = await Promise.all([
        inventoryService.getEquipmentById(equipmentId),
        inventoryService.getEquipmentHistory(equipmentId),
        inventoryService.getEquipmentAttachments(equipmentId)
      ]);

      if (!equipmentData) {
        throw new Error('Equipamento não encontrado');
      }
      
      setEquipment(equipmentData);
      setHistory(historyData);
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
    await loadEquipmentData();
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
    }
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
      {/* Botão Voltar */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
          Voltar para a lista
        </button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Detalhes do Equipamento</h1>
        <p className="text-gray-600 mt-1">Visualize e gerencie informações, histórico e anexos</p>
      </div>

      {/* Componente de Detalhes */}
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
    </div>
  );
};

export default EquipmentDetailsPage;