import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as loanApi from '../../api/loan.api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate, formatPercent } from '../../utils/formatters';
import { LOAN_TYPES } from '../../utils/constants';
import toast from 'react-hot-toast';
import { Plus, Landmark, Calendar, FileText, CheckCircle, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LoansPage() {
  const { t } = useLanguage();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [amortization, setAmortization] = useState(null);
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAmortOpen, setIsAmortOpen] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await loanApi.getLoans();
      setLoans(res.data);
    } catch {
      toast.error(t('Erreur lors du chargement des prêts'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    reset({
      lenderName: '', loanType: 'PERSONAL', initialAmount: '',
      interestRate: '', durationMonths: '', startDate: new Date().toISOString().split('T')[0],
      monthlyPayment: '', notes: ''
    });
    setIsAddOpen(true);
  };

  const handleSave = async (data) => {
    try {
      await loanApi.createLoan(data);
      toast.success(t('Nouveau prêt créé !'));
      setIsAddOpen(false);
      fetchLoans();
    } catch {
      toast.error(t('Erreur lors de la création du prêt'));
    }
  };

  const handleShowAmortization = async (loan) => {
    setSelectedLoan(loan);
    try {
      const res = await loanApi.getAmortization(loan.id);
      setAmortization(res.data);
      setIsAmortOpen(true);
    } catch {
      toast.error(t('Erreur de chargement du tableau d\'amortissement'));
    }
  };

  const handleMarkPaid = async (installmentId) => {
    try {
      await loanApi.markRepaymentPaid(selectedLoan.id, {
        repaymentId: installmentId,
        paymentDate: new Date().toISOString().split('T')[0],
        notes: t('Paiement enregistré depuis le tableau d\'amortissement.')
      });
      toast.success(t('Mensualité marquée comme payée !'));
      // Refresh
      const res = await loanApi.getAmortization(selectedLoan.id);
      setAmortization(res.data);
      fetchLoans();
    } catch {
      toast.error(t('Erreur lors de l\'enregistrement du paiement'));
    }
  };

  const handleDelete = async () => {
    if (!loanToDelete) return;
    try {
      await loanApi.deleteLoan(loanToDelete.id);
      toast.success(t('Prêt supprimé !'));
      fetchLoans();
    } catch {
      toast.error(t('Erreur lors de la suppression'));
    }
  };

  const amortizationColumns = [
    { key: 'installmentNumber', label: t('N°') },
    { key: 'dueDate', label: t('Date d\'échéance'), render: (row) => formatDate(row.dueDate) },
    { key: 'principalAmount', label: t('Capital'), render: (row) => formatCurrency(row.principalAmount) },
    { key: 'interestAmount', label: t('Intérêts'), render: (row) => formatCurrency(row.interestAmount) },
    { key: 'totalAmount', label: t('Mensualité'), render: (row) => formatCurrency(row.totalAmount) },
    { key: 'isPaid', label: t('Statut'), render: (row) => (
      row.isPaid ? (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          {t('Payé')}
        </span>
      ) : (
        <Button variant="outline" className="!py-1 !px-2.5 !text-xs" onClick={() => handleMarkPaid(row.installmentNumber)}>
          {t('Régler')}
        </Button>
      )
    )}
  ];

  return (
    <div className="space-y-6">
      {/* Barre supérieure */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-white">{t('Suivi des Emprunts & Dettes Financières')}</h2>
        <Button onClick={handleOpenAdd}><Plus size={16} /> {t('Nouveau prêt')}</Button>
      </div>

      {/* Liste des prêts */}
      {loading ? (
        <Card className="py-12 flex justify-center"><LoadingSpinner /></Card>
      ) : loans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loans.map(l => (
            <Card key={l.id} className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                    <Landmark size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{l.lenderName}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-white/5 text-slate-300">
                      {t(LOAN_TYPES[l.loanType])}
                    </span>
                  </div>
                </div>
                <button onClick={() => setLoanToDelete(l)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-white/5 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Barre de progression du remboursement */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{t('Remboursé :')} {formatPercent(l.progressPercent)}</span>
                  <span>{t('Capital restant :')} {formatCurrency(l.remainingCapital)} / {formatCurrency(l.initialAmount)}</span>
                </div>
                <ProgressBar value={l.progressPercent} color="bg-red-500" />
              </div>

              {/* Détails financiers */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-white/5 p-4 rounded-xl">
                <div>
                  <p className="text-slate-300">{t('Mensualité')}</p>
                  <p className="font-bold text-white text-sm mt-0.5">{formatCurrency(l.monthlyPayment)} {t('/ mois')}</p>
                </div>
                <div>
                  <p className="text-slate-300">{t('Taux d\'intérêt')}</p>
                  <p className="font-bold text-white text-sm mt-0.5">{l.interestRate}% ({l.isFixedRate ? t('Fixe') : t('Variable')})</p>
                </div>
                <div>
                  <p className="text-slate-300">{t('Total payé (Intérêts incl.)')}</p>
                  <p className="font-bold text-white text-sm mt-0.5">{formatCurrency(l.totalPaid)}</p>
                </div>
                {l.nextDueDate && (
                  <div>
                    <p className="text-slate-300">{t('Prochaine échéance')}</p>
                    <p className="font-bold text-amber-400 text-sm mt-0.5">{formatDate(l.nextDueDate)}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <Button variant="outline" className="w-full" onClick={() => handleShowAmortization(l)}>
                <FileText size={16} /> {t('Tableau d\'amortissement')}
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title={t("Aucun prêt actif")} message={t("Ajoutez vos emprunts pour suivre vos échéanciers de remboursement.")} />
      )}

      {/* Modal d'ajout de prêt */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title={t("Créer un emprunt / prêt financier")}>
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <Input label={t("Nom du créancier")} {...register('lenderName', { required: t('Créancier obligatoire') })} error={errors.lenderName?.message} />
          <div className="grid grid-cols-2 gap-3">
            <Select label={t("Type de prêt")} options={Object.entries(LOAN_TYPES).map(([k, v]) => ({ value: k, label: t(v) }))} {...register('loanType')} />
            <Input label={t("Date de début")} type="date" {...register('startDate', { required: t('Date de début obligatoire') })} error={errors.startDate?.message} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label={t("Capital initial")} type="number" step="0.01" {...register('initialAmount', { required: t('Capital obligatoire'), min: 1 })} error={errors.initialAmount?.message} />
            <Input label={t("Mensualité")} type="number" step="0.01" {...register('monthlyPayment', { required: t('Mensualité obligatoire'), min: 1 })} error={errors.monthlyPayment?.message} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label={t("Taux d'intérêt (%)")} type="number" step="0.01" {...register('interestRate', { required: t('Taux obligatoire'), min: 0 })} error={errors.interestRate?.message} />
            <Input label={t("Durée (mois)")} type="number" {...register('durationMonths', { required: t('Durée obligatoire'), min: 1 })} error={errors.durationMonths?.message} />
          </div>
          <Input label={t("Notes")} {...register('notes')} />

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>{t('Annuler')}</Button>
            <Button type="submit">{t('Calculer & Générer l\'échéancier')}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Tableau d'amortissement */}
      <Modal isOpen={isAmortOpen} onClose={() => setIsAmortOpen(false)} title={`${t('Tableau d\'amortissement —')} ${selectedLoan?.lenderName}`} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded-xl">
            <div><p className="text-gray-500">{t('Capital Emprunté')}</p><p className="font-bold text-gray-900 text-lg mt-0.5">{formatCurrency(selectedLoan?.initialAmount)}</p></div>
            <div><p className="text-gray-500">{t('Intérêts Remboursés')}</p><p className="font-bold text-gray-900 text-lg mt-0.5">{formatCurrency(selectedLoan?.totalInterestPaid)}</p></div>
            <div><p className="text-gray-500">{t('Reste à payer')}</p><p className="font-bold text-red-500 text-lg mt-0.5">{formatCurrency(selectedLoan?.remainingCapital)}</p></div>
          </div>
          <div className="max-h-[50vh] overflow-y-auto rounded-xl border border-gray-100">
            <Table columns={amortizationColumns} data={amortization?.schedule || []} />
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setIsAmortOpen(false)}>{t('Fermer')}</Button>
          </div>
        </div>
      </Modal>

      {/* Dialogue de suppression */}
      <ConfirmDialog isOpen={!!loanToDelete} onClose={() => setLoanToDelete(null)} onConfirm={handleDelete} message={`${t('Voulez-vous vraiment supprimer le prêt')} "${loanToDelete?.lenderName}" ?`} />
    </div>
  );
}
