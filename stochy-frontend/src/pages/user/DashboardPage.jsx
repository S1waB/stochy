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
    { label: 'Revenus', value: summary.totalIncome, icon: TrendingUp, color: 'text-emerald-300', bg: 'bg-emerald-500/10' },
    { label: 'Dépenses', value: summary.totalExpenses, icon: TrendingDown, color: 'text-rose-300', bg: 'bg-rose-500/10' },
    { label: 'Épargne', value: summary.totalSaving, icon: PiggyBank, color: 'text-sky-300', bg: 'bg-sky-500/10' },
    { label: 'Solde net', value: summary.netBalance, icon: Wallet, color: summary.netBalance >= 0 ? 'text-emerald-300' : 'text-rose-300', bg: summary.netBalance >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10' },
  ];

  return (
    <div className="space-y-6">
      <section className="hero-card overflow-hidden">
        <div className="absolute -right-12 top-8 h-48 w-48 rounded-full bg-brand-light/20 blur-3xl" />
        <div className="absolute left-8 bottom-8 h-36 w-36 rounded-full bg-accent/20 blur-3xl" />
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] items-center">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Tableau de bord</p>
            <h1 className="text-4xl font-bold leading-tight text-white">Maîtrisez vos finances avec des indicateurs clairs et un design inspiré.</h1>
            <p className="max-w-2xl text-slate-300">Visualisez vos revenus, dépenses, budgets et objectifs dans un environnement sombre, moderne et fluide.</p>
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary">Voir mes statistiques</button>
              <button className="btn-secondary">Explorer les objectifs</button>
            </div>
          </div>
          <div className="grid gap-4">
            <Card className="bg-white/5 border-white/10 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Solde actuel</p>
              <p className="mt-4 text-3xl font-semibold text-white">{formatCurrency(summary.netBalance)}</p>
              <p className="mt-2 text-sm text-slate-300">Solde global disponible ce mois.</p>
            </Card>
            <Card className="bg-white/5 border-white/10 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Revenus mensuels</p>
              <p className="mt-4 text-3xl font-semibold text-white">{formatCurrency(summary.totalIncome)}</p>
              <p className="mt-2 text-sm text-slate-300">Voir l'évolution de vos revenus récents.</p>
            </Card>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Vue rapide</h2>
          <p className="text-sm text-slate-400">Sélectionnez la période pour mettre à jour vos analyses.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={month} onChange={e => setMonth(+e.target.value)} className="input-field w-auto">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'][i]}</option>
            ))}
          </select>
          <select value={year} onChange={e => setYear(+e.target.value)} className="input-field w-auto">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(c => (
          <Card key={c.label} className="flex items-center gap-4 bg-white/5 border-white/10">
            <div className={`flex h-14 w-14 items-center justify-center rounded-3xl ${c.bg}`}>
              <c.icon size={24} className={c.color} />
            </div>
            <div>
              <p className="text-sm text-slate-300">{c.label}</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(c.value)}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-white mb-4">Revenus vs Dépenses (6 derniers mois)</h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(incomeVsExpensesLast6Months || []).map(d => ({ ...d, month: formatMonth(d.month) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: '#02070f', borderColor: 'rgba(255,255,255,0.08)', color: '#fff' }} />
                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                <Bar dataKey="income" name="Revenus" fill="#22C55E" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" name="Dépenses" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-white mb-4">Dépenses par catégorie</h3>
          <div className="h-[320px]">
            {expensesByCategory?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    dataKey="amount"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={45}
                    label={({ categoryName, percentage }) => `${categoryName} (${Math.round(percentage)}%)`}
                  >
                    {expensesByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: '#02070f', borderColor: 'rgba(255,255,255,0.08)', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-400 text-center py-24">Aucune dépense enregistrée pour cette période.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-white mb-4">État des budgets</h3>
          {budgetStatus?.length > 0 ? (
            <div className="space-y-4">
              {budgetStatus.map(b => (
                <div key={b.budget?.id || b.categoryName} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-200">{b.categoryName}</span>
                    <span className="text-slate-400">{formatCurrency(b.spentAmount)} / {formatCurrency(b.budgetedAmount)}</span>
                  </div>
                  <ProgressBar value={b.usagePercent} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">Aucun budget défini pour cette période.</p>
          )}
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-white mb-4">Objectifs d'épargne actifs</h3>
          {goalsProgress?.length > 0 ? (
            <div className="space-y-4">
              {goalsProgress.map(g => (
                <div key={g.goalName} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-200">{g.goalName}</span>
                    <span className="text-slate-400">{formatPercent(g.progressPercent)}</span>
                  </div>
                  <ProgressBar value={g.progressPercent} color="bg-[#2E5FA3]" />
                  <p className="text-xs text-slate-500 mt-1">{formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">Aucun objectif d'épargne actif.</p>
          )}
        </Card>
      </div>

      {activeAlerts?.length > 0 && (
        <Card className="border-amber-200/30 bg-amber-500/10">
          <h3 className="text-sm font-semibold text-amber-200 mb-3 flex items-center gap-2">
            <AlertCircle size={16} /> Alertes actives
          </h3>
          <div className="divide-y divide-white/10">
            {activeAlerts.map((a, i) => (
              <div key={i} className="py-2.5 first:pt-0 last:pb-0">
                <p className="text-sm font-medium text-white">{a.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{a.message}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
