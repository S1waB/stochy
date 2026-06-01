import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as adminApi from '../../api/admin.api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { PROFESSIONAL_STATUSES, GENDERS, MARITAL_STATUSES } from '../../utils/constants';
import toast from 'react-hot-toast';
import { UserPlus, ToggleLeft, ToggleRight, Trash2, Eye } from 'lucide-react';

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [profStatus, setProfStatus] = useState('');
  const [isActive, setIsActive] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchUsers();
  }, [page, search, profStatus, isActive]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAdminUsers({
        page,
        size: 10,
        search: search || undefined,
        professionalStatus: profStatus || undefined,
        isActive: isActive !== '' ? isActive === 'true' : undefined
      });
      setUsers(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Erreur lors de la récupération des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await adminApi.toggleUserActive(user.id);
      toast.success(`Statut de ${user.firstName} mis à jour !`);
      fetchUsers();
    } catch {
      toast.error('Erreur lors du changement de statut');
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await adminApi.deleteUser(userToDelete.id);
      toast.success('Utilisateur supprimé définitivement !');
      fetchUsers();
    } catch {
      toast.error('Erreur de suppression de l\'utilisateur.');
    }
  };

  const handleCreateUser = async (data) => {
    try {
      const payload = {
        ...data,
        phone: data.phone || undefined,
        professionalStatus: data.professionalStatus || undefined,
        gender: data.gender || undefined,
        maritalStatus: data.maritalStatus || undefined,
      };
      await adminApi.createUser(payload);
      toast.success('Nouvel utilisateur créé ! Un email contenant ses accès temporaires lui a été envoyé.');
      setIsAddUserOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création de l\'utilisateur.');
    }
  };

  const columns = [
    { key: 'name', label: 'Utilisateur', render: (row) => (
      <div>
        <p className="font-semibold text-gray-900">{row.firstName} {row.lastName}</p>
        <p className="text-xs text-gray-400">{row.email}</p>
      </div>
    )},
    { key: 'role', label: 'Rôle', render: (row) => (
      <select
        value={row.role}
        onChange={async (e) => {
          const newRole = e.target.value;
          try {
            await adminApi.changeUserRole(row.id, newRole);
            toast.success(`Rôle de ${row.firstName} mis à jour !`);
            fetchUsers();
          } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour du rôle');
          }
        }}
        className="px-2 py-1 rounded text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
      >
        <option value="ROLE_USER">Utilisateur</option>
        <option value="ROLE_ADMIN">Admin</option>
      </select>
    )},
    { key: 'phone', label: 'Téléphone', render: (row) => row.phone || '-' },
    { key: 'gender', label: 'Genre', render: (row) => GENDERS[row.gender] || '-' },
    { key: 'maritalStatus', label: 'Statut Marital', render: (row) => MARITAL_STATUSES[row.maritalStatus] || '-' },
    { key: 'profStatus', label: 'Profession', render: (row) => PROFESSIONAL_STATUSES[row.professionalStatus] || '-' },
    { key: 'createdAt', label: 'Date d\'inscription', render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString('fr-FR') : '-' },
    { key: 'isActive', label: 'Actif', render: (row) => (
      <button onClick={() => handleToggleActive(row)} className="text-gray-500 hover:text-primary transition-colors">
        {row.isActive ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} className="text-gray-300" />}
      </button>
    )},
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(`/admin/users/${row.id}`)}
          className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
          title="Voir le profil et les indicateurs"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={() => setUserToDelete(row)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-colors"
          title="Supprimer définitivement"
        >
          <Trash2 size={16} />
        </button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      {/* Barre de contrôle supérieure */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Input placeholder="Rechercher par nom, email..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-64" />
          <select value={profStatus} onChange={e => setProfStatus(e.target.value)} className="input-field w-auto">
            <option value="">Tous les statuts prof.</option>
            {Object.entries(PROFESSIONAL_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={isActive} onChange={e => setIsActive(e.target.value)} className="input-field w-auto">
            <option value="">Tous les statuts</option>
            <option value="true">Actifs</option>
            <option value="false">Inactifs</option>
          </select>
        </div>
        <Button onClick={() => { reset({ firstName: '', lastName: '', email: '', role: 'ROLE_USER', phone: '', gender: '', maritalStatus: '', professionalStatus: '' }); setIsAddUserOpen(true); }}>
          <UserPlus size={16} /> Créer un Utilisateur
        </Button>
      </div>

      {/* Tableau des utilisateurs */}
      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="py-24"><LoadingSpinner /></div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <Table columns={columns} data={users} />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        ) : (
          <EmptyState title="Aucun utilisateur trouvé" message="Modifiez les filtres de recherche." />
        )}
      </Card>

      {/* Modal de création d'Utilisateur */}
      <Modal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} title="Créer un nouvel Utilisateur" size="md">
        <form onSubmit={handleSubmit(handleCreateUser)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prénom" {...register('firstName', { required: 'Prénom obligatoire' })} error={errors.firstName?.message} />
            <Input label="Nom" {...register('lastName', { required: 'Nom obligatoire' })} error={errors.lastName?.message} />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" {...register('email', { required: 'Email obligatoire' })} error={errors.email?.message} />
            <Input label="Téléphone" {...register('phone')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
              <select {...register('role', { required: 'Rôle obligatoire' })} className="input-field w-full">
                <option value="ROLE_USER">Utilisateur</option>
                <option value="ROLE_ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
              <select {...register('gender')} className="input-field w-full">
                <option value="">Sélectionner</option>
                {Object.entries(GENDERS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut marital</label>
              <select {...register('maritalStatus')} className="input-field w-full">
                <option value="">Sélectionner</option>
                {Object.entries(MARITAL_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut professionnel</label>
              <select {...register('professionalStatus')} className="input-field w-full">
                <option value="">Sélectionner</option>
                {Object.entries(PROFESSIONAL_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>Annuler</Button>
            <Button type="submit">Créer l'Utilisateur</Button>
          </div>
        </form>
      </Modal>

      {/* Dialogue de suppression d'un utilisateur */}
      <ConfirmDialog isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} onConfirm={handleDelete} message={`Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur "${userToDelete?.firstName} ${userToDelete?.lastName}" ? Cette action est irréversible et supprimera l'intégralité de ses données.`} />
    </div>
  );
}
