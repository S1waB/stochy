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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F2847] via-[#1A3C6E] to-[#2E5FA3] p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-8 py-8 text-center bg-gradient-to-r from-[#214a7a] to-[#2e5fa3]">
          <div className="flex items-center justify-center">
            <img src="/logo.png" alt="STOCHY" className="w-14 h-14 rounded-md object-cover mr-3" onError={(e)=>{e.currentTarget.style.display='none'}} />
            <div>
              <h1 className="text-2xl font-bold text-white">STOCHY</h1>
              <p className="text-sm text-blue-100">Gestion intelligente de votre portefeuille</p>
            </div>
          </div>
        </div>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Connexion</h2>
          <p className="text-sm text-gray-500 dark:text-gray-300 mb-6">Accédez à votre espace STOCHY</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Email" type="email" placeholder="votre@email.com" {...register('email', { required: 'Email obligatoire' })} error={errors.email?.message} />
            <Input label="Mot de passe" type="password" placeholder="••••••••" {...register('password', { required: 'Mot de passe obligatoire' })} error={errors.password?.message} />
            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Connexion...' : <><LogIn size={18} />Se connecter</>}</Button>
          </form>
          <div className="mt-6 text-center text-sm space-y-2">
            <Link to="/forgot-password" className="text-[#2E5FA3] hover:underline block">Mot de passe oublié ?</Link>
            <p className="text-gray-500 dark:text-gray-300">Pas de compte ? <Link to="/register" className="text-[#2E5FA3] font-medium hover:underline">Créer un compte</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
