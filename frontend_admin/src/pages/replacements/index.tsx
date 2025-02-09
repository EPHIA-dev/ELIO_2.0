import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReplacements } from '../../hooks/useReplacements';
import { Replacement } from '../../types';
import { Table } from '../../components/common/Table';
import { format } from 'date-fns';
import { FiFilter, FiPlus } from 'react-icons/fi';

const ReplacementsPage = () => {
  const navigate = useNavigate();
  const { replacements, loading, error } = useReplacements();
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    establishmentId: '',
    urgency: '',
  });

  const filteredReplacements = replacements.filter(replacement => {
    // Filtre par recherche textuelle
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        replacement.title.toLowerCase().includes(searchLower) ||
        replacement.establishmentId.toLowerCase().includes(searchLower) ||
        replacement.professionId.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Filtres avancés
    if (filters.status && replacement.status !== filters.status) return false;
    if (filters.establishmentId && replacement.establishmentId !== filters.establishmentId) return false;
    if (filters.urgency && replacement.urgency !== filters.urgency) return false;
    return true;
  });

  const columns = [
    {
      header: 'Titre',
      accessor: (replacement: Replacement) => (
        <div>
          <div className="font-bold">{replacement.title}</div>
          <div className="text-sm text-base-content/60">
            {format(replacement.startDate, 'dd/MM/yyyy')} - {format(replacement.endDate, 'dd/MM/yyyy')}
          </div>
        </div>
      ),
    },
    {
      header: 'Établissement',
      accessor: (replacement: Replacement) => (
        <div className="badge badge-outline">
          {replacement.establishmentId}
        </div>
      ),
    },
    {
      header: 'Profession',
      accessor: (replacement: Replacement) => (
        <div className="badge badge-outline">
          {replacement.professionId}
        </div>
      ),
    },
    {
      header: 'Statut',
      accessor: (replacement: Replacement) => (
        <div className={`badge ${
          replacement.status === 'open'
            ? 'badge-success'
            : replacement.status === 'cancelled'
            ? 'badge-error'
            : 'badge-neutral'
        }`}>
          {replacement.status === 'open'
            ? 'Ouvert'
            : replacement.status === 'cancelled'
            ? 'Annulé'
            : 'Fermé'}
        </div>
      ),
    },
    {
      header: 'Urgence',
      accessor: (replacement: Replacement) => (
        <div className={`badge ${
          replacement.urgency === 'high' ? 'badge-error' : 'badge-neutral'
        }`}>
          {replacement.urgency === 'high' ? 'Urgent' : 'Normal'}
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Une erreur est survenue lors du chargement des remplacements</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Remplacements</h1>
        <button
          className="btn btn-primary gap-2"
          onClick={() => navigate('/replacements/new')}
        >
          <FiPlus className="w-4 h-4" />
          Nouveau remplacement
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
                    placeholder="Rechercher..."
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
                          <span className="label-text">Statut</span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={filters.status}
                          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        >
                          <option value="">Tous les statuts</option>
                          <option value="open">Ouvert</option>
                          <option value="closed">Fermé</option>
                          <option value="cancelled">Annulé</option>
                        </select>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Établissement</span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={filters.establishmentId}
                          onChange={(e) => setFilters(prev => ({ ...prev, establishmentId: e.target.value }))}
                        >
                          <option value="">Tous les établissements</option>
                          {replacements.map((replacement) => (
                            <option key={replacement.establishmentId} value={replacement.establishmentId}>
                              {replacement.establishmentId}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Urgence</span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={filters.urgency}
                          onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
                        >
                          <option value="">Toutes les urgences</option>
                          <option value="normal">Normal</option>
                          <option value="high">Urgent</option>
                        </select>
                      </div>

                      {Object.values(filters).some(Boolean) && (
                        <button
                          className="btn btn-ghost btn-block btn-sm"
                          onClick={() => {
                            setFilters({ status: '', establishmentId: '', urgency: '' });
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
            data={filteredReplacements}
            columns={columns}
            onRowClick={(replacement) => navigate(`/replacements/${replacement.id}`)}
            emptyMessage="Aucun remplacement trouvé"
          />
        </div>
      </div>
    </div>
  );
};

export default ReplacementsPage; 