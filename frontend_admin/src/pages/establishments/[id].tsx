import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEstablishments } from '../../hooks/useEstablishments';
import { useProfessions } from '../../hooks/useProfessions';
import { useUsers } from '../../hooks/useUsers';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { Modal } from '../../components/common/Modal';
import { Table } from '../../components/common/Table';
import { FiArrowLeft, FiEdit2, FiTrash2, FiPlus, FiUser } from 'react-icons/fi';
import { Establishment, Replacement } from '../../types';

interface EditForm {
  name: string;
  address: string;
  description: string;
  professionIds: string[];
}

const EstablishmentDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const { getEstablishment, updateEstablishment, deleteEstablishment, getEstablishmentReplacements } = useEstablishments();
  const { professions } = useProfessions();
  const { users } = useUsers();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState<EditForm>({
    name: '',
    address: '',
    description: '',
    professionIds: [],
  });
  const [replacements, setReplacements] = useState<Replacement[]>([]);
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<string[]>([]);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const [establishmentData, replacementsData] = await Promise.all([
          getEstablishment(id),
          getEstablishmentReplacements(id),
        ]);

        if (establishmentData) {
          setEstablishment(establishmentData);
          setEditForm({
            name: establishmentData.name,
            address: establishmentData.address,
            description: establishmentData.description,
            professionIds: establishmentData.professionIds || [],
          });
          setReplacements(replacementsData as Replacement[]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, getEstablishment, getEstablishmentReplacements]);

  const handleOpenEditModal = () => {
    if (establishment) {
      setEditForm({
        name: establishment.name || '',
        address: establishment.address || '',
        description: establishment.description || '',
        professionIds: establishment.professionIds || [],
      });
    }
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteEstablishment(id);
      toast.success('Établissement supprimé avec succès');
      navigate('/establishments');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'établissement');
    }
  };

  const handleUpdate = async () => {
    if (!id || !establishment) return;
    try {
      const updates: Partial<EditForm> = {};
      if (editForm.name !== establishment.name) updates.name = editForm.name;
      if (editForm.address !== establishment.address) updates.address = editForm.address;
      if (editForm.description !== establishment.description) updates.description = editForm.description;
      if (JSON.stringify(editForm.professionIds) !== JSON.stringify(establishment.professionIds)) {
        updates.professionIds = editForm.professionIds;
      }

      await updateEstablishment(id, updates);
      
      const updatedEstablishment = await getEstablishment(id);
      if (updatedEstablishment) {
        setEstablishment(updatedEstablishment);
      }
      
      setIsEditModalOpen(false);
      toast.success('Établissement mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour de l\'établissement');
    }
  };

  // Filtrer les médecins disponibles parmi tous les utilisateurs
  const availableDoctors = users
    .filter(user => 
      !establishment?.doctorIds?.includes(user.uid) &&
      (
        doctorSearchQuery === '' ||
        user.firstName.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(doctorSearchQuery.toLowerCase())
      )
    )
    .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`));

  const handleAddDoctors = async () => {
    if (!id || !establishment || selectedDoctorIds.length === 0) return;
    
    try {
      // Mettre à jour la liste des doctorIds dans Firebase
      const updatedDoctorIds = [...(establishment.doctorIds || []), ...selectedDoctorIds];
      await updateEstablishment(id, { doctorIds: updatedDoctorIds });
      
      const updatedEstablishment = await getEstablishment(id);
      if (updatedEstablishment) {
        setEstablishment({
          ...updatedEstablishment,
          doctorIds: updatedDoctorIds // S'assurer que doctorIds est inclus
        });
      }
      
      setIsAddDoctorModalOpen(false);
      setSelectedDoctorIds([]);
      setDoctorSearchQuery('');
      toast.success('Médecins ajoutés avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout des médecins:', error);
      toast.error('Erreur lors de l\'ajout des médecins');
    }
  };

  const handleRemoveDoctor = async (doctorId: string) => {
    if (!id || !establishment) return;
    
    try {
      const updatedDoctorIds = establishment.doctorIds.filter(id => id !== doctorId);
      await updateEstablishment(id, { doctorIds: updatedDoctorIds });
      
      const updatedEstablishment = await getEstablishment(id);
      if (updatedEstablishment) {
        setEstablishment({
          ...updatedEstablishment,
          doctorIds: updatedDoctorIds // S'assurer que doctorIds est inclus
        });
      }
      
      toast.success('Médecin retiré avec succès');
    } catch (error) {
      console.error('Erreur lors du retrait du médecin:', error);
      toast.error('Erreur lors du retrait du médecin');
    }
  };

  const replacementsColumns = [
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

  const doctorsColumns = [
    {
      header: 'Nom',
      accessor: (doctorId: string) => {
        const doctor = users.find(u => u.uid === doctorId);
        return (
          <div>
            <div className="font-bold">{`${doctor?.firstName} ${doctor?.lastName}`}</div>
            <div className="text-sm text-base-content/60">{doctor?.email}</div>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (doctorId: string) => (
        <div className="flex gap-2">
          <button
            className="btn btn-ghost btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/users/${doctorId}`);
            }}
          >
            <FiUser className="w-4 h-4" />
            Voir
          </button>
          <button
            className="btn btn-ghost btn-sm text-error"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveDoctor(doctorId);
            }}
          >
            <FiTrash2 className="w-4 h-4" />
            Retirer
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="alert alert-error">
        <span>Établissement non trouvé</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            className="btn btn-ghost btn-circle"
            onClick={() => navigate('/establishments')}
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">
            {establishment.name}
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            className="btn btn-outline btn-primary"
            onClick={handleOpenEditModal}
          >
            <FiEdit2 className="w-4 h-4" />
            Modifier
          </button>
          <button
            className="btn btn-outline btn-error"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <FiTrash2 className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Informations générales</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-base-content/60">Adresse</label>
                <p>{establishment.address}</p>
              </div>
              
              <div>
                <label className="text-sm text-base-content/60">Description</label>
                <p>{establishment.description}</p>
              </div>
              
              <div>
                <label className="text-sm text-base-content/60">Professions</label>
                <div className="flex flex-wrap gap-2">
                  {establishment.professionIds.map((profId) => {
                    const profession = professions.find(p => p.id === profId);
                    return (
                      <div key={profId} className="badge badge-outline">
                        {profession?.name || profId}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-base-content/60">
                  Date de création
                </label>
                <p>
                  {format(establishment.createdAt, 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Médecins</h2>
              <button 
                className="btn btn-primary btn-sm gap-2"
                onClick={() => setIsAddDoctorModalOpen(true)}
              >
                <FiPlus className="w-4 h-4" />
                Ajouter un médecin
              </button>
            </div>
            
            {establishment?.doctorIds?.length > 0 ? (
              <Table
                data={establishment.doctorIds}
                columns={doctorsColumns}
                emptyMessage="Aucun médecin associé"
              />
            ) : (
              <div className="alert">
                <span>Aucun médecin associé</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">Remplacements</h2>
            <button 
              className="btn btn-primary btn-sm gap-2"
              onClick={() => navigate('/replacements/new', { 
                state: { establishmentId: establishment.id } 
              })}
            >
              <FiPlus className="w-4 h-4" />
              Nouveau remplacement
            </button>
          </div>

          {replacements.length > 0 ? (
            <Table
              data={replacements}
              columns={replacementsColumns}
              onRowClick={(replacement) =>
                navigate(`/replacements/${replacement.id}`)
              }
            />
          ) : (
            <div className="alert">
              <span>Aucun remplacement trouvé</span>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Supprimer l'établissement"
      >
        <div className="space-y-4">
          <p>
            Êtes-vous sûr de vouloir supprimer cet établissement ? Cette action est
            irréversible.
          </p>
          <div className="flex justify-end gap-2">
            <button
              className="btn btn-ghost"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Annuler
            </button>
            <button className="btn btn-error" onClick={handleDelete}>
              Supprimer
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier l'établissement"
      >
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nom</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={editForm.name}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Adresse</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={editForm.address}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, address: e.target.value }))
              }
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              value={editForm.description}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Professions</span>
            </label>
            <select
              multiple
              className="select select-bordered"
              value={editForm.professionIds}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                setEditForm(prev => ({ ...prev, professionIds: selectedOptions }));
              }}
            >
              {professions.map((profession) => (
                <option key={profession.id} value={profession.id}>
                  {profession.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              className="btn btn-ghost"
              onClick={() => setIsEditModalOpen(false)}
            >
              Annuler
            </button>
            <button className="btn btn-primary" onClick={handleUpdate}>
              Enregistrer
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAddDoctorModalOpen}
        onClose={() => {
          setIsAddDoctorModalOpen(false);
          setSelectedDoctorIds([]);
          setDoctorSearchQuery('');
        }}
        title="Ajouter des médecins"
      >
        <div className="space-y-4">
          <div className="form-control">
            <div className="input-group">
              <input
                type="text"
                placeholder="Rechercher un médecin..."
                className="input input-bordered w-full"
                value={doctorSearchQuery}
                onChange={(e) => setDoctorSearchQuery(e.target.value)}
              />
              {doctorSearchQuery && (
                <button
                  className="btn btn-square btn-ghost"
                  onClick={() => setDoctorSearchQuery('')}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto border rounded-lg">
            {availableDoctors.length > 0 ? (
              <div className="divide-y">
                {availableDoctors.map((doctor) => (
                  <label 
                    key={doctor.uid} 
                    className="flex items-center gap-3 p-3 hover:bg-base-200 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selectedDoctorIds.includes(doctor.uid)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDoctorIds(prev => [...prev, doctor.uid]);
                        } else {
                          setSelectedDoctorIds(prev => prev.filter(id => id !== doctor.uid));
                        }
                      }}
                    />
                    <div>
                      <div className="font-medium">
                        {doctor.lastName.toUpperCase()} {doctor.firstName}
                      </div>
                      <div className="text-sm text-base-content/60">
                        {doctor.email}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-base-content/60">
                {doctorSearchQuery ? 'Aucun médecin trouvé' : 'Aucun médecin disponible'}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-base-content/60">
              {selectedDoctorIds.length} médecin{selectedDoctorIds.length > 1 ? 's' : ''} sélectionné{selectedDoctorIds.length > 1 ? 's' : ''}
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setIsAddDoctorModalOpen(false);
                  setSelectedDoctorIds([]);
                  setDoctorSearchQuery('');
                }}
              >
                Annuler
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddDoctors}
                disabled={selectedDoctorIds.length === 0}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EstablishmentDetailsPage; 