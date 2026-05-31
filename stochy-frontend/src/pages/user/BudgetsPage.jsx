import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as budgetApi from '../../api/budget.api';
import * as catApi from '../../api/category.api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { Plus, Copy, Trash2, Edit } from 'lucide-react';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date states
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCopyOpen, setIsCopyOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: registerCopy, handleSubmit: handleSubmitCopy } = useForm();

  useEffect(() => {
    fetchBudgets();
    catApi.getCategories('EXPENSE').then(res => setCategories(res.data));
  }, [month, year]);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await budgetApi.getBudgetStatus(month, year);
      setBudgets(res.data);
    } catch {
      toast.error('Erreur de chargement des budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = (b = null) => {
    reset({
      categoryId: b?.budget?.categoryId || '',
      amount: b?.budgetedAmount || '',
      alertThresholdPct: b?.budget?.alertThresholdPct || 80,
      month,
      year
    });
    setIsAddOpen(true);
  };

  const handleSave = async (data) => {
    try {
      await budgetApi.createBudget(data);
      toast.success('Budget configuré avec succès !');
      setIsAddOpen(false);
      fetchBudgets();
    } catch {
      toast.error('Erreur lors de la configuration du budget');
    }
  };

  const handleDuplicate = async (data) => {
    try {
      await budgetApi.duplicateBudgets({
        sourceMonth: +data.sourceMonth,
        sourceYear: +data.sourceYear,
        targetMonth: month,
        targetYear: year
      });
      toast.success('Budgets dupliqués avec succès !');
      setIsCopyOpen(false);
      fetchBudgets();
    } catch {
      toast.error('Erreur lors de la duplication des budgets');
    }
  };

  const handleDelete = async () => {
    if (!budgetToDelete) return;
    try {
      await budgetApi.deleteBudget(budgetToDelete.id);
      toast.success('Budget supprimé !');
      fetchBudgets();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre de contrôle supérieure */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <select value={month} onChange={e => setMonth(+e.target.value)} className="input-field w-auto">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'][i]}
              </option>
            ))}
          </select>
          <select value={year} onChange={e => setYear(+e.target.value)} className="input-field w-auto">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setIsCopyOpen(true)} className="flex-1 sm:flex-none">
            <Copy size={16} /> Dupliquer
          </Button>
          <Button onClick={() => handleOpenAdd()} className="flex-1 sm:flex-none">
            <Plus size={16} /> Définir un budget
          </Button>
        </div>
      </div>

      {/* Liste des budgets */}
      {loading ? (
        <Card className="py-24 flex justify-center"><LoadingSpinner /></Card>
      ) : budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(b => {
            const isExceeded = b.spentAmount > b.budgetedAmount;
            return (
              <Card key={b.budget?.id || b.categoryName} className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{b.categoryName}</h3>
                    <p className="text-sm text-gray-400">
                      Limite : <span className="font-semibold text-gray-700">{formatCurrency(b.budgetedAmount)}</span>
                    </p>
                  </div>
                  <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleOpenAdd(b)} className="p-1.5 text-gray-500 hover:text-[#2E5FA3] hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => setBudgetToDelete(b.budget)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Dépensé :</span>
                    <span className={`font-semibold ${isExceeded ? 'text-red-500' : 'text-emerald-600'}`}>
                      {formatCurrency(b.spentAmount)} ({formatPercent(b.usagePercent)})
                    </span>
                  </div>
                  <ProgressBar value={b.usagePercent} />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Restant : {formatCurrency(b.remainingAmount)}</span>
                    <span>Alerte à {b.budget?.alertThresholdPct || 80}%</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Aucun budget défini" message="Prenez le contrôle de vos finances en fixant des limites par catégorie." />
      )}

      {/* Modal d'ajout / modification */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Configurer un budget">
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <Select label="Catégorie" placeholder="Budget Global (Toutes catégories)" options={categories.map(c => ({ value: c.id, label: c.name }))} {...register('categoryId')} />
          <Input label="Montant limite" type="number" step="0.01" {...register('amount', { required: 'Montant obligatoire', min: { value: 0.01, message: 'Doit être supérieur à 0' } })} error={errors.amount?.message} />
          <Input label="Seuil d'alerte (%)" type="number" {...register('alertThresholdPct', { required: 'Seuil obligatoire', min: 1, max: 100 })} error={errors.alertThresholdPct?.message} />
          
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de duplication */}
      <Modal isOpen={isCopyOpen} onClose={() => setIsCopyOpen(false)} title="Dupliquer les budgets" size="sm">
        <form onSubmit={handleSubmitCopy(handleDuplicate)} className="space-y-4">
          <p className="text-sm text-gray-500">Copiez les budgets d'un mois précédent vers le mois en cours ({month}/{year}).</p>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Mois source" options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'][i] }))} defaultValue={month === 1 ? 12 : month - 1} {...registerCopy('sourceMonth')} />
            <Select label="Année source" options={[2024, 2025, 2026, 2027].map(y => ({ value: y, label: y }))} defaultValue={month === 1 ? year - 1 : year} {...registerCopy('sourceYear')} />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsCopyOpen(false)}>Annuler</Button>
            <Button type="submit">Dupliquer</Button>
          </div>
        </form>
      </Modal>

      {/* Dialogue de suppression */}
      <ConfirmDialog isOpen={!!budgetToDelete} onClose={() => setBudgetToDelete(null)} onConfirm={handleDelete} message="Voulez-vous vraiment supprimer ce budget ?" />
    </div>
  );
}
