import React, { useState, useEffect } from 'react';
import { Equipment, HistoryEntry, Attachment } from '../types';
import Button from '../components/common/Button';
import EquipmentDetails from '../components/equipment/EquipmentDetails';
import TransferEquipmentModal from '../components/equipment/TransferEquipment';
import LoadingOverlay from '../components/common/LoadingOverlay';
import { 
  ArrowLeft, 
  AlertTriangle, 
  RefreshCw,
  Clock,
  History as HistoryIcon,
  Paperclip,
  Package,
  ArrowRight,
  Edit,
  Trash
} from 'lucide-react';
import inventoryService from '../services/inventoryService';
import { useToast } from '../components/common/Toast';

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
  const { showError, showSuccess } = useToast();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

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

  const handleTransfer = async (
    equipmentId: string, 
    newLocation: string, 
    transferDate: string, 
    responsiblePerson?: string, 
    observations?: string
  ) => {
    try {
      // Usar a função transferEquipment do serviço
      await inventoryService.transferEquipment(
        equipmentId,
        newLocation,
        transferDate,
        responsiblePerson || 'Sistema',
        observations
      );
      
      // Recarregar dados
      await loadEquipmentData();
      
      setShowTransferModal(false);
    } catch (error) {
      console.error('Erro ao transferir equipamento:', error);
      throw error;
    }
  };

  const handleUploadAttachment = async (file: File) => {
    try {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 10MB');
      }

      const newAttachment = await inventoryService.uploadAttachment(
        equipmentId,
        file,
        'Administrador'
      );
      
      setAttachments([...attachments, newAttachment]);
      showSuccess('Anexo enviado com sucesso!');
    } catch (err) {
      console.error('Error uploading attachment:', err);
      showError((err as Error).message || 'Erro ao enviar anexo');
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await inventoryService.deleteAttachment(attachmentId, 'Administrador');
      setAttachments(attachments.filter(a => a.id !== attachmentId));
      showSuccess('Anexo removido com sucesso!');
    } catch (err) {
      console.error('Error deleting attachment:', err);
      showError('Erro ao remover anexo');
    }
  };

  const handleDownloadAttachment = async (attachment: Attachment) => {
    try {
      await inventoryService.downloadAttachment(attachment);
    } catch (err) {
      console.error('Error downloading attachment:', err);
      showError('Erro ao baixar anexo');
    }
  };

  if (loading) {
    return <LoadingOverlay message="Carregando detalhes..." submessage="Por favor, aguarde" />;
  }

  if (error || !equipment) {
    return (
      <div className="space-y-6 animate-fade-in">
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
          <h1 className="text-3xl font-bold text-gray-900">Detalhes do Equipamento</h1>
          <p className="text-gray-600 mt-2">Visualize e gerencie informações do equipamento</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Equipamento não encontrado'}
          </h3>
          <p className="text-gray-600 mb-6">
            Não foi possível carregar os detalhes deste equipamento.
          </p>
          <Button
            variant="outline"
            icon={<RefreshCw size={16} />}
            onClick={handleRefresh}
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
              Voltar
            </button>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Package className="h-4 w-4" />
              <span>{equipment.assetNumber}</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowRight className="h-4 w-4" />}
              onClick={() => setShowTransferModal(true)}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Transferir
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              icon={<Edit className="h-4 w-4" />}
              onClick={() => onEdit(equipment.id)}
            >
              Editar
            </Button>
            
            <Button
              variant="danger"
              size="sm"
              icon={<Trash className="h-4 w-4" />}
              onClick={() => onDelete(equipment.id)}
            >
              Excluir
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={handleRefresh}
            >
              Atualizar
            </Button>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detalhes do Equipamento</h1>
          <p className="text-gray-600 mt-2">Visualize e gerencie informações completas do equipamento</p>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <HistoryIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Histórico</p>
                  <p className="text-xl font-bold text-gray-900">{history.length}</p>
                </div>
              </div>
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Paperclip className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Anexos</p>
                  <p className="text-xl font-bold text-gray-900">{attachments.length}</p>
                </div>
              </div>
              <Package className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Última Atualização</p>
                  <p className="text-sm font-medium text-gray-900">
                    {equipment.updatedAt || equipment.createdAt
                      ? new Date((equipment.updatedAt || equipment.createdAt) as string).toLocaleDateString('pt-BR')
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      <TransferEquipmentModal
        isOpen={showTransferModal}
        equipment={equipment}
        onClose={() => setShowTransferModal(false)}
        onSuccess={handleTransfer}
      />
    </>
  );
};

export default EquipmentDetailsPage;