import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReplacements } from '../../hooks/useReplacements';
import { useEstablishments } from '../../hooks/useEstablishments';
import { useProfessions } from '../../hooks/useProfessions';
import { useSpecialties } from '../../hooks/useSpecialties';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { Modal } from '../../components/common/Modal';
import { Table } from '../../components/common/Table';
import { FiArrowLeft, FiEdit2, FiTrash2, FiMessageSquare } from 'react-icons/fi';

interface Replacement {
  id: string;
  title: string;
  description: string;
  establishmentId: string;
  professionId: string;
  specialtyId: string;
  startDate: Date;
  endDate: Date;
  status: 'open' | 'closed' | 'cancelled';
  urgency: 'normal' | 'high';
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EditForm {
  title: string;
  description: string;
  status: 'open' | 'closed' | 'cancelled';
  urgency: 'normal' | 'high';
  establishmentId: string;
  professionId: string;
  specialtyId: string;
  startDate: Date;
  endDate: Date;
}

interface Conversation {
  id: string;
  lastMessage: {
    text: string;
    timestamp: Date;
  };
  status: 'active' | 'closed';
  lastActivity: Date;
}

const ReplacementDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { getReplacement, updateReplacement, deleteReplacement, getReplacementConversations } = useReplacements();
  const { establishments } = useEstablishments();
  const { professions } = useProfessions();
  const { specialties } = useSpecialties();
  const [replacement, setReplacement] = useState<Replacement | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState<EditForm>({
    title: '',
    description: '',
    status: 'open',
    urgency: 'normal',
    establishmentId: '',
    professionId: '',
    specialtyId: '',
    startDate: new Date(),
    endDate: new Date(),
  });

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const replacementData = await getReplacement(id);

        if (replacementData) {
          setReplacement(replacementData);
          setEditForm({
            title: replacementData.title,
            description: replacementData.description,
            status: replacementData.status,
            urgency: replacementData.urgency,
            establishmentId: replacementData.establishmentId,
            professionId: replacementData.professionId,
            specialtyId: replacementData.specialtyId,
            startDate: replacementData.startDate,
            endDate: replacementData.endDate,
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, getReplacement]);

  useEffect(() => {
    const loadConversations = async () => {
      if (!id) return;
      try {
        const conversationsData = await getReplacementConversations(id);
        // Tri des conversations par lastActivity décroissant
        const sortedConversations = [...conversationsData].sort((a, b) => 
          b.lastActivity.getTime() - a.lastActivity.getTime()
        );
        setConversations(sortedConversations);
      } catch (error) {
        console.error('Erreur lors du chargement des conversations:', error);
        toast.error('Erreur lors du chargement des conversations');
      }
    };

    if (!loading) {
      loadConversations();
    }
  }, [id, getReplacementConversations, loading]);

  const handleOpenEditModal = () => {
    if (replacement) {
      setEditForm({
        title: replacement.title,
        description: replacement.description,
        status: replacement.status,
        urgency: replacement.urgency,
        establishmentId: replacement.establishmentId,
        professionId: replacement.professionId,
        specialtyId: replacement.specialtyId,
        startDate: replacement.startDate,
        endDate: replacement.endDate,
      });
    }
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteReplacement(id);
      toast.success('Remplacement supprimé avec succès');
      navigate('/replacements');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du remplacement');
    }
  };

  const handleUpdate = async () => {
    if (!id || !replacement) return;
    try {
      const updates: Partial<EditForm> = {};
      if (editForm.title !== replacement.title) updates.title = editForm.title;
      if (editForm.description !== replacement.description) updates.description = editForm.description;
      if (editForm.status !== replacement.status) updates.status = editForm.status;
      if (editForm.urgency !== replacement.urgency) updates.urgency = editForm.urgency;
      if (editForm.establishmentId !== replacement.establishmentId) updates.establishmentId = editForm.establishmentId;
      if (editForm.professionId !== replacement.professionId) updates.professionId = editForm.professionId;
      if (editForm.specialtyId !== replacement.specialtyId) updates.specialtyId = editForm.specialtyId;
      if (editForm.startDate !== replacement.startDate) updates.startDate = editForm.startDate;
      if (editForm.endDate !== replacement.endDate) updates.endDate = editForm.endDate;

      await updateReplacement(id, updates);
      
      const updatedReplacement = await getReplacement(id);
      if (updatedReplacement) {
        setReplacement(updatedReplacement);
      }
      
      setIsEditModalOpen(false);
      toast.success('Remplacement mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du remplacement');
    }
  };

