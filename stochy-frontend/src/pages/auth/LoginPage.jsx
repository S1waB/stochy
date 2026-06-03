import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as authApi from '../../api/auth.api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LoginPage() {
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
    <div className="p-6 md:p-8 flex flex-col justify-between h-full min-h-[580px] text-left">
      <div className="space-y-6 my-auto">
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
          <Link to="/forgot-password" className="text-brand-light hover:underline">{t('Mot de passe oublié ?')}</Link>
          <p>{t('Pas de compte ?')} <Link to="/register" className="text-brand-light font-semibold hover:underline">{t('Créer un compte')}</Link></p>
        </div>
      </div>
    </div>
  );
}
