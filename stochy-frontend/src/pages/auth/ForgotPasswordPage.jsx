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
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><Mail size={32} className="text-emerald-600" /></div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Email envoyé !</h2>
      <p className="text-sm text-gray-500 mb-6">Vérifiez votre boîte de réception pour le lien de réinitialisation.</p>
      <Link to="/login" className="text-[#2E5FA3] font-medium hover:underline text-sm">Retour à la connexion</Link>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Mot de passe oublié</h2>
      <p className="text-sm text-gray-500 mb-6">Entrez votre email pour recevoir un lien de réinitialisation</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" {...register('email', { required: 'Email obligatoire' })} error={errors.email?.message} />
        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Envoi...' : 'Envoyer le lien'}</Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500"><Link to="/login" className="text-[#2E5FA3] font-medium hover:underline">Retour à la connexion</Link></p>
    </div>
  );
}
