import { useState, useEffect } from 'react';
import * as forecastApi from '../../api/forecast.api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, Sparkles, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

export default function ForecastPage() {
  const { t } = useLanguage();
  const [forecast, setForecast] = useState(null);
  const [months, setMonths] = useState(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    forecastApi.getForecast(months)
      .then(res => setForecast(res.data))
      .catch(() => toast.error(t('Erreur lors du calcul des prévisions')))
      .finally(() => setLoading(false));
  }, [months, t]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!forecast) return null;

  const chartData = forecast.forecastMonths.map((m, idx) => ({
    name: m.month,
    [t('Solde projeté')]: m.projectedBalance
  }));

  return (
    <div className="space-y-6">
      {/* Sélecteur de mois de prévision */}
      <div className="flex justify-between items-center glass-panel p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white">{t('Prévisions Financières Prédictives')}</h2>
          <p className="text-xs text-slate-300">{t('Simulation de trésorerie sur la base de vos revenus et dépenses récurrents.')}</p>
        </div>
        <select value={months} onChange={e => setMonths(+e.target.value)} className="input-field w-auto">
          {[3, 6, 12, 24].map(m => <option key={m} value={m}>{t('Prochains')} {m} {t('mois')}</option>)}
        </select>
      </div>

      {/* Graphique de projection de trésorerie */}
      <Card>
        <h3 className="text-sm font-semibold text-slate-200 mb-6">{t('Évolution prévisionnelle de la trésorerie')}</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Line type="monotone" dataKey={t('Solde projeté')} stroke="#2E5FA3" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Suggestions de l'IA Stochy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conseils de l'IA */}
        <Card className="border-blue-100 bg-blue-50/20">
          <h3 className="text-sm font-bold text-primary flex items-center gap-2 mb-4">
            <Sparkles size={16} /> {t('Conseils et optimisations intelligents')}
          </h3>
          {forecast.suggestions?.length > 0 ? (
            <ul className="space-y-3">
              {forecast.suggestions.map((s, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-gray-600">
                  <span className="text-[#2E5FA3] font-bold">•</span>
                  <span>{t(s)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">{t('Aucune alerte ou conseil pour le moment. Votre situation financière semble saine et stable !')}</p>
          )}
        </Card>

        {/* Alertes de déficit potentiel */}
        <Card className="border-red-100 bg-red-50/20">
          <h3 className="text-sm font-bold text-red-700 flex items-center gap-2 mb-4">
            <AlertTriangle size={16} /> {t('Déficits ou anomalies de trésorerie détectés')}
          </h3>
          {forecast.forecastMonths.some(m => m.isDeficit) ? (
            <div className="space-y-3">
              {forecast.forecastMonths.filter(m => m.isDeficit).map((m, idx) => (
                <div key={idx} className="flex gap-2.5 text-sm text-red-700 bg-red-50 p-2.5 rounded-lg">
                  <span className="font-semibold">{m.month} :</span>
                  <span>{t('Solde négatif projeté à')} {formatCurrency(m.projectedBalance)} !</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-emerald-700 font-medium">{t('Aucun déficit de trésorerie n\'est à prévoir sur cette période.')}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
