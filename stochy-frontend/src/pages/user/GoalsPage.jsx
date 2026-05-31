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
import { formatCurrency, formatDate, formatPercent } from '../../utils/formatters';
import { FUNDING_MODES } from '../../utils/constants';
import toast from 'react-hot-toast';
import { Plus, PiggyBank, Calendar, Edit, Trash2 } from 'lucide-react';

export default function GoalsPage() {
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
      toast.error('Erreur lors du chargement des objectifs');
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
        toast.success('Objectif modifié avec succès !');
      } else {
        await goalApi.createGoal(data);
        toast.success('Nouvel objectif créé avec succès !');
      }
      setIsAddOpen(false);
      fetchGoals();
    } catch {
      toast.error('Erreur lors de la sauvegarde de l\'objectif');
    }
  };

  const handleContribute = async (data) => {
    try {
      await goalApi.contributeToGoal(selectedGoal.id, data);
      toast.success('Contribution enregistrée !');
      setIsContributeOpen(false);
      fetchGoals();
    } catch {
      toast.error('Erreur lors de l\'enregistrement de la contribution');
    }
  };

  const handleDelete = async () => {
    if (!goalToDelete) return;
    try {
      await goalApi.deleteGoal(goalToDelete.id);
      toast.success('Objectif supprimé !');
      fetchGoals();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre supérieure */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Suivi des Objectifs d'Épargne</h2>
        <Button onClick={handleOpenAdd}><Plus size={16} /> Nouvel objectif</Button>
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
                  <h3 className="text-xl font-bold text-gray-900">{g.name}</h3>
                  {g.description && <p className="text-sm text-gray-500 mt-1">{g.description}</p>}
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
                  <span className="text-gray-400">Objectif : {formatCurrency(g.targetAmount)} ({formatPercent(g.progressPercent)})</span>
                </div>
                <ProgressBar value={g.progressPercent} color="bg-[#2E5FA3]" />
              </div>

              {/* Détails supplémentaires */}
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>Date cible : {g.targetDate ? formatDate(g.targetDate) : 'Aucune'}</span>
                </div>
                <div>
                  <span>Mode : {FUNDING_MODES[g.fundingMode]}</span>
                </div>
                {g.monthlyRecommended && (
                  <div className="col-span-2 text-[#2E5FA3] font-medium mt-1">
                    Épargne recommandée : {formatCurrency(g.monthlyRecommended)} / mois
                  </div>
                )}
              </div>

              {/* Actions de l'objectif */}
              {!g.isCompleted && (
                <div className="flex gap-2">
                  <Button variant="outline" className="w-full" onClick={() => handleOpenContribute(g)}>
                    <PiggyBank size={16} /> Contribuer
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Aucun objectif" message="Fixez-vous un but (Ex. fonds d'urgence, vacances) pour orienter votre épargne." />
      )}

      {/* Modal d'ajout / modification d'objectif */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Créer un objectif d'épargne">
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <Input label="Nom de l'objectif" {...register('name', { required: 'Nom obligatoire' })} error={errors.name?.message} />
          <Input label="Description (optionnel)" {...register('description')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Montant cible" type="number" step="0.01" {...register('targetAmount', { required: 'Montant obligatoire', min: { value: 0.01, message: 'Doit être supérieur à 0' } })} error={errors.targetAmount?.message} />
            <Input label="Date cible" type="date" {...register('targetDate')} />
          </div>
          <Select label="Mode de financement" options={Object.entries(FUNDING_MODES).map(([k, v]) => ({ value: k, label: v }))} {...register('fundingMode')} />

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Annuler</Button>
            <Button type="submit">Sauvegarder</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de contribution */}
      <Modal isOpen={isContributeOpen} onClose={() => setIsContributeOpen(false)} title={`Contribuer à "${selectedGoal?.name}"`}>
        <form onSubmit={handleContribSubmit(handleContribute)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Montant" type="number" step="0.01" {...registerContrib('amount', { required: 'Montant obligatoire', min: { value: 0.01, message: 'Doit être supérieur à 0' } })} error={contribErrors.amount?.message} />
            <Input label="Date de contribution" type="date" {...registerContrib('contributionDate')} />
          </div>
          <Input label="Notes" {...registerContrib('notes')} />

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsContributeOpen(false)}>Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </Modal>

      {/* Dialogue de suppression */}
      <ConfirmDialog isOpen={!!goalToDelete} onClose={() => setGoalToDelete(null)} onConfirm={handleDelete} message={`Voulez-vous vraiment supprimer l'objectif "${goalToDelete?.name}" ?`} />
    </div>
  );
}
