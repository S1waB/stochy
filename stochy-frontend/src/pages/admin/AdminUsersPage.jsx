import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as adminApi from '../../api/admin.api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { PROFESSIONAL_STATUSES, GENDERS } from '../../utils/constants';
import toast from 'react-hot-toast';
import { ShieldAlert, UserPlus, Search, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Modals
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
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

  const handleCreateAdmin = async (data) => {
    try {
      await adminApi.createAdmin(data);
      toast.success('Nouvel administrateur créé !');
      setIsAddAdminOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création de l\'admin.');
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
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${row.role === 'ROLE_ADMIN' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
        {row.role === 'ROLE_ADMIN' ? 'Admin' : 'Utilisateur'}
      </span>
    )},
    { key: 'profStatus', label: 'Profession', render: (row) => PROFESSIONAL_STATUSES[row.professionalStatus] || '-' },
    { key: 'isActive', label: 'Actif', render: (row) => (
      <button onClick={() => handleToggleActive(row)} className="text-gray-500 hover:text-primary transition-colors">
        {row.isActive ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} className="text-gray-300" />}
      </button>
    )},
    { key: 'actions', label: 'Actions', render: (row) => (
      <button onClick={() => setUserToDelete(row)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-colors">
        <Trash2 size={16} />
      </button>
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
        <Button onClick={() => { reset({ firstName: '', lastName: '', email: '', password: '' }); setIsAddAdminOpen(true); }}>
          <UserPlus size={16} /> Créer un Admin
        </Button>
      </div>

      {/* Tableau des utilisateurs */}
      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="py-24"><LoadingSpinner /></div>
        ) : users.length > 0 ? (
          <>
            <Table columns={columns} data={users} />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        ) : (
          <EmptyState title="Aucun utilisateur trouvé" message="Modifiez les filtres de recherche." />
        )}
      </Card>

      {/* Modal de création d'Admin */}
      <Modal isOpen={isAddAdminOpen} onClose={() => setIsAddAdminOpen(false)} title="Créer un compte Administrateur" size="sm">
        <form onSubmit={handleSubmit(handleCreateAdmin)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prénom" {...register('firstName', { required: 'Prénom obligatoire' })} error={errors.firstName?.message} />
            <Input label="Nom" {...register('lastName', { required: 'Nom obligatoire' })} error={errors.lastName?.message} />
          </div>
          <Input label="Email" type="email" {...register('email', { required: 'Email obligatoire' })} error={errors.email?.message} />
          <Input label="Mot de passe temporaire" type="password" {...register('password', { required: 'Mot de passe obligatoire', minLength: 8 })} error={errors.password?.message} />

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsAddAdminOpen(false)}>Annuler</Button>
            <Button type="submit">Créer l'Admin</Button>
          </div>
        </form>
      </Modal>

      {/* Dialogue de suppression d'un utilisateur */}
      <ConfirmDialog isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} onConfirm={handleDelete} message={`Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur "${userToDelete?.firstName} ${userToDelete?.lastName}" ? Cette action est irréversible et supprimera l'intégralité de ses données.`} />
    </div>
  );
}
