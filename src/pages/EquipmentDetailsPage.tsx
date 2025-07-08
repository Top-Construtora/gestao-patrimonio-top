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
  Edit,
  Trash,
  Shield,
  FileText,
  Activity,
  ArrowRight
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
      await inventoryService.transferEquipment(
        equipmentId,
        newLocation,
        transferDate,
        responsiblePerson || 'Sistema',
        observations
      );
      
      await loadEquipmentData();
      setShowTransferModal(false);
      showSuccess('Equipamento transferido com sucesso!');
    } catch (error) {
      console.error('Erro ao transferir equipamento:', error);
      showError('Erro ao transferir equipamento');
      throw error;
    }
  };

  const handleUploadAttachment = async (file: File) => {
    try {
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
        {/* Breadcrumb e Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
            Voltar para lista
          </button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowRight className="h-4 w-4" />}
              onClick={() => setShowTransferModal(true)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
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
          onTransfer={() => setShowTransferModal(true)}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-gray-600 p-2 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{history.length}</span>
            </div>
            <p className="text-sm font-medium text-gray-700">Atividades Registradas</p>
            <p className="text-xs text-gray-600 mt-1">Histórico completo de alterações</p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-gray-600 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{attachments.length}</span>
            </div>
            <p className="text-sm font-medium text-gray-700">Documentos Anexados</p>
            <p className="text-xs text-gray-600 mt-1">Arquivos e documentos relacionados</p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-gray-600 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900">
                {equipment.status === 'ativo' ? 'Operacional' : 
                 equipment.status === 'manutenção' ? 'Em Manutenção' : 
                 'Inativo'}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700">Status Atual</p>
            <p className="text-xs text-gray-600 mt-1">Condição operacional do equipamento</p>
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