import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { useUsers } from '../../hooks/useUsers';
import type { User } from '../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { FiFilter } from 'react-icons/fi';

export default function UsersPage() {
  const navigate = useNavigate();
  const { users, loading, error, hasMore, loadMore, deleteUser } = useUsers();
  const [filters, setFilters] = useState({
    role: '',
    userStatus: '',
  });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const filteredUsers = (users as User[]).filter(user => {
    // Filtre par recherche textuelle
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Filtres avancés
    if (filters.role && user.role !== filters.role) return false;
    if (filters.userStatus && user.status !== filters.userStatus) return false;
    return true;
  });

  const handleLoadMore = async () => {
    if (hasMore && !loading) {
      await loadMore();
    }
  };

  const handleDelete = async () => {
    if (selectedUserId) {
      try {
        await deleteUser(selectedUserId);
        setIsDeleteModalOpen(false);
        setSelectedUserId(null);
        toast.success('Utilisateur supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  const handleRowClick = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  const columns = [
    {
      header: 'Nom',
      accessor: (user: User) => (
        <div>
          <div className="font-bold">{`${user.firstName} ${user.lastName}`}</div>
          <div className="text-sm text-base-content/60">{user.email}</div>
        </div>
      ),
    },
    {
      header: 'Rôle',
      accessor: (user: User) => (
        <div className="badge badge-outline">
          {user.role === 'admin' ? 'Administrateur' : 
           user.role === 'doctor' ? 'Médecin' : 'Établissement'}
        </div>
      ),
    },
    {
      header: 'Statut',
      accessor: (user: User) => (
        <div className={`badge ${
          user.status === 'active' ? 'badge-success' :
          user.status === 'inactive' ? 'badge-warning' :
          user.status === 'banned' ? 'badge-error' : 'badge-neutral'
        }`}>
          {user.status === 'active' ? 'Actif' :
           user.status === 'inactive' ? 'Inactif' :
           user.status === 'banned' ? 'Banni' : 'En attente'}
        </div>
      ),
    },
    {
      header: 'Date d\'inscription',
      accessor: (user: User) =>
        format(user.createdAt, 'dd MMMM yyyy', { locale: fr }),
    },
  ];

  if (loading && users.length === 0) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Une erreur est survenue lors du chargement des utilisateurs</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/users/new')}
        >
          Ajouter un utilisateur
        </button>
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
                          value={filters.userStatus}
                          onChange={(e) => setFilters(prev => ({ ...prev, userStatus: e.target.value }))}
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
                            setFilters({ role: '', userStatus: '' });
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
            onRowClick={handleRowClick}
          />

          {hasMore && (
            <div className="mt-4 text-center">
              <button
                className="btn btn-secondary"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Chargement...' : 'Charger plus'}
              </button>
            </div>
          )}
        </div>
      </div>

      {isDeleteModalOpen && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Supprimer l'utilisateur"
          footer={
            <>
              <button
                className="btn btn-ghost"
                onClick={() => setIsDeleteModalOpen(false)}
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
      )}
    </div>
  );
} 