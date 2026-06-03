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
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { t } = useLanguage();
  const { updateUser } = useAuth();
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
      toast.error(t('Impossible de charger le profil.'));
    } finally {
      setLoading(false);
    }
  };

  const onUpdateProfile = async (data) => {
    try {
      await userApi.updateProfile(data);
      await userApi.updateCurrency(data.currency);
      toast.success(t('Profil mis à jour !'));
      updateUser({ firstName: data.firstName, lastName: data.lastName, currency: data.currency });
      fetchProfile();
    } catch {
      toast.error(t('Erreur lors de la mise à jour du profil.'));
    }
  };

  const onChangePassword = async (data) => {
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success(t('Mot de passe changé avec succès !'));
      resetPass({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || t('Erreur lors du changement de mot de passe.'));
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setAvatarLoading(true);
    try {
      const res = await userApi.uploadProfilePic(formData);
      toast.success(t('Photo de profil mise à jour !'));
      updateUser({ profilePicUrl: res.data.profilePicUrl });
      fetchProfile();
    } catch {
      toast.error(t('Erreur lors du téléversement de l\'image.'));
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
            <div className="w-28 h-28 rounded-full border-4 border-white/10 overflow-hidden bg-white/5 flex items-center justify-center text-slate-300">
              {profile?.profilePicUrl ? (
                <img src={`http://localhost:8080${profile.profilePicUrl}?t=${new Date().getTime()}`} alt={t("Photo de profil")} className="w-full h-full object-cover" />
              ) : (
                <User size={48} />
              )}
            </div>
            <label className="absolute bottom-1 right-1 bg-[#2E5FA3] hover:bg-[#1A3C6E] text-white p-2 rounded-full cursor-pointer shadow-md transition-colors">
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <Camera size={14} />
            </label>
          </div>
          <h3 className="font-bold text-white text-lg mt-4">{profile?.firstName} {profile?.lastName}</h3>
          <p className="text-sm text-slate-300">{profile?.email}</p>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-light/10 text-brand-light mt-3">
            {profile?.role === 'ROLE_ADMIN' ? t('Administrateur') : t('Utilisateur Premium')}
          </span>
        </Card>

        {/* Changer le mot de passe */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Lock size={16} /> {t('Sécurité & Mot de passe')}
          </h3>
          <form onSubmit={handlePassSubmit(onChangePassword)} className="space-y-4">
            <Input label={t("Mot de passe actuel")} type="password" {...registerPass('currentPassword', { required: true })} />
            <Input label={t("Nouveau mot de passe")} type="password" {...registerPass('newPassword', { required: true, minLength: 8 })} />
            <Input label={t("Confirmer le nouveau mot de passe")} type="password" {...registerPass('confirmNewPassword', { validate: v => v === watch('newPassword') || t('Les mots de passe ne correspondent pas') })} />
            <Button type="submit" className="w-full">{t('Modifier le mot de passe')}</Button>
          </form>
        </Card>
      </div>

      {/* Formulaire complet de profil */}
      <div className="lg:col-span-2">
        <Card className="space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
            <User size={20} /> {t('Informations personnelles & Préférences')}
          </h3>
          <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input label={t("Prénom")} {...registerProfile('firstName', { required: true })} />
              <Input label={t("Nom")} {...registerProfile('lastName', { required: true })} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input label={t("Téléphone")} {...registerProfile('phone')} />
              <Input label={t("Date de naissance")} type="date" {...registerProfile('birthDate')} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Select label={t("Genre")} options={Object.entries(GENDERS).map(([k, v]) => ({ value: k, label: t(v) }))} {...registerProfile('gender')} />
              <Select label={t("Situation professionnelle")} options={Object.entries(PROFESSIONAL_STATUSES).map(([k, v]) => ({ value: k, label: t(v) }))} {...registerProfile('professionalStatus')} />
              <Select label={t("Situation familiale")} options={Object.entries(MARITAL_STATUSES).map(([k, v]) => ({ value: k, label: t(v) }))} {...registerProfile('maritalStatus')} />
            </div>

            <div className="border-t border-white/10 pt-4">
              <h4 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
                <DollarSign size={16} /> {t('Devise par défaut')}
              </h4>
              <Select label={t("Choisir votre devise")} options={CURRENCIES.map(c => ({ value: c, label: c }))} {...registerProfile('currency')} />
            </div>

            <div className="border-t border-white/10 pt-4 space-y-4">
              <h4 className="text-sm font-bold text-slate-100">{t('Adresse')}</h4>
              <Input label={t("Pays")} {...registerProfile('address.country')} />
              <div className="grid grid-cols-2 gap-4">
                <Input label={t("Région / Gouvernorat")} {...registerProfile('address.region')} />
                <Input label={t("Délégation / Municipalité")} {...registerProfile('address.municipality')} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input label={t("Rue")} className="col-span-2" {...registerProfile('address.street')} />
                <Input label={t("Numéro")} {...registerProfile('address.houseNumber')} />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button type="submit">{t('Enregistrer les modifications')}</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
