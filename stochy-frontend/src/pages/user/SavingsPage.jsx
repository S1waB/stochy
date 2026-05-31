import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as savingApi from '../../api/saving.api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatCurrency } from '../../utils/formatters';
import { SAVING_MODES, FREQUENCIES, INCOME_TYPES } from '../../utils/constants';
import toast from 'react-hot-toast';
import { Plus, PiggyBank, Wallet, Target, ToggleLeft, ToggleRight, Trash2, Edit } from 'lucide-react';

export default function SavingsPage() {
  const [configs, setConfigs] = useState([]);
  const [balance, setBalance] = useState({ totalSaved: 0, allocatedToGoals: 0, freeBalance: 0 });
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState(null);
  const [editingConfig, setEditingConfig] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const savingMode = watch('mode');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [configsRes, balanceRes] = await Promise.all([
        savingApi.getSavingConfigs(),
        savingApi.getSavingsBalance()
      ]);
      setConfigs(configsRes.data);
      setBalance(balanceRes.data);
    } catch {
      toast.error('Erreur lors du chargement des données d\'épargne');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingConfig(null);
    reset({
      mode: 'PERCENTAGE', percentage: '', fixedAmount: '',
      frequency: 'MONTHLY', recurrenceDay: '', applyToAllIncomes: true,
      specificIncomeTypes: []
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (config) => {
    setEditingConfig(config);
    reset({
      mode: config.mode,
      percentage: config.percentage || '',
      fixedAmount: config.fixedAmount || '',
      frequency: config.frequency || 'MONTHLY',
      recurrenceDay: config.recurrenceDay || '',
      applyToAllIncomes: config.applyToAllIncomes,
      specificIncomeTypes: config.specificIncomeTypes || []
    });
    setIsAddOpen(true);
  };

  const handleSave = async (data) => {
    try {
      if (editingConfig) {
        await savingApi.updateSavingConfig(editingConfig.id, data);
        toast.success('Configuration modifiée !');
      } else {
        await savingApi.createSavingConfig(data);
        toast.success('Configuration créée !');
      }
      setIsAddOpen(false);
      fetchData();
    } catch {
      toast.error('Erreur lors de la sauvegarde de la configuration');
    }
  };

  const handleToggle = async (config) => {
    try {
      await savingApi.toggleSavingConfig(config.id);
      toast.success(config.isActive ? 'Règle désactivée !' : 'Règle activée !');
      fetchData();
    } catch {
      toast.error('Erreur de bascule de statut');
    }
  };

  const handleDelete = async () => {
    if (!configToDelete) return;
    try {
      await savingApi.deleteSavingConfig(configToDelete.id);
      toast.success('Configuration d\'épargne supprimée !');
      fetchData();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6">
      {/* Résumé des soldes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 border-l-4 border-l-[#2E5FA3]">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2E5FA3]">
            <PiggyBank size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Épargne totale</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(balance.totalSaved)}</p>
          </div>
        </Card>
        
        <Card className="flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Target size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Alloué aux objectifs</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(balance.allocatedToGoals)}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Solde libre d'utilisation</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(balance.freeBalance)}</p>
          </div>
        </Card>
      </div>

      {/* Titre & Bouton d'ajout */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Règles d'épargne automatique</h2>
        <Button onClick={handleOpenAdd}><Plus size={16} /> Ajouter une règle</Button>
      </div>

      {/* Règles existantes */}
      {loading ? (
        <Card className="py-12 flex justify-center"><LoadingSpinner /></Card>
      ) : configs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {configs.map(c => (
            <Card key={c.id} className={`border-t-4 ${c.isActive ? 'border-t-[#2E5FA3]' : 'border-t-gray-300'} space-y-4`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2E5FA3]/10 text-[#2E5FA3] mb-2">
                    {SAVING_MODES[c.mode]}
                  </span>
                  <p className="text-xl font-extrabold text-gray-900">
                    {c.mode === 'PERCENTAGE' ? `${c.percentage}% des revenus` : `${formatCurrency(c.fixedAmount)}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {c.mode === 'PERCENTAGE' 
                      ? (c.applyToAllIncomes ? 'Appliqué à tous les revenus' : `Sur : ${c.specificIncomeTypes.join(', ')}`)
                      : `Fréquence : ${FREQUENCIES[c.frequency]}`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleToggle(c)} className={`p-1.5 rounded-lg transition-colors ${c.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                    {c.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                  <button onClick={() => handleOpenEdit(c)} className="p-1.5 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => setConfigToDelete(c)} className="p-1.5 text-gray-500 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Aucune règle configurée" message="Configurez une règle d'épargne automatique pour économiser dès la réception d'un revenu." />
      )}

      {/* Modal d'ajout / modification */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Configurer une règle d'épargne">
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <Select label="Mode d'épargne" options={Object.entries(SAVING_MODES).map(([k, v]) => ({ value: k, label: v }))} {...register('mode')} />
          
          {savingMode === 'PERCENTAGE' && (
            <>
              <Input label="Pourcentage (%)" type="number" step="0.1" {...register('percentage', { required: 'Pourcentage obligatoire', min: 0.1, max: 100 })} error={errors.percentage?.message} />
              
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="applyToAllIncomes" {...register('applyToAllIncomes')} className="rounded border-gray-300 text-primary" />
                  <label htmlFor="applyToAllIncomes" className="text-sm font-medium text-gray-700">Appliquer à tous les revenus</label>
                </div>
                
                {!watch('applyToAllIncomes') && (
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Revenus ciblés :</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(INCOME_TYPES).map(([k, v]) => (
                        <div key={k} className="flex items-center gap-2">
                          <input type="checkbox" id={`inc_${k}`} value={k} {...register('specificIncomeTypes')} className="rounded border-gray-300 text-primary" />
                          <label htmlFor={`inc_${k}`} className="text-xs text-gray-600">{v}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {savingMode === 'FIXED' && (
            <>
              <Input label="Montant fixe" type="number" step="0.01" {...register('fixedAmount', { required: 'Montant obligatoire', min: 0.01 })} error={errors.fixedAmount?.message} />
              <div className="grid grid-cols-2 gap-3">
                <Select label="Fréquence" options={Object.entries(FREQUENCIES).map(([k, v]) => ({ value: k, label: v }))} {...register('frequency')} />
                <Input label="Jour de récurrence" type="number" {...register('recurrenceDay', { min: 1, max: 28 })} />
              </div>
            </>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Annuler</Button>
            <Button type="submit">Sauvegarder</Button>
          </div>
        </form>
      </Modal>

      {/* Confirm deletion */}
      <ConfirmDialog isOpen={!!configToDelete} onClose={() => setConfigToDelete(null)} onConfirm={handleDelete} message="Voulez-vous vraiment supprimer cette règle d'épargne ?" />
    </div>
  );
}
