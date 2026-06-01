import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as userApi from '../../api/user.api';
import * as authApi from '../../api/auth.api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { GENDERS, PROFESSIONAL_STATUSES, MARITAL_STATUSES, CURRENCIES } from '../../utils/constants';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { User, Lock, DollarSign, Camera } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const { register: registerProfile, handleSubmit: handleProfileSubmit, reset: resetProfile } = useForm();
  const { register: registerPass, handleSubmit: handlePassSubmit, reset: resetPass, watch } = useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await userApi.getProfile();
      setProfile(res.data);
      // Populate fields
      resetProfile({
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        phone: res.data.phone || '',
        birthDate: res.data.birthDate || '',
        gender: res.data.gender || 'UNSPECIFIED',
        professionalStatus: res.data.professionalStatus || 'EMPLOYED',
        maritalStatus: res.data.maritalStatus || 'SINGLE',
        currency: res.data.currency || 'TND',
        address: {
          country: res.data.address?.country || '',
          region: res.data.address?.region || '',
          municipality: res.data.address?.municipality || '',
          street: res.data.address?.street || '',
          houseNumber: res.data.address?.houseNumber || ''
        }
      });
    } catch {
      toast.error('Impossible de charger le profil.');
    } finally {
      setLoading(false);
    }
  };

  const onUpdateProfile = async (data) => {
    try {
      await userApi.updateProfile(data);
      await userApi.updateCurrency(data.currency);
      toast.success('Profil mis à jour !');
      fetchProfile();
    } catch {
      toast.error('Erreur lors de la mise à jour du profil.');
    }
  };

  const onChangePassword = async (data) => {
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Mot de passe changé avec succès !');
      resetPass({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du changement de mot de passe.');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setAvatarLoading(true);
    try {
      await userApi.uploadProfilePic(formData);
      toast.success('Photo de profil mise à jour !');
      fetchProfile();
    } catch {
      toast.error('Erreur lors du téléversement de l\'image.');
    } finally {
      setAvatarLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Colonne latérale (Photo de profil & Paramètres rapides) */}
      <div className="space-y-6">
        <Card className="flex flex-col items-center text-center p-8 relative">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full border-4 border-[#2E5FA3]/10 overflow-hidden bg-gray-100 flex items-center justify-center text-gray-300">
              {profile?.profilePicUrl ? (
                <img src={`http://localhost:8080${profile.profilePicUrl}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={48} />
              )}
            </div>
            <label className="absolute bottom-1 right-1 bg-[#2E5FA3] hover:bg-[#1A3C6E] text-white p-2 rounded-full cursor-pointer shadow-md transition-colors">
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <Camera size={14} />
            </label>
          </div>
          <h3 className="font-bold text-gray-900 text-lg mt-4">{profile?.firstName} {profile?.lastName}</h3>
          <p className="text-sm text-gray-500">{profile?.email}</p>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#2E5FA3]/10 text-[#2E5FA3] mt-3">
            {profile?.role === 'ROLE_ADMIN' ? 'Administrateur' : 'Utilisateur Premium'}
          </span>
        </Card>

        {/* Changer le mot de passe */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Lock size={16} /> Sécurité & Mot de passe
          </h3>
          <form onSubmit={handlePassSubmit(onChangePassword)} className="space-y-4">
            <Input label="Mot de passe actuel" type="password" {...registerPass('currentPassword', { required: true })} />
            <Input label="Nouveau mot de passe" type="password" {...registerPass('newPassword', { required: true, minLength: 8 })} />
            <Input label="Confirmer le nouveau mot de passe" type="password" {...registerPass('confirmNewPassword', { validate: v => v === watch('newPassword') || 'Les mots de passe ne correspondent pas' })} />
            <Button type="submit" className="w-full">Modifier le mot de passe</Button>
          </form>
        </Card>
      </div>

      {/* Formulaire complet de profil */}
      <div className="lg:col-span-2">
        <Card className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <User size={20} /> Informations personnelles & Préférences
          </h3>
          <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Prénom" {...registerProfile('firstName', { required: true })} />
              <Input label="Nom" {...registerProfile('lastName', { required: true })} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input label="Téléphone" {...registerProfile('phone')} />
              <Input label="Date de naissance" type="date" {...registerProfile('birthDate')} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Select label="Genre" options={Object.entries(GENDERS).map(([k, v]) => ({ value: k, label: v }))} {...registerProfile('gender')} />
              <Select label="Situation professionnelle" options={Object.entries(PROFESSIONAL_STATUSES).map(([k, v]) => ({ value: k, label: v }))} {...registerProfile('professionalStatus')} />
              <Select label="Situation familiale" options={Object.entries(MARITAL_STATUSES).map(([k, v]) => ({ value: k, label: v }))} {...registerProfile('maritalStatus')} />
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <DollarSign size={16} /> Devise par défaut
              </h4>
              <Select label="Choisir votre devise" options={CURRENCIES.map(c => ({ value: c, label: c }))} {...registerProfile('currency')} />
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-4">
              <h4 className="text-sm font-bold text-gray-800">Adresse</h4>
              <Input label="Pays" {...registerProfile('address.country')} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Région / Gouvernorat" {...registerProfile('address.region')} />
                <Input label="Délégation / Municipalité" {...registerProfile('address.municipality')} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Rue" className="col-span-2" {...registerProfile('address.street')} />
                <Input label="Numéro" {...registerProfile('address.houseNumber')} />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button type="submit">Enregistrer les modifications</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
