import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as txApi from '../../api/transaction.api';
import * as catApi from '../../api/category.api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TRANSACTION_TYPES, EXPENSE_TYPES, INCOME_TYPES, SCOPES, FREQUENCIES } from '../../utils/constants';
import toast from 'react-hot-toast';
import { Plus, Filter, Upload, FileText, Edit, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

export default function TransactionsPage() {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Modals & Dialogs
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState(null);
  const [editingTx, setEditingTx] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const txType = watch('type');

  useEffect(() => {
    fetchTransactions();
    catApi.getCategories().then(res => setCategories(res.data));
  }, [page, search, typeFilter, catFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await txApi.getTransactions({
        page,
        size: 10,
        search: search || undefined,
        type: typeFilter || undefined,
        categoryId: catFilter || undefined
      });
      setTransactions(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error(t('Erreur de chargement des transactions'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingTx(null);
    reset({
      title: '', amount: '', type: 'EXPENSE', transactionDate: new Date().toISOString().split('T')[0],
      categoryId: '', scope: 'PERSONAL', isRecurring: false, autoProcess: false,
      frequency: 'MONTHLY', recurrenceDay: '', notes: ''
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (tx) => {
    setEditingTx(tx);
    reset({
      title: tx.title, amount: tx.amount, type: tx.type,
      transactionDate: tx.transactionDate, categoryId: tx.categoryId || '',
      expenseType: tx.expenseType || 'NORMAL', incomeType: tx.incomeType || 'SALARY',
      scope: tx.scope || 'PERSONAL', isRecurring: tx.isRecurring,
      autoProcess: tx.autoProcess || false,
      frequency: tx.frequency || 'MONTHLY', recurrenceDay: tx.recurrenceDay || '', notes: tx.notes || ''
    });
    setIsAddOpen(true);
  };

  const handleSave = async (data) => {
    try {
      if (editingTx) {
        await txApi.updateTransaction(editingTx.id, data);
        toast.success(t('Transaction modifiée !'));
      } else {
        await txApi.createTransaction(data);
        toast.success(t('Transaction ajoutée !'));
      }
      setIsAddOpen(false);
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || t('Erreur lors de la sauvegarde'));
    }
  };

  const handleDelete = async () => {
    if (!txToDelete) return;
    try {
      await txApi.deleteTransaction(txToDelete.id);
      toast.success(t('Transaction supprimée !'));
      fetchTransactions();
    } catch {
      toast.error(t('Erreur lors de la suppression'));
    }
  };

  const handleImportCsv = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/csv/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`${res.data.imported} ${t('transactions importées avec succès !')}`);
      setIsImportOpen(false);
      fetchTransactions();
    } catch {
      toast.error(t('Erreur de traitement du fichier CSV'));
    }
  };

  const columns = [
    { key: 'title', label: t('Titre'), render: (row) => (
      <div>
        <p className="font-semibold text-white">{row.title}</p>
        {row.notes && <p className="text-xs text-slate-300 mt-0.5">{row.notes}</p>}
      </div>
    )},
    { key: 'amount', label: t('Montant'), render: (row) => {
      const isIncome = row.type === 'INCOME';
      return (
        <span className={`font-bold ${isIncome ? 'text-emerald-600' : 'text-red-500'}`}>
          {isIncome ? '+' : '-'} {formatCurrency(row.amount)}
        </span>
      );
    }},
    { key: 'categoryName', label: t('Catégorie'), render: (row) => (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${row.categoryColor}15`, color: row.categoryColor || '#6B7280' }}>
        {t(row.categoryName) || t('Autre')}
      </span>
    )},
    { key: 'transactionDate', label: t('Date'), render: (row) => formatDate(row.transactionDate) },
    { key: 'actions', label: t('Actions'), render: (row) => (
        <div className="flex gap-2 justify-end" onClick={e => e.stopPropagation()}>
        <button onClick={() => handleOpenEdit(row)} className="p-1 text-slate-300 hover:text-primary-light rounded-lg hover:bg-white/5 transition-colors">
          <Edit size={16} />
        </button>
        <button onClick={() => setTxToDelete(row)} className="p-1 text-slate-300 hover:text-red-500 rounded-lg hover:bg-white/5 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      {/* Barre de contrôle supérieure */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Input placeholder={t("Rechercher...")} value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-64" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field w-auto">
            <option value="">{t("Tous les types")}</option>
            {Object.entries(TRANSACTION_TYPES).map(([k, v]) => <option key={k} value={k}>{t(v)}</option>)}
          </select>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="input-field w-auto">
            <option value="">{t("Toutes les catégories")}</option>
            {categories.map(c => <option key={c.id} value={c.id}>{t(c.name)}</option>)}
          </select>
        </div>
          <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setIsImportOpen(true)} className="flex-1 sm:flex-none">
            <Upload size={16} /> {t('CSV')}
          </Button>
          <Button onClick={handleOpenAdd} className="flex-1 sm:flex-none">
            <Plus size={16} /> {t('Ajouter')}
          </Button>
        </div>
      </div>

      {/* Tableau des transactions */}
      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="py-24"><LoadingSpinner /></div>
        ) : transactions.length > 0 ? (
          <>
            <Table columns={columns} data={transactions} />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        ) : (
          <EmptyState title={t("Aucune transaction")} message={t("Commencez par ajouter des entrées ou des dépenses.")} />
        )}
      </Card>

      {/* Modal d'ajout / modification */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title={editingTx ? t('Modifier la transaction') : t('Nouvelle transaction')}>
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <Input label={t("Titre")} {...register('title', { required: t('Titre obligatoire') })} error={errors.title?.message} />
          <div className="grid grid-cols-2 gap-3">
            <Input label={t("Montant")} type="number" step="0.01" {...register('amount', { required: t('Montant obligatoire'), min: { value: 0.01, message: t('Doit être supérieur à 0') } })} error={errors.amount?.message} />
            <Input label={t("Date")} type="date" {...register('transactionDate', { required: t('Date obligatoire') })} error={errors.transactionDate?.message} />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Select label={t("Type")} options={Object.entries(TRANSACTION_TYPES).map(([k, v]) => ({ value: k, label: t(v) }))} {...register('type')} />
            <Select label={t("Catégorie")} options={categories.filter(c => c.transactionType === txType).map(c => ({ value: c.id, label: t(c.name) }))} placeholder={t("Choisir la catégorie")} {...register('categoryId')} />
          </div>

          {txType === 'EXPENSE' && (
            <Select label={t("Type de dépense")} options={Object.entries(EXPENSE_TYPES).map(([k, v]) => ({ value: k, label: t(v) }))} {...register('expenseType')} />
          )}

          {txType === 'INCOME' && (
            <Select label={t("Type de revenu")} options={Object.entries(INCOME_TYPES).map(([k, v]) => ({ value: k, label: t(v) }))} {...register('incomeType')} />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Select label={t("Portée")} options={Object.entries(SCOPES).map(([k, v]) => ({ value: k, label: t(v) }))} {...register('scope')} />
            <div className="space-y-3">
              <div className="flex items-center gap-2 pt-8">
                <input type="checkbox" id="isRecurring" {...register('isRecurring')} className="rounded border-gray-300 text-primary focus:ring-primary" />
                <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">{t('Récurrent')}</label>
              </div>
              {watch('isRecurring') && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="autoProcess" {...register('autoProcess')} className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <label htmlFor="autoProcess" className="text-sm font-medium text-gray-700">{t('Traiter automatiquement à la date')}</label>
                </div>
              )}
            </div>
          </div>

          {watch('isRecurring') && (
            <div className="grid grid-cols-2 gap-3">
              <Select
                label={t("Fréquence")}
                options={Object.entries(FREQUENCIES).map(([k, v]) => ({ value: k, label: t(v) }))}
                {...register('frequency', { required: t('Fréquence obligatoire') })}
                error={errors.frequency?.message}
              />
              <Input label={t("Jour de récurrence (1-28)")} type="number" {...register('recurrenceDay', { min: 1, max: 28 })} />
            </div>
          )}

          <Input label={t("Notes")} {...register('notes')} />

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>{t('Annuler')}</Button>
            <Button type="submit">{editingTx ? t('Enregistrer') : t('Ajouter')}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal d'import CSV */}
      <Modal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} title={t("Importer des transactions via CSV")} size="sm">
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-500">
            {t("Téléchargez un fichier CSV contenant les colonnes suivantes dans l'ordre :")}
            <br /><strong>{t('Titre')}, {t('Montant')}, {t('Type')} (EXPENSE/INCOME/SAVING), {t('Catégorie')}, {t('Date')} (AAAA-MM-JJ), {t('Notes')}, {t('Récurrent')} (true/false)</strong>
          </p>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-primary/50 transition-colors relative">
            <input type="file" accept=".csv" onChange={handleImportCsv} className="absolute inset-0 opacity-0 cursor-pointer" />
            <Upload size={32} className="text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">{t("Cliquez pour choisir un fichier ou déposez-le ici")}</p>
          </div>
          <Button variant="outline" onClick={() => setIsImportOpen(false)} className="w-full">{t('Annuler')}</Button>
        </div>
      </Modal>

      {/* Boîte de dialogue de confirmation de suppression */}
      <ConfirmDialog isOpen={!!txToDelete} onClose={() => setTxToDelete(null)} onConfirm={handleDelete} message={`${t('Voulez-vous vraiment supprimer la transaction')} "${txToDelete?.title}" ?`} />
    </div>
  );
}