  const conversationsColumns = [
    {
      header: 'Dernier message',
      accessor: (conversation: Conversation) => (
        <div>
          <div className="font-medium">{conversation.lastMessage.text}</div>
          <div className="text-sm text-base-content/60">
            {format(conversation.lastMessage.timestamp, 'dd/MM/yyyy HH:mm')}
          </div>
        </div>
      ),
    },
    {
      header: 'Statut',
      accessor: (conversation: Conversation) => (
        <div className={`badge ${
          conversation.status === 'active' ? 'badge-success' : 'badge-neutral'
        }`}>
          {conversation.status === 'active' ? 'Active' : 'Fermée'}
        </div>
      ),
    },
    {
      header: 'Dernière activité',
      accessor: (conversation: Conversation) => (
        <div className="text-sm">
          {format(conversation.lastActivity, 'dd MMMM yyyy à HH:mm', { locale: fr })}
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

  if (!replacement) {
    return (
      <div className="alert alert-error">
        <span>Remplacement non trouvé</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            className="btn btn-ghost btn-circle"
            onClick={() => navigate('/replacements')}
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">
              {replacement.title}
            </h1>
            <p className="text-base-content/60">
              {format(replacement.startDate, 'dd MMMM yyyy', { locale: fr })} - {format(replacement.endDate, 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>
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
                <label className="text-sm text-base-content/60">Description</label>
                <p>{replacement.description}</p>
              </div>

              <div>
                <label className="text-sm text-base-content/60">Statut</label>
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
              </div>

              <div>
                <label className="text-sm text-base-content/60">Urgence</label>
                <div className={`badge ${
                  replacement.urgency === 'high' ? 'badge-error' : 'badge-neutral'
                }`}>
                  {replacement.urgency === 'high' ? 'Urgent' : 'Normal'}
                </div>
              </div>

              <div>
                <label className="text-sm text-base-content/60">
                  Date de création
                </label>
                <p>
                  {format(replacement.createdAt, 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Détails du poste</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-base-content/60">Établissement</label>
                <div className="badge badge-outline">
                  {establishments.find(e => e.id === replacement.establishmentId)?.name || replacement.establishmentId}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-base-content/60">Profession</label>
                <div className="badge badge-outline">
                  {professions.find(p => p.id === replacement.professionId)?.name || replacement.professionId}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-base-content/60">Spécialité</label>
                <div className="badge badge-outline">
                  {specialties.find(s => s.id === replacement.specialtyId)?.name || replacement.specialtyId}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <FiMessageSquare className="w-5 h-5" />
            <h2 className="card-title">Conversations</h2>
          </div>
          
          {conversations.length > 0 ? (
            <Table
              data={conversations}
              columns={conversationsColumns}
              onRowClick={(conversation) =>
                navigate(`/conversations/${conversation.id}`)
              }
            />
          ) : (
            <div className="alert">
              <span>Aucune conversation trouvée</span>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Supprimer le remplacement"
      >
        <div className="space-y-4">
          <p>
            Êtes-vous sûr de vouloir supprimer ce remplacement ? Cette action est
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
        title="Modifier le remplacement"
      >
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Titre</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={editForm.title}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, title: e.target.value }))
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
              <span className="label-text">Statut</span>
            </label>
            <select
              className="select select-bordered"
              value={editForm.status}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  status: e.target.value as 'open' | 'closed' | 'cancelled',
                }))
              }
            >
              <option value="open">Ouvert</option>
              <option value="closed">Fermé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Urgence</span>
            </label>
            <select
              className="select select-bordered"
              value={editForm.urgency}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  urgency: e.target.value as 'normal' | 'high',
                }))
              }
            >
              <option value="normal">Normal</option>
              <option value="high">Urgent</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Établissement</span>
            </label>
            <select
              className="select select-bordered"
              value={editForm.establishmentId}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  establishmentId: e.target.value,
                }))
              }
            >
              {establishments.map((establishment) => (
                <option key={establishment.id} value={establishment.id}>
                  {establishment.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Profession</span>
            </label>
            <select
              className="select select-bordered"
              value={editForm.professionId}
              onChange={(e) => {
                setEditForm((prev) => ({
                  ...prev,
                  professionId: e.target.value,
                  specialtyId: '', // Reset specialty when profession changes
                }));
              }}
            >
              {professions.map((profession) => (
                <option key={profession.id} value={profession.id}>
                  {profession.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Spécialité</span>
            </label>
            <select
              className="select select-bordered"
              value={editForm.specialtyId}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  specialtyId: e.target.value,
                }))
              }
            >
              <option value="">Sélectionner une spécialité</option>
              {specialties
                .filter((s) => s.professionId === editForm.professionId)
                .map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Date de début</span>
            </label>
            <input
              type="date"
              className="input input-bordered"
              value={format(editForm.startDate, 'yyyy-MM-dd')}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  startDate: new Date(e.target.value),
                }))
              }
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Date de fin</span>
            </label>
            <input
              type="date"
              className="input input-bordered"
              value={format(editForm.endDate, 'yyyy-MM-dd')}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  endDate: new Date(e.target.value),
                }))
              }
            />
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
    </div>
  );
};

export default ReplacementDetailsPage; 