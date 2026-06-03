import { useState, useEffect } from 'react';
import * as forecastApi from '../../api/forecast.api';
import * as aiApi from '../../api/ai.api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, Sparkles, AlertTriangle, Send, User as UserIcon, Bot } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

export default function ForecastPage() {
  const { t } = useLanguage();
  const [forecast, setForecast] = useState(null);
  const [months, setMonths] = useState(6);
  const [loading, setLoading] = useState(true);

  // Chat states
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: t("Bonjour ! Je suis l'IA de Stochy. Je peux analyser vos prêts et dettes passés pour vous conseiller (ex: quelle banque choisir, à qui prêter). Comment puis-je vous aider ?") }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  
  useEffect(() => {
    setLoading(true);
    forecastApi.getForecast(months)
      .then(res => setForecast(res.data))
      .catch(() => toast.error(t('Erreur lors du calcul des prévisions')))
      .finally(() => setLoading(false));
  }, [months, t]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { role: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);
    
    try {
      const res = await aiApi.sendChatMessage({ message: userMessage.text });
      setChatHistory(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
    } catch (err) {
      toast.error(t('Erreur de communication avec l\'IA'));
      setChatHistory(prev => [...prev, { role: 'assistant', text: t('Désolé, une erreur est survenue.') }]);
    } finally {
      setChatLoading(false);
    }
  };

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

      {/* Assistant IA Groq */}
      <Card className="border-brand-light/30 bg-surface-muted">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-[#2E5FA3]" /> {t('Assistant Financier IA (Groq)')}
        </h3>
        
        <div className="flex flex-col gap-4">
          {/* Chat History */}
          <div className="bg-surface-dark border border-surface-border rounded-xl p-4 h-[300px] overflow-y-auto flex flex-col gap-3">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[#2E5FA3] text-white' : 'bg-brand-light/20 text-brand-light'}`}>
                  {msg.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-[#2E5FA3] text-white rounded-tr-none' : 'bg-surface-muted text-slate-200 border border-surface-border rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="self-start flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-brand-light/20 text-brand-light flex items-center justify-center flex-shrink-0">
                  <Bot size={14} />
                </div>
                <div className="p-3 rounded-2xl text-sm bg-surface-muted text-slate-200 border border-surface-border rounded-tl-none flex items-center gap-2">
                  <LoadingSpinner size="sm" /> <span>{t('Analyse en cours...')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex gap-2">
            <input 
              type="text" 
              className="input-field flex-1" 
              placeholder={t('Posez votre question (ex: Quelle est la meilleure banque ?)')}
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !chatLoading && chatInput.trim()) handleSendMessage();
              }}
            />
            <button 
              className="bg-[#2E5FA3] hover:bg-[#1f4277] text-white px-4 rounded-2xl transition flex items-center justify-center disabled:opacity-50"
              onClick={handleSendMessage}
              disabled={chatLoading || !chatInput.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
