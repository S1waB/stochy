import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as adminApi from '../../api/admin.api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { PROFESSIONAL_STATUSES, GENDERS, MARITAL_STATUSES, TRANSACTION_TYPES, LOAN_TYPES, DEBT_STATUSES } from '../../utils/constants';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, User, Mail, Phone, Briefcase, Heart, Calendar, 
  TrendingUp, TrendingDown, DollarSign, PiggyBank, CreditCard, 
  MapPin, CheckCircle2, ShieldAlert
} from 'lucide-react';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [debts, setDebts] = useState([]);
  const [goals, setGoals] = useState([]);

  // Insights
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Parallel API fetching
      const [userRes, txRes, loansRes, debtsRes, goalsRes] = await Promise.all([
        adminApi.getAdminUser(id),
        adminApi.getUserTransactions(id, { page: 0, size: 50 }),
        adminApi.getUserLoans(id),
        adminApi.getUserDebts(id),
        adminApi.getUserSavingGoals(id)
      ]);

      setUser(userRes.data);
      
      const txs = txRes.data.content || [];
      setTransactions(txs);
      setLoans(loansRes.data || []);
      setDebts(debtsRes.data || []);
      setGoals(goalsRes.data || []);

      // Calculate simple insights
      let incomeSum = 0;
      let expenseSum = 0;
      let savingSum = 0;
      txs.forEach(t => {
        if (t.type === 'INCOME') incomeSum += t.amount;
        else if (t.type === 'EXPENSE') expenseSum += t.amount;
        else if (t.type === 'SAVING') savingSum += t.amount;
      });

      setTotalIncome(incomeSum);
      setTotalExpense(expenseSum);
      setTotalSavings(savingSum);

    } catch (err) {
      toast.error('Erreur lors du chargement des données de l\'utilisateur.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <EmptyState 
          title="Utilisateur introuvable" 
          message="L'utilisateur demandé n'existe pas ou vous n'avez pas les droits requis pour y accéder." 
          action={<Button onClick={() => navigate('/admin/users')}><ArrowLeft size={16} /> Retour à la liste</Button>}
        />
      </div>
    );
  }

  const currency = user.currency || 'TND';

  return (
    <div className="space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/users')}
            className="p-2.5 text-slate-300 hover:text-primary hover:bg-white/5 rounded-xl transition-all border border-white/10"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{user.firstName} {user.lastName}</h1>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.role === 'ROLE_ADMIN' ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'}`}>
                {user.role === 'ROLE_ADMIN' ? 'Admin' : 'Utilisateur'}
              </span>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-white/5 text-slate-300'}`}>
                {user.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <p className="text-slate-300 text-sm mt-0.5">Membre depuis le {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colonne de gauche : Informations personnelles */}
        <div className="space-y-6">
          <Card title="Détails du Profil" className="h-full">
            <div className="flex flex-col items-center pb-6 border-b border-white/10">
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary text-3xl font-bold uppercase mb-3 border-2 border-primary/20">
                {user.firstName[0]}{user.lastName[0]}
              </div>
                <h3 className="font-semibold text-lg text-white">{user.firstName} {user.lastName}</h3>
                <p className="text-slate-300 text-sm">{user.email}</p>
            </div>

            <div className="space-y-4 pt-6">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Briefcase size={16} className="text-gray-400" />
                <span className="font-medium text-gray-500 w-28">Profession :</span>
                <span className="text-white font-semibold">{PROFESSIONAL_STATUSES[user.professionalStatus] || 'Non spécifié'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <User size={16} className="text-gray-400" />
                <span className="font-medium text-slate-300 w-28">Genre :</span>
                <span className="text-white font-semibold">{GENDERS[user.gender] || 'Non spécifié'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Heart size={16} className="text-gray-400" />
                <span className="font-medium text-slate-300 w-28">Statut marital :</span>
                <span className="text-white font-semibold">{MARITAL_STATUSES[user.maritalStatus] || 'Non spécifié'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Phone size={16} className="text-gray-400" />
                <span className="font-medium text-slate-300 w-28">Téléphone :</span>
                <span className="text-white font-semibold">{user.phone || 'Non spécifié'}</span>
              </div>
              
              {user.address && (user.address.country || user.address.region || user.address.municipality) && (
                <div className="flex gap-3 text-sm text-gray-600 pt-2 border-t border-gray-50">
                  <MapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-500 mb-1">Adresse :</p>
                    <p className="text-gray-900 font-semibold">
                      {[user.address.houseNumber, user.address.street, user.address.municipality, user.address.region, user.address.country]
                        .filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Colonne de droite : Insights financiers et synthèses */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Cartes de synthèse financière */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="!p-5 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/10 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Revenus Cumulés</span>
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600"><TrendingUp size={18} /></div>
              </div>
              <h2 className="text-2xl font-bold text-emerald-700">{totalIncome.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {currency}</h2>
              <p className="text-emerald-600/80 text-xs mt-1">Calculés sur les transactions récentes</p>
            </Card>

            <Card className="!p-5 bg-gradient-to-br from-rose-500/5 to-rose-500/10 border-rose-500/10 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">Dépenses Cumulées</span>
                <div className="p-2 bg-rose-500/10 rounded-xl text-rose-600"><TrendingDown size={18} /></div>
              </div>
              <h2 className="text-2xl font-bold text-rose-700">{totalExpense.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {currency}</h2>
              <p className="text-rose-600/80 text-xs mt-1">Calculées sur les transactions récentes</p>
            </Card>

            <Card className="!p-5 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/10 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Épargne Récente</span>
                <div className="p-2 bg-primary/10 rounded-xl text-primary"><PiggyBank size={18} /></div>
              </div>
              <h2 className="text-2xl font-bold text-primary-dark">{totalSavings.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {currency}</h2>
              <p className="text-primary/80 text-xs mt-1">Totalisée sur l'historique d'épargne</p>
            </Card>
          </div>

          {/* Grille : Prêts & Dettes en cours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Prêts actifs */}
            <Card title="Prêts en cours" className="flex flex-col">
              {loans.length > 0 ? (
                <div className="space-y-4">
                  {loans.map(loan => (
                    <div key={loan.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{loan.lenderName}</p>
                          <p className="text-xs text-gray-400">{LOAN_TYPES[loan.loanType] || loan.loanType}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${loan.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                          {loan.isActive ? 'Actif' : 'Clôturé'}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progression du remboursement</span>
                          <span className="font-semibold text-gray-800">{Math.round(loan.progressPercent)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all" 
                            style={{ width: `${Math.min(loan.progressPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs pt-1 border-t border-gray-100 text-gray-500">
                        <span>Restant : <strong className="text-gray-900">{loan.remainingCapital} {currency}</strong></span>
                        <span>Mensualité : <strong className="text-gray-900">{loan.monthlyPayment} {currency}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">Aucun prêt en cours enregistré.</div>
              )}
            </Card>

            {/* Dettes actives */}
            <Card title="Dettes actives" className="flex flex-col">
              {debts.length > 0 ? (
                <div className="space-y-4">
                  {debts.map(debt => (
                    <div key={debt.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{debt.debtorName}</p>
                          <p className="text-xs text-gray-400">Prêté le {debt.loanDate ? new Date(debt.loanDate).toLocaleDateString('fr-FR') : '-'}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          debt.status === 'SETTLED' ? 'bg-emerald-50 text-emerald-600' :
                          debt.status === 'PARTIALLY_REPAID' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {DEBT_STATUSES[debt.status] || debt.status}
                        </span>
                      </div>

                      <div className="flex justify-between text-xs pt-1 border-t border-gray-100 text-gray-500">
                        <span>Montant initial : <strong className="text-gray-900">{debt.amountLent} {currency}</strong></span>
                        <span>Restant dû : <strong className="text-rose-600 font-bold">{debt.remainingAmount} {currency}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">Aucune dette en cours enregistrée.</div>
              )}
            </Card>

          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Objectifs d'Épargne */}
        <div className="lg:col-span-1">
          <Card title="Objectifs d'Épargne" className="h-full">
            {goals.length > 0 ? (
              <div className="space-y-4">
                {goals.map(goal => (
                  <div key={goal.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-900 text-sm">{goal.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${goal.isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                        {goal.isCompleted ? 'Complété' : 'En cours'}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progression</span>
                        <span className="font-semibold text-gray-800">{Math.round(goal.progressPercent)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all" 
                          style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-[11px] pt-1 text-gray-500">
                      <span>Cumulé : <strong className="text-gray-900">{goal.currentAmount} {currency}</strong></span>
                      <span>Cible : <strong className="text-gray-900">{goal.targetAmount} {currency}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 text-sm">Aucun objectif d'épargne configuré.</div>
            )}
          </Card>
        </div>

        {/* Transactions Récentes */}
        <div className="lg:col-span-2">
          <Card title="Transactions Récentes" className="h-full">
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-medium text-xs uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Titre</th>
                      <th className="pb-3 font-semibold">Type</th>
                      <th className="pb-3 font-semibold">Catégorie</th>
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 text-right font-semibold">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.slice(0, 10).map(t => (
                      <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 font-medium text-gray-900">{t.title}</td>
                        <td className="py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                            t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' :
                            t.type === 'EXPENSE' ? 'bg-rose-50 text-rose-600' : 'bg-primary/10 text-primary'
                          }`}>
                            {TRANSACTION_TYPES[t.type] || t.type}
                          </span>
                        </td>
                        <td className="py-3.5 text-gray-500">{t.categoryName || '-'}</td>
                        <td className="py-3.5 text-gray-400 text-xs">
                          {t.transactionDate ? new Date(t.transactionDate).toLocaleDateString('fr-FR') : '-'}
                        </td>
                        <td className={`py-3.5 text-right font-bold ${
                          t.type === 'INCOME' ? 'text-emerald-600' :
                          t.type === 'EXPENSE' ? 'text-rose-600' : 'text-primary'
                        }`}>
                          {t.type === 'EXPENSE' ? '-' : '+'}{t.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 text-sm">Aucune transaction récente à afficher.</div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
