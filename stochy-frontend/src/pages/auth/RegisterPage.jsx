import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as authApi from '../../api/auth.api';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { GENDERS, PROFESSIONAL_STATUSES, MARITAL_STATUSES } from '../../utils/constants';
import { UserPlus, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function RegisterPage() {
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
        firstName: data.firstName, lastName: data.lastName, email: data.email, password: data.password,
        phone: data.phone, gender: data.gender, birthDate: data.birthDate,
        professionalStatus: data.professionalStatus, maritalStatus: data.maritalStatus,
        address: { country: data.country, region: data.region, municipality: data.municipality, street: data.street, houseNumber: data.houseNumber }
      };
      const res = await authApi.register(payload);
      login(res.data.accessToken, res.data.user);
      toast.success(t('Compte créé avec succès !'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || t('Erreur lors de l\'inscription.'));
    } finally { 
      setLoading(false); 
    }
  };

  const toOptions = (obj) => Object.entries(obj).map(([value, label]) => ({ value, label: t(label) }));

  return (
    <div className="p-6 md:p-8 flex flex-col justify-between h-full min-h-[580px] text-left">
      <div className="space-y-5 my-auto">
        <div className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-[var(--text-color)]">{t('Créer un compte')}</h2>
            <p className="text-sm text-[var(--text-color)]/60">{t('Commencez à gérer votre argent intelligemment')}</p>
          </div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[var(--text-color)]/40">
            {[1, 2, 3].map((s) => (
              <span key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-brand-light' : 'bg-[var(--surface-border)]'}`}></span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {step === 1 && (
            <>
              <div className="grid gap-3 grid-cols-2">
                <Input label={t('Prénom')} {...register('firstName', { required: t('Obligatoire') })} error={errors.firstName?.message} />
                <Input label={t('Nom')} {...register('lastName', { required: t('Obligatoire') })} error={errors.lastName?.message} />
              </div>
              <Input label="Email" type="email" placeholder="nom@exemple.com" {...register('email', { required: t('Obligatoire'), pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('Email invalide') } })} error={errors.email?.message} />
              <Input label={t('Mot de passe')} type="password" placeholder="••••••••" {...register('password', { required: t('Obligatoire'), minLength: { value: 8, message: t('Min. 8 caractères') } })} error={errors.password?.message} />
              <Input label={t('Confirmer le nouveau mot de passe')} type="password" placeholder="••••••••" {...register('confirmPassword', { validate: v => v === watch('password') || t('Les mots de passe ne correspondent pas') })} error={errors.confirmPassword?.message} />
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
            {step > 1 && <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="flex-1"><ArrowLeft size={16} />{t('Retour')}</Button>}
            <Button type="submit" disabled={loading} className="flex-1">
              {step < 3 ? <><ArrowRight size={16} />{t('Suivant')}</> : loading ? t('Inscription...') : <><UserPlus size={16} />{t("S'inscrire")}</>}
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-[var(--text-color)]/70">
          {t('Déjà un compte ?')}{' '}
          <Link to="/login" className="text-brand-light font-semibold hover:underline">
            {t('Se connecter')}
          </Link>
        </p>
      </div>
    </div>
  );
}
