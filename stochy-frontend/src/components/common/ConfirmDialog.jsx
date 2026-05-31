import { AlertTriangle } from 'lucide-react';
import Button from './Button';
import Modal from './Modal';
export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirmer', message = 'Êtes-vous sûr ?' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center"><AlertTriangle size={28} className="text-red-500" /></div>
        <p className="text-gray-600">{message}</p>
        <div className="flex gap-3 w-full">
          <Button variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
          <Button variant="danger" className="flex-1" onClick={() => { onConfirm(); onClose(); }}>Supprimer</Button>
        </div>
      </div>
    </Modal>
  );
}
