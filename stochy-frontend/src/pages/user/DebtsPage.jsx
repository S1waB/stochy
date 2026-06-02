import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as debtApi from '../../api/debt.api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DEBT_STATUSES } from '../../utils/constants';
import toast from 'react-hot-toast';
import { Plus, User, Calendar, CreditCard, ChevronRight, Trash2 } from 'lucide-react';

export default function DebtsPage() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDebt, setSelectedDebt] = useState(null);
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRepayOpen, setIsRepayOpen] = useState(false);
  const [debtToDelete, setDebtToDelete] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: registerRepay, handleSubmit: handleRepaySubmit, reset: resetRepay, formState: { errors: repayErrors } } = useForm();

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    setLoading(true);
    try {
      const res = await debtApi.getDebts();
      setDebts(res.data);
    } catch {
      toast.error('Erreur lors du chargement des dettes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    reset({ debtorName: '', amountLent: '', loanDate: new Date().toISOString().split('T')[0], expectedRepaymentDate: '', notes: '' });
    setIsAddOpen(true);
  };

  const handleOpenRepay = (debt) => {
    setSelectedDebt(debt);
    resetRepay({ amount: '', repaymentDate: new Date().toISOString().split('T')[0], notes: '' });
    setIsRepayOpen(true);
  };

  const handleSave = async (data) => {
    try {
      await debtApi.createDebt(data);
      toast.success('Dette enregistrée avec succès !');
      setIsAddOpen(false);
      fetchDebts();
    } catch {
      toast.error('Erreur lors de l\'enregistrement de la dette');
    }
  };

  const handleRepay = async (data) => {
    try {
      await debtApi.addDebtRepayment(selectedDebt.id, data);
      toast.success('Remboursement enregistré !');
      setIsRepayOpen(false);
      fetchDebts();
    } catch {
      toast.error('Erreur lors de l\'enregistrement du remboursement');
    }
  };

  const handleDelete = async () => {
    if (!debtToDelete) return;
    try {
      await debtApi.deleteDebt(debtToDelete.id);
      toast.success('Dette supprimée !');
      fetchDebts();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre supérieure */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-white">Dettes actives (Argent prêté)</h2>
        <Button onClick={handleOpenAdd}><Plus size={16} /> Prêter de l'argent</Button>
      </div>

      {/* Liste des dettes */}
      {loading ? (
        <Card className="py-12 flex justify-center"><LoadingSpinner /></Card>
      ) : debts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {debts.map(d => {
            const isSettled = d.status === 'SETTLED';
            return (
              <Card key={d.id} className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{d.debtorName}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${isSettled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {DEBT_STATUSES[d.status]}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setDebtToDelete(d)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-white/5 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm py-2">
                  <div>
                    <span className="text-slate-300 block">Total prêté</span>
                    <span className="font-bold text-white">{formatCurrency(d.amountLent)}</span>
                  </div>
                  <div>
                    <span className="text-slate-300 block">Reste à recouvrer</span>
                    <span className={`font-bold ${isSettled ? 'text-slate-400' : 'text-amber-400'}`}>{formatCurrency(d.remainingAmount)}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-white/5 p-3 rounded-lg flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5"><Calendar size={14} /> Date de prêt : {formatDate(d.loanDate)}</div>
                  {d.expectedRepaymentDate && (
                    <div className="flex items-center gap-1.5"><Calendar size={14} /> Date prévue : {formatDate(d.expectedRepaymentDate)}</div>
                  )}
                </div>

                {/* Historique des remboursements */}
                {d.repayments?.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Remboursements reçus</h4>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {d.repayments.map(r => (
                        <div key={r.id} className="flex justify-between text-xs text-slate-300 bg-emerald-50/50 p-2 rounded">
                          <span>{formatDate(r.repaymentDate)}</span>
                          <span className="font-semibold text-emerald-700">+{formatCurrency(r.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action de remboursement */}
                {!isSettled && (
                  <Button variant="outline" className="w-full" onClick={() => handleOpenRepay(d)}>
                    <CreditCard size={16} /> Enregistrer un remboursement
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Aucune dette" message="Ajoutez les prêts accordés à vos proches pour ne plus oublier d'être remboursé." />
      )}

      {/* Modal d'ajout de dette */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Enregistrer une dette (Argent prêté)">
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <Input label="Nom de l'emprunteur / débiteur" {...register('debtorName', { required: 'Nom de l\'emprunteur obligatoire' })} error={errors.debtorName?.message} />
          <Input label="Montant prêté" type="number" step="0.01" {...register('amountLent', { required: 'Montant obligatoire', min: { value: 0.01, message: 'Doit être supérieur à 0' } })} error={errors.amountLent?.message} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date du prêt" type="date" {...register('loanDate', { required: 'Date obligatoire' })} error={errors.loanDate?.message} />
            <Input label="Date de remboursement prévue" type="date" {...register('expectedRepaymentDate')} />
          </div>
          <Input label="Notes / Conditions" {...register('notes')} />

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Annuler</Button>
            <Button type="submit">Enregistrer la dette</Button>
          </div>
        </form>
      </Modal>

      {/* Modal d'ajout de remboursement */}
      <Modal isOpen={isRepayOpen} onClose={() => setIsRepayOpen(false)} title={`Remboursement de "${selectedDebt?.debtorName}"`}>
        <form onSubmit={handleRepaySubmit(handleRepay)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Montant reçu" type="number" step="0.01" {...registerRepay('amount', { required: 'Montant obligatoire', min: { value: 0.01, message: 'Doit être supérieur à 0' } })} error={repayErrors.amount?.message} />
            <Input label="Date du versement" type="date" {...registerRepay('repaymentDate')} />
          </div>
          <Input label="Notes (Mode de versement...)" {...registerRepay('notes')} />

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsRepayOpen(false)}>Annuler</Button>
            <Button type="submit">Valider le versement</Button>
          </div>
        </form>
      </Modal>

      {/* Dialogue de suppression */}
      <ConfirmDialog isOpen={!!debtToDelete} onClose={() => setDebtToDelete(null)} onConfirm={handleDelete} message={`Voulez-vous vraiment supprimer la dette de "${debtToDelete?.debtorName}" ?`} />
    </div>
  );
}
