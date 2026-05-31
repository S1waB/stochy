import { useState, useEffect } from 'react';
import * as dashboardApi from '../../api/dashboard.api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProgressBar from '../../components/common/ProgressBar';
import { formatCurrency, formatPercent, formatMonth } from '../../utils/formatters';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#2E5FA3', '#F0A500', '#22C55E', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1', '#14B8A6', '#F43F5E'];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    setLoading(true);
    dashboardApi.getDashboard(month, year)
      .then(res => setData(res.data))
      .catch(() => toast.error('Erreur lors du chargement du tableau de bord'))
      .finally(() => setLoading(false));
  }, [month, year]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!data) return null;

  const { summary, expensesByCategory, budgetStatus, goalsProgress, incomeVsExpensesLast6Months, activeAlerts } = data;
  
  const summaryCards = [
    { label: 'Revenus', value: summary.totalIncome, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Dépenses', value: summary.totalExpenses, icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Épargne', value: summary.totalSaving, icon: PiggyBank, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Solde net', value: summary.netBalance, icon: Wallet, color: summary.netBalance >= 0 ? 'text-emerald-600' : 'text-red-500', bg: summary.netBalance >= 0 ? 'bg-emerald-50' : 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Sélecteur de période */}
      <div className="flex items-center justify-end gap-3">
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

      {/* Cartes récapitulatives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(c => (
          <Card key={c.label} className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center`}>
              <c.icon size={24} className={c.color} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(c.value)}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenus vs Dépenses */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenus vs Dépenses (6 derniers mois)</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(incomeVsExpensesLast6Months || []).map(d => ({ ...d, month: formatMonth(d.month) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="income" name="Revenus" fill="#22C55E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Dépenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Dépenses par Catégorie */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Dépenses par catégorie</h3>
          <div className="h-[280px]">
            {expensesByCategory?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    dataKey="amount"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    label={({ categoryName, percentage }) => `${categoryName} (${Math.round(percentage)}%)`}
                  >
                    {expensesByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400 text-center py-24">Aucune dépense enregistrée pour cette période.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Budgets & Objectifs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budgets */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">État des budgets</h3>
          {budgetStatus?.length > 0 ? (
            <div className="space-y-4">
              {budgetStatus.map(b => (
                <div key={b.budget?.id || b.categoryName} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{b.categoryName}</span>
                    <span className="text-gray-500">
                      {formatCurrency(b.spentAmount)} / {formatCurrency(b.budgetedAmount)}
                    </span>
                  </div>
                  <ProgressBar value={b.usagePercent} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Aucun budget défini pour cette période.</p>
          )}
        </Card>

        {/* Objectifs d'épargne */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Objectifs d'épargne actifs</h3>
          {goalsProgress?.length > 0 ? (
            <div className="space-y-4">
              {goalsProgress.map(g => (
                <div key={g.goalName} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{g.goalName}</span>
                    <span className="text-gray-500">{formatPercent(g.progressPercent)}</span>
                  </div>
                  <ProgressBar value={g.progressPercent} color="bg-[#2E5FA3]" />
                  <p className="text-xs text-gray-400 mt-1">
                    {formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Aucun objectif d'épargne actif.</p>
          )}
        </Card>
      </div>

      {/* Alertes */}
      {activeAlerts?.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <h3 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
            <AlertCircle size={16} /> Alertes actives
          </h3>
          <div className="divide-y divide-amber-100">
            {activeAlerts.map((a, i) => (
              <div key={i} className="py-2.5 first:pt-0 last:pb-0">
                <p className="text-sm font-medium text-gray-800">{a.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{a.message}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
