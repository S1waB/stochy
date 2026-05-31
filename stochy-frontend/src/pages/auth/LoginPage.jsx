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
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Connexion</h2>
      <p className="text-sm text-gray-500 mb-6">Accédez à votre espace STOCHY</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" placeholder="votre@email.com" {...register('email', { required: 'Email obligatoire' })} error={errors.email?.message} />
        <Input label="Mot de passe" type="password" placeholder="••••••••" {...register('password', { required: 'Mot de passe obligatoire' })} error={errors.password?.message} />
        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Connexion...' : <><LogIn size={18} />Se connecter</>}</Button>
      </form>
      <div className="mt-6 text-center text-sm space-y-2">
        <Link to="/forgot-password" className="text-[#2E5FA3] hover:underline block">Mot de passe oublié ?</Link>
        <p className="text-gray-500">Pas de compte ? <Link to="/register" className="text-[#2E5FA3] font-medium hover:underline">Créer un compte</Link></p>
      </div>
    </div>
  );
}
