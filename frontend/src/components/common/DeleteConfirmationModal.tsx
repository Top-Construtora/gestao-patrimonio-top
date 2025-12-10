import React, { useEffect, useRef } from 'react';
import Button from './Button';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  itemName,
  onConfirm,
  onCancel
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap e keyboard handling
  useEffect(() => {
    if (isOpen) {
      // Focar no botão cancelar ao abrir
      cancelButtonRef.current?.focus();

      // Handler para ESC
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const titleId = 'delete-modal-title';
  const descId = 'delete-modal-desc';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-2" aria-hidden="true" />
            <h3 id={titleId} className="text-lg font-medium text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div id={descId} className="px-6 py-4">
          <p className="text-gray-700 mb-2">{message}</p>
          {itemName && (
            <p className="text-gray-900 font-medium">{itemName}</p>
          )}
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
          <Button ref={cancelButtonRef} variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;