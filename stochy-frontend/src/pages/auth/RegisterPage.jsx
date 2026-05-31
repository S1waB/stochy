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

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { login } = useAuth();
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
      toast.success('Compte créé avec succès !');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription.');
    } finally { setLoading(false); }
  };

  const toOptions = (obj) => Object.entries(obj).map(([value, label]) => ({ value, label }));

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Inscription</h2>
      <div className="flex gap-2 mb-6">{[1, 2, 3].map(s => <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-[#2E5FA3]' : 'bg-gray-200'}`} />)}</div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {step === 1 && <>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prénom" {...register('firstName', { required: 'Obligatoire' })} error={errors.firstName?.message} />
            <Input label="Nom" {...register('lastName', { required: 'Obligatoire' })} error={errors.lastName?.message} />
          </div>
          <Input label="Email" type="email" {...register('email', { required: 'Obligatoire', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' } })} error={errors.email?.message} />
          <Input label="Mot de passe" type="password" {...register('password', { required: 'Obligatoire', minLength: { value: 8, message: 'Min. 8 caractères' } })} error={errors.password?.message} />
          <Input label="Confirmer le mot de passe" type="password" {...register('confirmPassword', { validate: v => v === watch('password') || 'Les mots de passe ne correspondent pas' })} error={errors.confirmPassword?.message} />
        </>}
        {step === 2 && <>
          <Input label="Téléphone" {...register('phone')} />
          <Input label="Date de naissance" type="date" {...register('birthDate')} />
          <Select label="Genre" options={toOptions(GENDERS)} placeholder="Sélectionner" {...register('gender')} />
          <Select label="Statut professionnel" options={toOptions(PROFESSIONAL_STATUSES)} placeholder="Sélectionner" {...register('professionalStatus')} />
          <Select label="Situation familiale" options={toOptions(MARITAL_STATUSES)} placeholder="Sélectionner" {...register('maritalStatus')} />
        </>}
        {step === 3 && <>
          <p className="text-sm text-gray-500 mb-2">Adresse (optionnel)</p>
          <Input label="Pays" {...register('country')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Région" {...register('region')} />
            <Input label="Municipalité" {...register('municipality')} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Rue" className="col-span-2" {...register('street')} />
            <Input label="N°" {...register('houseNumber')} />
          </div>
        </>}

        <div className="flex gap-3">
          {step > 1 && <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="flex-1"><ArrowLeft size={16} />Retour</Button>}
          <Button type="submit" disabled={loading} className="flex-1">
            {step < 3 ? <><ArrowRight size={16} />Suivant</> : loading ? 'Inscription...' : <><UserPlus size={16} />S'inscrire</>}
          </Button>
        </div>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">Déjà un compte ? <Link to="/login" className="text-[#2E5FA3] font-medium hover:underline">Se connecter</Link></p>
    </div>
  );
}
