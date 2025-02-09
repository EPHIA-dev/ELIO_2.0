import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { useUsers } from '../../hooks/useUsers';
import { UserFilters } from '../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { FiFilter } from 'react-icons/fi';

const UsersPage = () => {
  const navigate = useNavigate();
  const { users, loading, error } = useUsers();
  const [filters, setFilters] = useState({
    role: '',
    status: '',
  });
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user => {
    // Filtre par recherche textuelle
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Filtres avancés
    if (filters.role && user.role !== filters.role) return false;
    if (filters.status && user.status !== filters.status) return false;
    return true;
  });

  const handleDelete = async () => {
    if (!deleteUserId) return;
    
    try {
      await deleteUser(deleteUserId);
      toast.success('Utilisateur supprimé avec succès');
      setDeleteUserId(null);
    } catch (err) {
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const columns = [
    {
      header: 'Nom',
      accessor: (user: any) => (
        <div>
          <div className="font-bold">{`${user.firstName} ${user.lastName}`}</div>
          <div className="text-sm text-base-content/60">{user.email}</div>
        </div>
      ),
    },
    {
      header: 'Rôle',
      accessor: (user: any) => (
        <div className="badge badge-outline">
          {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
        </div>
      ),
    },
    {
      header: 'Profil',
      accessor: (user: any) => (
        <div className={`badge ${user.isProfileComplete ? 'badge-success' : 'badge-warning'}`}>
          {user.isProfileComplete ? 'Complet' : 'Incomplet'}
        </div>
      ),
    },
    {
      header: 'Date d\'inscription',
      accessor: (user: any) =>
        format(user.createdAt, 'dd MMMM yyyy', { locale: fr }),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <div className="form-control flex-1">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    className="input input-bordered w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="btn btn-square btn-ghost"
                      onClick={() => setSearchQuery('')}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              <div className="dropdown dropdown-end">
                <button 
                  className={`btn btn-ghost ${Object.values(filters).some(Boolean) ? 'text-primary' : ''}`}
                  onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                >
                  <FiFilter className="w-5 h-5" />
                  Filtres
                  {Object.values(filters).some(Boolean) && (
                    <div className="badge badge-primary badge-sm"></div>
                  )}
                </button>
                {isFilterMenuOpen && (
                  <div className="dropdown-content z-[1] menu p-4 shadow bg-base-100 rounded-box w-80">
                    <h3 className="font-bold mb-4">Filtres</h3>
                    <div className="space-y-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Rôle</span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={filters.role}
                          onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                        >
                          <option value="">Tous les rôles</option>
                          <option value="admin">Administrateur</option>
                          <option value="doctor">Médecin</option>
                          <option value="establishment">Établissement</option>
                        </select>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Statut</span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={filters.status}
                          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        >
                          <option value="">Tous les statuts</option>
                          <option value="active">Actif</option>
                          <option value="inactive">Inactif</option>
                          <option value="pending">En attente</option>
                        </select>
                      </div>

                      {Object.values(filters).some(Boolean) && (
                        <button
                          className="btn btn-ghost btn-block btn-sm"
                          onClick={() => {
                            setFilters({ role: '', status: '' });
                            setIsFilterMenuOpen(false);
                          }}
                        >
                          Réinitialiser les filtres
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Table
            data={filteredUsers}
            columns={columns}
            isLoading={loading}
            emptyMessage="Aucun utilisateur trouvé"
            onRowClick={(user) => navigate(`/users/${user.uid}`)}
          />
        </div>
      </div>

      <Modal
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        title="Supprimer l'utilisateur"
        footer={
          <>
            <button
              className="btn btn-ghost"
              onClick={() => setDeleteUserId(null)}
            >
              Annuler
            </button>
            <button
              className="btn btn-error"
              onClick={handleDelete}
            >
              Supprimer
            </button>
          </>
        }
      >
        <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
        <p className="text-sm text-base-content/60 mt-2">
          Cette action est irréversible.
        </p>
      </Modal>
    </div>
  );
};

export default UsersPage; 