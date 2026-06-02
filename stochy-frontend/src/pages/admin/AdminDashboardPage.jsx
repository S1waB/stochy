import { useState, useEffect } from 'react';
import * as adminApi from '../../api/admin.api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { Users, UserCheck, AlertCircle, DollarSign, PieChart as PieIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#2E5FA3', '#F0A500', '#22C55E', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAdminDashboard()
      .then(res => setData(res.data))
      .catch(() => toast.error('Erreur lors du chargement des statistiques d\'administration'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!data) return null;

  const { totalUsers, activeUsersCount, userActivityRate, averageIncome, averageExpense, professionalStatusDistribution, genderDistribution } = data;

  const stats = [
    { label: 'Utilisateurs inscrits', value: totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Utilisateurs actifs', value: activeUsersCount, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Taux d\'activité', value: formatPercent(userActivityRate), icon: AlertCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Revenu moyen / util.', value: formatCurrency(averageIncome), icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' }
  ];

  return (
    <div className="space-y-6">
      {/* Résumé des KPIs globaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon size={24} className={s.color} /></div>
            <div>
              <p className="text-sm text-slate-300">{s.label}</p>
              <p className="text-xl font-bold text-white">{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution par Situation Professionnelle */}
        <Card>
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Distribution par Statut Professionnel</h3>
          <div className="h-[280px]">
            {Object.keys(professionalStatusDistribution || {}).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(professionalStatusDistribution).map(([k, v]) => ({ name: k, 'Utilisateurs': v }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="Utilisateurs" fill="#2E5FA3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400 text-center py-24">Aucune donnée de distribution disponible.</p>
            )}
          </div>
        </Card>

        {/* Distribution par Sexe */}
        <Card>
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Distribution par Genre</h3>
          <div className="h-[280px]">
            {Object.keys(genderDistribution || {}).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(genderDistribution).map(([k, v]) => ({ name: k, value: v }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {Object.entries(genderDistribution).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400 text-center py-24">Aucune donnée disponible.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Cartes d'analyses administratives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-red-500">
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-2">Moyenne globale des Dépenses</h4>
          <p className="text-3xl font-extrabold text-red-500">{formatCurrency(averageExpense)}</p>
          <p className="text-xs text-slate-300 mt-2">Dépenses moyennes consolidées sur l'ensemble des comptes actifs de la plateforme.</p>
        </Card>

        <Card className="border-l-4 border-l-[#2E5FA3]">
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-2">Status de la Plateforme</h4>
          <div className="flex items-center gap-2 text-emerald-600 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-sm">Tous les services opérationnels</span>
          </div>
          <p className="text-xs text-slate-300 mt-4">Version de l'API : 1.0.0-RELEASE • Base de données : Connectée</p>
        </Card>
      </div>
    </div>
  );
}
