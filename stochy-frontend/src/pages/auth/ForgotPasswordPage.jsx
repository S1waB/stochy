import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import * as authApi from '../../api/auth.api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Mail } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
      toast.success('Si cet email existe, un lien a été envoyé.');
    } catch { toast.error('Erreur lors de l\'envoi.'); }
    finally { setLoading(false); }
  };

  if (sent) return (
    <div className="p-6 md:p-8 flex flex-col justify-between h-full min-h-[580px] text-center">
      <div className="absolute -right-10 top-10 h-20 w-20 rounded-full bg-[#4ade80]/20 blur-2xl" />
      <div className="relative z-10 my-auto">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-lg"><Mail size={32} /></div>
        <h2 className="text-3xl font-bold text-[var(--text-color)] mb-2">{t('Email envoyé !')}</h2>
        <p className="text-sm text-[var(--text-color)]/60 mb-6">{t('Vérifiez votre boîte de réception pour le lien de réinitialisation.')}</p>
        <Link to="/login" className="text-brand-light font-medium hover:underline text-sm">{t('Retour à la connexion')}</Link>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 flex flex-col justify-between h-full min-h-[580px] text-left">
      <div className="absolute -left-10 top-10 h-20 w-20 rounded-full bg-[#60a5fa]/20 blur-2xl" />
      <div className="relative z-10 space-y-5 my-auto">
        <div>
          <h2 className="text-3xl font-bold text-[var(--text-color)] mb-2">{t('Mot de passe oublié')}</h2>
          <p className="text-sm text-[var(--text-color)]/60">{t('Entrez votre email pour recevoir un lien de réinitialisation')}</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" {...register('email', { required: t('Email obligatoire') })} error={errors.email?.message} />
          <Button type="submit" disabled={loading} className="w-full mt-2">{loading ? t('Envoi...') : t('Envoyer le lien')}</Button>
        </form>
        <p className="text-center text-sm text-[var(--text-color)]/70"><Link to="/login" className="text-brand-light font-semibold hover:underline">{t('Retour à la connexion')}</Link></p>
      </div>
    </div>
  );
}
