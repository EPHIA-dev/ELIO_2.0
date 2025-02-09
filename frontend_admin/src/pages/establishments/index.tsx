import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEstablishments } from '../../hooks/useEstablishments';
import { Establishment } from '../../types';
import { Table } from '../../components/common/Table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FiPlus, FiFilter } from 'react-icons/fi';
import { Modal } from '../../components/common/Modal';
import { useProfessions } from '../../hooks/useProfessions';

const EstablishmentsPage = () => {
  const navigate = useNavigate();
  const { establishments, loading, hasMore, loadMore, deleteEstablishment } = useEstablishments();
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { professions } = useProfessions();
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    professionId: '',
  });

  const filteredEstablishments = establishments.filter(establishment => {
    // Filtre par recherche textuelle
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        establishment.name.toLowerCase().includes(searchLower) ||
        establishment.address.toLowerCase().includes(searchLower) ||
        establishment.professionIds.some(profId => 
          professions.find(p => p.id === profId)?.name.toLowerCase().includes(searchLower)
        );
      
      if (!matchesSearch) return false;
    }

    // Filtres avancés
    if (filters.professionId && !establishment.professionIds.includes(filters.professionId)) return false;
    return true;
  });

  const handleLoadMore = async () => {
    if (hasMore && !loading) {
      await loadMore();
    }
  };

  const handleRowClick = (establishment: Establishment) => {
    navigate(`/establishments/${establishment.id}`);
  };

  const handleDelete = async () => {
    if (!selectedEstablishment) return;
    try {
      await deleteEstablishment(selectedEstablishment.id);
      setIsDeleteModalOpen(false);
      setSelectedEstablishment(null);
      await loadMore();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      header: 'Nom',
      accessor: (establishment: Establishment) => (
        <div>
          <div className="font-bold">{establishment.name}</div>
          <div className="text-sm text-base-content/60">{establishment.address}</div>
        </div>
      ),
    },
    {
      header: 'Professions',
      accessor: (establishment: Establishment) => (
        <div className="flex flex-wrap gap-2">
          {establishment.professionIds?.map((profId: string) => {
            const profession = professions.find(p => p.id === profId);
            return (
              <div key={profId} className="badge badge-outline">
                {profession?.name || profId}
              </div>
            );
          })}
        </div>
      ),
    },
    {
      header: 'Date de création',
      accessor: (establishment: Establishment) =>
        format(establishment.createdAt, 'dd MMMM yyyy', { locale: fr }),
    },
  ];

  if (loading && establishments.length === 0) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Établissements</h1>
        <button
          className="btn btn-primary gap-2"
          onClick={() => navigate('/establishments/new')}
        >
          <FiPlus className="w-4 h-4" />
          Nouvel établissement
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
                    placeholder="Rechercher un établissement..."
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
                          <span className="label-text">Profession</span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={filters.professionId}
                          onChange={(e) => setFilters(prev => ({ ...prev, professionId: e.target.value }))}
                        >
                          <option value="">Toutes les professions</option>
                          {professions.map((profession) => (
                            <option key={profession.id} value={profession.id}>
                              {profession.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {Object.values(filters).some(Boolean) && (
                        <button
                          className="btn btn-ghost btn-block btn-sm"
                          onClick={() => {
                            setFilters({ professionId: '' });
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
            data={filteredEstablishments}
            columns={columns}
            isLoading={loading}
            emptyMessage="Aucun établissement trouvé"
            onRowClick={handleRowClick}
          />

          {hasMore && (
            <div className="flex justify-center mt-4">
              <button
                className="btn btn-outline"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Chargement...' : 'Charger plus'}
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Supprimer l'établissement"
        footer={
          <>
            <button
              className="btn btn-ghost"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Annuler
            </button>
            <button className="btn btn-error" onClick={handleDelete}>
              Supprimer
            </button>
          </>
        }
      >
        <p>
          Êtes-vous sûr de vouloir supprimer l'établissement{' '}
          <strong>{selectedEstablishment?.name}</strong> ?
        </p>
        <p className="text-sm text-base-content/60 mt-2">
          Cette action est irréversible.
        </p>
      </Modal>
    </div>
  );
};

export default EstablishmentsPage; 