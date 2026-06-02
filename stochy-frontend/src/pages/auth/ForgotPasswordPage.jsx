import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import * as authApi from '../../api/auth.api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
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
    <div className="glass-panel relative p-6 lg:p-8 text-center">
      <div className="absolute -right-10 top-10 h-20 w-20 rounded-full bg-[#4ade80]/20 blur-2xl" />
      <div className="relative z-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-lg"><Mail size={32} /></div>
        <h2 className="text-3xl font-bold text-white mb-2">Email envoyé !</h2>
        <p className="text-sm text-slate-400 mb-6">Vérifiez votre boîte de réception pour le lien de réinitialisation.</p>
        <Link to="/login" className="text-sky-300 font-medium hover:text-sky-200 text-sm">Retour à la connexion</Link>
      </div>
    </div>
  );

  return (
    <div className="glass-panel relative p-6 lg:p-8">
      <div className="absolute -left-10 top-10 h-20 w-20 rounded-full bg-[#60a5fa]/20 blur-2xl" />
      <div className="relative z-10 space-y-5">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Mot de passe oublié</h2>
          <p className="text-sm text-slate-400">Entrez votre email pour recevoir un lien de réinitialisation</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" {...register('email', { required: 'Email obligatoire' })} error={errors.email?.message} />
          <Button type="submit" disabled={loading} className="w-full">{loading ? 'Envoi...' : 'Envoyer le lien'}</Button>
        </form>
        <p className="text-center text-sm text-slate-400"><Link to="/login" className="text-sky-300 font-medium hover:text-sky-200">Retour à la connexion</Link></p>
      </div>
    </div>
  );
}
