import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as authApi from '../../api/auth.api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      const { accessToken, user: userData } = res.data;
      login(accessToken, userData);
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally { setLoading(false); }
  };

  return (
    <div className="glass-panel relative p-6 lg:p-8">
      <div className="absolute -right-10 top-8 h-24 w-24 rounded-full bg-[#2e5fa3]/20 blur-2xl" />
      <div className="absolute left-8 top-6 h-20 w-20 rounded-full bg-[#facc15]/20 blur-2xl" />
      <div className="relative space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="STOCHY" className="h-12 w-12 rounded-2xl object-cover border border-white/10 bg-slate-900" onError={(e)=>{e.currentTarget.style.display='none'}} />
            <div>
              <h1 className="text-3xl font-bold text-white">STOCHY</h1>
              <p className="text-sm text-slate-300">Gestion intelligente de votre portefeuille</p>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-white">Connexion</h2>
            <p className="text-sm text-slate-400">Accédez à votre espace STOCHY</p>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" placeholder="votre@email.com" {...register('email', { required: 'Email obligatoire' })} error={errors.email?.message} />
          <Input label="Mot de passe" type="password" placeholder="••••••••" {...register('password', { required: 'Mot de passe obligatoire' })} error={errors.password?.message} />
          <Button type="submit" disabled={loading} className="w-full">{loading ? 'Connexion...' : <><LogIn size={18} />Se connecter</>}</Button>
        </form>
        <div className="flex flex-col gap-3 text-center text-sm text-slate-400">
          <Link to="/forgot-password" className="text-sky-300 hover:text-sky-200">Mot de passe oublié ?</Link>
          <p>Pas de compte ? <Link to="/register" className="text-sky-300 font-medium hover:text-sky-200">Créer un compte</Link></p>
        </div>
      </div>
    </div>
  );
}
