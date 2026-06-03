import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../common/Logo';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import * as authApi from '../../api/auth.api';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { GENDERS, PROFESSIONAL_STATUSES, MARITAL_STATUSES } from '../../utils/constants';
import { Link } from 'react-router-dom';
import {
  Sun, Moon, Sparkles, LayoutDashboard, PieChart, Target,
  TrendingUp, Star, Mail, Phone, MapPin, Send,
  LogIn, UserPlus, ArrowLeft, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Embedded Login Panel ────────────────────────────────────────── */
function LoginPanel({ onFlip }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      const { accessToken, user: userData } = res.data;
      login(accessToken, userData);
      toast.success(t('Connexion réussie !'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || t('Email ou mot de passe incorrect.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 flex flex-col justify-center h-full min-h-[560px] text-left space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-[var(--text-color)]">{t('Connexion')}</h2>
        <p className="text-sm text-[var(--text-color)]/60">{t('Accédez à votre espace STOCHY')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="votre@email.com"
          {...register('email', { required: t('Email obligatoire') })}
          error={errors.email?.message}
        />
        <Input
          label={t('Mot de passe')}
          type="password"
          placeholder="••••••••"
          {...register('password', { required: t('Mot de passe obligatoire') })}
          error={errors.password?.message}
        />
        <Button type="submit" disabled={loading} className="w-full mt-2">
          {loading ? t('Connexion...') : <><LogIn size={18} />{t('Se connecter')}</>}
        </Button>
      </form>

      <div className="flex flex-col gap-3 text-center text-sm text-[var(--text-color)]/70 pt-2">
        <Link to="/forgot-password" className="text-brand-light hover:underline">
          {t('Mot de passe oublié ?')}
        </Link>
        <p>
          {t('Pas de compte ?')}{' '}
          <button
            type="button"
            onClick={onFlip}
            className="text-brand-light font-semibold hover:underline focus:outline-none"
          >
            {t('Créer un compte')}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ─── Embedded Register Panel ─────────────────────────────────────── */
function RegisterPanel({ onFlip }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    if (step < 3) { setStep(step + 1); return; }
    setLoading(true);
    try {
      const payload = {
        firstName: data.firstName, lastName: data.lastName,
        email: data.email, password: data.password,
        phone: data.phone, gender: data.gender, birthDate: data.birthDate,
        professionalStatus: data.professionalStatus, maritalStatus: data.maritalStatus,
        address: { country: data.country, region: data.region, municipality: data.municipality, street: data.street, houseNumber: data.houseNumber }
      };
      const res = await authApi.register(payload);
      login(res.data.accessToken, res.data.user);
      toast.success(t('Compte créé avec succès !'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || t("Erreur lors de l'inscription."));
    } finally {
      setLoading(false);
    }
  };

  const toOptions = (obj) => Object.entries(obj).map(([value, label]) => ({ value, label: t(label) }));

  return (
    <div className="p-6 md:p-8 flex flex-col justify-center h-full min-h-[560px] text-left space-y-5">
      <div className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-[var(--text-color)]">{t('Créer un compte')}</h2>
          <p className="text-sm text-[var(--text-color)]/60">{t('Commencez à gérer votre argent intelligemment')}</p>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <span key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-brand-light' : 'bg-[var(--surface-border)]'}`} />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
        {step === 1 && (
          <>
            <div className="grid gap-3 grid-cols-2">
              <Input label={t('Prénom')} {...register('firstName', { required: t('Obligatoire') })} error={errors.firstName?.message} />
              <Input label={t('Nom')} {...register('lastName', { required: t('Obligatoire') })} error={errors.lastName?.message} />
            </div>
            <Input label="Email" type="email" placeholder="nom@exemple.com" {...register('email', { required: t('Obligatoire'), pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('Email invalide') } })} error={errors.email?.message} />
            <Input label={t('Mot de passe')} type="password" placeholder="••••••••" {...register('password', { required: t('Obligatoire'), minLength: { value: 8, message: t('Min. 8 caractères') } })} error={errors.password?.message} />
            <Input label={t('Confirmer le mot de passe')} type="password" placeholder="••••••••" {...register('confirmPassword', { validate: v => v === watch('password') || t('Les mots de passe ne correspondent pas') })} error={errors.confirmPassword?.message} />
          </>
        )}
        {step === 2 && (
          <>
            <Input label={t('Téléphone')} {...register('phone')} />
            <Input label={t('Date de naissance')} type="date" {...register('birthDate')} />
            <Select label={t('Genre')} options={toOptions(GENDERS)} placeholder={t('Sélectionner')} {...register('gender')} />
            <Select label={t('Situation professionnelle')} options={toOptions(PROFESSIONAL_STATUSES)} placeholder={t('Sélectionner')} {...register('professionalStatus')} />
            <Select label={t('Situation familiale')} options={toOptions(MARITAL_STATUSES)} placeholder={t('Sélectionner')} {...register('maritalStatus')} />
          </>
        )}
        {step === 3 && (
          <>
            <p className="text-xs font-semibold text-[var(--text-color)]/70 uppercase tracking-wider mb-2">{t('Adresse')} ({t('optionnel')})</p>
            <Input label={t('Pays')} {...register('country')} />
            <div className="grid gap-3 grid-cols-2">
              <Input label={t('Région / Gouvernorat')} {...register('region')} />
              <Input label={t('Délégation / Municipalité')} {...register('municipality')} />
            </div>
            <div className="grid gap-3 grid-cols-3">
              <Input label={t('Rue')} className="col-span-2" {...register('street')} />
              <Input label={t('Numéro')} {...register('houseNumber')} />
            </div>
          </>
        )}

        <div className="flex gap-3 pt-3">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
              <ArrowLeft size={16} />{t('Retour')}
            </Button>
          )}
          <Button type="submit" disabled={loading} className="flex-1">
            {step < 3 ? <><ArrowRight size={16} />{t('Suivant')}</> : loading ? t('Inscription...') : <><UserPlus size={16} />{t("S'inscrire")}</>}
          </Button>
        </div>
      </form>

      <p className="text-center text-sm text-[var(--text-color)]/70">
        {t('Déjà un compte ?')}{' '}
        <button
          type="button"
          onClick={onFlip}
          className="text-brand-light font-semibold hover:underline focus:outline-none"
        >
          {t('Se connecter')}
        </button>
      </p>
    </div>
  );
}

/* ─── Main AuthLayout ─────────────────────────────────────────────── */
export default function AuthLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { lang, setLanguage, t } = useLanguage();

  // Derive flip state from URL — /register = flipped
  const isRegister = location.pathname === '/register';

  const flipToRegister = () => navigate('/register');
  const flipToLogin = () => navigate('/login');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      toast.error(t('Veuillez remplir tous les champs.'));
      return;
    }
    setSending(true);
    setTimeout(() => {
      toast.success(t('Message envoyé avec succès !'));
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setSending(false);
    }, 1000);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--page-bg)] text-[var(--text-color)] scroll-smooth transition-colors duration-300">
      {/* Decorative Blobs */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#071828]/40 via-[#0d2f57]/20 to-[#193e70]/10 pointer-events-none" />
      <div className="absolute -left-24 top-20 h-96 w-96 rounded-full bg-[#2e5fa3]/10 blur-3xl animate-blob" />
      <div className="absolute right-0 top-60 h-96 w-96 rounded-full bg-[#facc15]/10 blur-3xl animate-blob animation-delay-2000" />

      {/* Floating coins */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-[8%] top-[25%] h-14 w-14 rounded-full bg-[#fcd34d]/60 shadow-[0_0_100px_rgba(252,211,77,0.3)] animate-coin-spin" />
        <div className="absolute right-[12%] top-[35%] h-12 w-12 rounded-full bg-[#34d399]/70 shadow-[0_0_80px_rgba(52,211,153,0.25)] animate-coin-float animation-delay-500" />
        <div className="absolute left-[5%] bottom-[45%] h-16 w-16 rounded-full bg-[#f472b6]/50 shadow-[0_0_110px_rgba(244,114,182,0.25)] animate-coin-float animation-delay-1200" />
        <div className="absolute right-[8%] bottom-[20%] h-10 w-10 rounded-full bg-[#60a5fa]/60 shadow-[0_0_70px_rgba(96,165,250,0.35)] animate-coin-spin animation-delay-800" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--surface-border)] bg-[var(--surface-bg)]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--surface-bg)] border border-[var(--surface-border)] p-2 shadow-sm">
            <Logo size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--text-color)]">STOCHY</span>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--text-color)]/80">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[var(--text-color)] transition-colors">{t('Accueil')}</button>
            <button onClick={() => scrollToSection('services')} className="hover:text-[var(--text-color)] transition-colors">{t('Services')}</button>
            <button onClick={() => scrollToSection('reviews')} className="hover:text-[var(--text-color)] transition-colors">{t('Avis')}</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-[var(--text-color)] transition-colors">{t('Contact')}</button>
          </nav>

          <div className="h-4 w-[1px] bg-[var(--surface-border)] hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-xl bg-[var(--surface-muted)] p-0.5 border border-[var(--surface-border)]">
              <button onClick={() => setLanguage('en')} className={`rounded-lg px-2 py-1 text-xs font-bold transition-all ${lang === 'en' ? 'bg-[var(--surface-bg)] text-[var(--text-color)] shadow-sm' : 'text-[var(--text-color)]/60 hover:text-[var(--text-color)]'}`}>EN</button>
              <button onClick={() => setLanguage('fr')} className={`rounded-lg px-2 py-1 text-xs font-bold transition-all ${lang === 'fr' ? 'bg-[var(--surface-bg)] text-[var(--text-color)] shadow-sm' : 'text-[var(--text-color)]/60 hover:text-[var(--text-color)]'}`}>FR</button>
            </div>
            <button onClick={toggle} className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-bg)] p-2 text-[var(--text-color)] transition hover:bg-[var(--surface-muted)] shadow-sm">
              {theme === 'dark' ? <Sun size={18} className="text-yellow-300 animate-pulse" /> : <Moon size={18} className="text-[var(--text-color)]" />}
            </button>
          </div>
        </div>
      </header>

      {/* Page Sections */}
      <div className="relative z-10 flex flex-col items-center">

        {/* HOME (HERO) SECTION */}
        <section id="home" className="w-full max-w-7xl px-6 py-12 md:py-20 grid gap-12 lg:grid-cols-[1.1fr_1fr] items-center min-h-[calc(100vh-73px)]">
          <div className="space-y-8 flex flex-col justify-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-light/10 text-brand-light text-xs font-semibold uppercase tracking-wider border border-brand-light/20">
                <Sparkles size={14} /> {t('Gestion intelligente de votre argent')}
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.15] bg-gradient-to-r from-[var(--text-color)] via-[var(--text-color)] to-brand-light bg-clip-text text-transparent">
                STOCHY
              </h1>
              <p className="text-lg md:text-xl text-[var(--text-color)]/80 max-w-lg font-normal leading-relaxed">
                {t('Prenez le contrôle de votre situation financière en toute simplicité.')}
              </p>
            </div>

            {/* Wallet mockup */}
            <div className="rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-bg)]/40 p-6 backdrop-blur-sm space-y-4 max-w-md shadow-lg transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--surface-border)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffb703] text-xl font-extrabold text-slate-950 shadow-md">S</div>
                <div>
                  <h4 className="font-bold text-[var(--text-color)]">STOCHY Wallet</h4>
                  <p className="text-xs text-[var(--text-color)]/60">{t('Gestion intelligente de votre portefeuille')}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[var(--surface-bg)]/80 p-4 border border-[var(--surface-border)] shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-color)]/60">{t('Portefeuille')}</p>
                  <p className="text-xl font-bold mt-1">12 420 €</p>
                </div>
                <div className="rounded-2xl bg-[var(--surface-bg)]/80 p-4 border border-[var(--surface-border)] shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-color)]/60">{t('Transactions')}</p>
                  <p className="text-xl font-bold mt-1 text-emerald-500">+ 8 {t('ce mois')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── 3D Flip Card ── */}
          <div className="flex justify-center items-start w-full max-w-md mx-auto">
            <div className="flip-card-container w-full" style={{ minHeight: '560px' }}>
              <div className={`flip-card-inner${isRegister ? ' flip-card-flipped' : ''}`} style={{ minHeight: '560px' }}>

                {/* FRONT — Login */}
                <div className="flip-card-front">
                  <div className="h-full w-full rounded-[2rem] border border-[var(--surface-border)] bg-[var(--surface-bg)]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                    <LoginPanel onFlip={flipToRegister} />
                  </div>
                </div>

                {/* BACK — Register */}
                <div className="flip-card-back">
                  <div className="h-full w-full rounded-[2rem] border border-[var(--surface-border)] bg-[var(--surface-bg)]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                    <RegisterPanel onFlip={flipToLogin} />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section id="services" className="w-full max-w-7xl px-6 py-20 border-t border-[var(--surface-border)]">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t('Nos Services')}</h2>
            <p className="text-base text-[var(--text-color)]/70">{t('Découvrez les fonctionnalités puissantes de STOCHY')}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="glass-card flex flex-col items-start gap-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20"><LayoutDashboard size={24} /></div>
              <h3 className="text-lg font-bold">{t('Tableau de Bord Holistique')}</h3>
              <p className="text-sm text-[var(--text-color)]/70 leading-relaxed">{t("Une vue d'ensemble claire de vos soldes, transactions et analyses graphiques interactives.")}</p>
            </div>

            <div className="glass-card flex flex-col items-start gap-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20"><PieChart size={24} /></div>
              <h3 className="text-lg font-bold">{t('Budgets Précis')}</h3>
              <p className="text-sm text-[var(--text-color)]/70 leading-relaxed">{t('Fixez des limites par catégorie pour maîtriser vos dépenses et éviter les mauvaises surprises.')}</p>
            </div>

            <div className="glass-card flex flex-col items-start gap-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20"><Target size={24} /></div>
              <h3 className="text-lg font-bold">{t('Objectifs Stimulants')}</h3>
              <p className="text-sm text-[var(--text-color)]/70 leading-relaxed">{t('Visualisez vos progrès vers vos projets et économisez de manière ciblée et méthodique.')}</p>
            </div>

            <div className="glass-card flex flex-col items-start gap-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
              <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl border border-purple-500/20"><TrendingUp size={24} /></div>
              <h3 className="text-lg font-bold">{t('Prévisions Futuristes')}</h3>
              <p className="text-sm text-[var(--text-color)]/70 leading-relaxed">{t('Simulez votre trésorerie future grâce à nos algorithmes prédictifs basés sur vos récurrences.')}</p>
            </div>
          </div>
        </section>

        {/* REVIEWS SECTION */}
        <section id="reviews" className="w-full max-w-7xl px-6 py-20 border-t border-[var(--surface-border)] bg-[var(--surface-muted)]/20">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t('Ce que disent nos utilisateurs')}</h2>
            <p className="text-base text-[var(--text-color)]/70">{t('Des milliers de personnes font confiance à STOCHY pour gérer leur argent au quotidien.')}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { initials: 'AS', name: 'Amine Siala', role: 'Entrepreneur', color: 'blue', text: "Grâce à STOCHY, j'ai pu identifier des dépenses superflues et augmenter mon taux d'épargne de 15% dès le premier mois. Les prévisions de trésorerie sont incroyablement précises !" },
              { initials: 'SB', name: 'Sarah B.', role: 'Freelance', color: 'emerald', text: "Le mode sombre et le design général sont magnifiques. L'application est fluide et m'aide à piloter mon budget familial et mes objectifs sans aucun stress." },
              { initials: 'MA', name: 'Mehdi Ben Amor', role: 'Ingénieur', color: 'purple', text: "Le suivi de mes prêts et le remboursement de mes dettes n'ont jamais été aussi clairs. Une interface moderne et des fonctionnalités très bien pensées." },
            ].map(({ initials, name, role, color, text }) => (
              <div key={name} className="glass-card flex flex-col justify-between gap-6 hover:shadow-lg transition-shadow">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-sm text-[var(--text-color)]/80 italic leading-relaxed">"{text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[var(--surface-border)]">
                  <div className={`h-10 w-10 rounded-full bg-${color}-500/10 text-${color}-500 font-bold flex items-center justify-center border border-${color}-500/20`}>{initials}</div>
                  <div>
                    <h4 className="text-sm font-bold">{name}</h4>
                    <p className="text-xs text-[var(--text-color)]/60">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="w-full max-w-7xl px-6 py-20 border-t border-[var(--surface-border)]">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t('Contactez-nous')}</h2>
            <p className="text-base text-[var(--text-color)]/70">{t('Une question ou une suggestion ? Notre équipe est là pour vous aider.')}</p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-8 flex flex-col justify-center">
              <div className="glass-card space-y-6">
                {[
                  { icon: <Mail size={20} />, label: 'Email', value: 'contact@stochy.com' },
                  { icon: <Phone size={20} />, label: 'Téléphone', value: '+216 71 000 000' },
                  { icon: <MapPin size={20} />, label: 'Adresse', value: 'Tunis, Tunisie' },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="p-3 bg-brand-light/10 text-brand-light rounded-xl border border-brand-light/20">{icon}</div>
                    <div>
                      <h4 className="font-bold text-sm">{label}</h4>
                      <p className="text-sm text-[var(--text-color)]/70 mt-1">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('Votre nom')}</label>
                  <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} className="input-field" placeholder="John Doe" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="input-field" placeholder="john@example.com" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('Votre message')}</label>
                  <textarea rows={4} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} className="input-field resize-none" placeholder={t('Comment pouvons-nous vous aider ?')} required />
                </div>
                <button type="submit" disabled={sending} className="w-full btn-primary flex items-center justify-center gap-2">
                  {sending ? t('Envoi...') : <><Send size={16} />{t('Envoyer le message')}</>}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full py-8 border-t border-[var(--surface-border)] bg-[var(--surface-muted)]/20 text-center text-xs text-[var(--text-color)]/60">
          <p>© 2026 STOCHY. {t('Tous droits réservés.')}</p>
        </footer>

      </div>
    </div>
  );
}
