import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as goalApi from '../../api/goal.api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate, formatPercent } from '../../utils/formatters';
import { FUNDING_MODES } from '../../utils/constants';
import toast from 'react-hot-toast';
import { Plus, PiggyBank, Calendar, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function GoalsPage() {
  const { t } = useLanguage();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: registerContrib, handleSubmit: handleContribSubmit, reset: resetContrib, formState: { errors: contribErrors } } = useForm();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await goalApi.getGoals();
      setGoals(res.data);
    } catch {
      toast.error(t('Erreur lors du chargement des objectifs'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingGoal(null);
    reset({ name: '', targetAmount: '', targetDate: '', fundingMode: 'MANUAL', description: '' });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (goal) => {
    setEditingGoal(goal);
    reset({
      name: goal.name,
      targetAmount: goal.targetAmount,
      targetDate: goal.targetDate || '',
      fundingMode: goal.fundingMode,
      description: goal.description || ''
    });
    setIsAddOpen(true);
  };

  const handleOpenContribute = (goal) => {
    setSelectedGoal(goal);
    resetContrib({ amount: '', contributionDate: new Date().toISOString().split('T')[0], notes: '' });
    setIsContributeOpen(true);
  };

  const handleSave = async (data) => {
    try {
      if (editingGoal) {
        await goalApi.updateGoal(editingGoal.id, data);
        toast.success(t('Objectif modifié avec succès !'));
      } else {
        await goalApi.createGoal(data);
        toast.success(t('Nouvel objectif créé avec succès !'));
      }
      setIsAddOpen(false);
      fetchGoals();
    } catch {
      toast.error(t('Erreur lors de la sauvegarde de l\'objectif'));
    }
  };

  const handleContribute = async (data) => {
    try {
      await goalApi.contributeToGoal(selectedGoal.id, data);
      toast.success(t('Contribution enregistrée !'));
      setIsContributeOpen(false);
      fetchGoals();
    } catch {
      toast.error(t('Erreur lors de l\'enregistrement de la contribution'));
    }
  };

  const handleDelete = async () => {
    if (!goalToDelete) return;
    try {
      await goalApi.deleteGoal(goalToDelete.id);
      toast.success(t('Objectif supprimé !'));
      fetchGoals();
    } catch {
      toast.error(t('Erreur lors de la suppression'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre supérieure */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-white">{t('Suivi des Objectifs d\'Épargne')}</h2>
        <Button onClick={handleOpenAdd}><Plus size={16} /> {t('Nouvel objectif')}</Button>
      </div>

      {/* Liste des objectifs */}
      {loading ? (
        <Card className="py-12 flex justify-center"><LoadingSpinner /></Card>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map(g => (
            <Card key={g.id} className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{t(g.name)}</h3>
                  {g.description && <p className="text-sm text-slate-300 mt-1">{t(g.description)}</p>}
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleOpenEdit(g)} className="p-1.5 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => setGoalToDelete(g)} className="p-1.5 text-gray-500 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-[#2E5FA3]">{formatCurrency(g.currentAmount)}</span>
                  <span className="text-gray-400">{t('Objectif :')} {formatCurrency(g.targetAmount)} ({formatPercent(g.progressPercent)})</span>
                </div>
                <ProgressBar value={g.progressPercent} color="bg-[#2E5FA3]" />
              </div>

              {/* Détails supplémentaires */}
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 bg-white/5 p-3 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>{t('Date cible :')} {g.targetDate ? formatDate(g.targetDate) : t('Aucune')}</span>
                </div>
                <div>
                  <span>{t('Mode :')} {t(FUNDING_MODES[g.fundingMode])}</span>
                </div>
                {g.monthlyRecommended && (
                  <div className="col-span-2 text-[#2E5FA3] font-medium mt-1">
                    {t('Épargne recommandée :')} {formatCurrency(g.monthlyRecommended)} {t('/ mois')}
                  </div>
                )}
              </div>

              {/* Actions de l'objectif */}
              {!g.isCompleted && (
                <div className="flex gap-2">
                  <Button variant="outline" className="w-full" onClick={() => handleOpenContribute(g)}>
                    <PiggyBank size={16} /> {t('Contribuer')}
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title={t("Aucun objectif")} message={t("Fixez-vous un but (Ex. fonds d'urgence, vacances) pour orienter votre épargne.")} />
      )}

      {/* Modal d'ajout / modification d'objectif */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title={t("Créer un objectif d'épargne")}>
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <Input label={t("Nom de l'objectif")} {...register('name', { required: t('Nom obligatoire') })} error={errors.name?.message} />
          <Input label={t("Description (optionnel)")} {...register('description')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label={t("Montant cible")} type="number" step="0.01" {...register('targetAmount', { required: t('Montant obligatoire'), min: { value: 0.01, message: t('Doit être supérieur à 0') } })} error={errors.targetAmount?.message} />
            <Input label={t("Date cible")} type="date" {...register('targetDate')} />
          </div>
          <Select label={t("Mode de financement")} options={Object.entries(FUNDING_MODES).map(([k, v]) => ({ value: k, label: t(v) }))} {...register('fundingMode')} />

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>{t('Annuler')}</Button>
            <Button type="submit">{t('Sauvegarder')}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de contribution */}
      <Modal isOpen={isContributeOpen} onClose={() => setIsContributeOpen(false)} title={`${t('Contribuer à')} "${t(selectedGoal?.name)}"`}>
        <form onSubmit={handleContribSubmit(handleContribute)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label={t("Montant")} type="number" step="0.01" {...registerContrib('amount', { required: t('Montant obligatoire'), min: { value: 0.01, message: t('Doit être supérieur à 0') } })} error={contribErrors.amount?.message} />
            <Input label={t("Date de contribution")} type="date" {...registerContrib('contributionDate')} />
          </div>
          <Input label={t("Notes")} {...registerContrib('notes')} />

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsContributeOpen(false)}>{t('Annuler')}</Button>
            <Button type="submit">{t('Enregistrer')}</Button>
          </div>
        </form>
      </Modal>

      {/* Dialogue de suppression */}
      <ConfirmDialog isOpen={!!goalToDelete} onClose={() => setGoalToDelete(null)} onConfirm={handleDelete} message={`${t('Voulez-vous vraiment supprimer l\'objectif')} "${t(goalToDelete?.name)}" ?`} />
    </div>
  );
}
