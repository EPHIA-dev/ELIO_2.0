import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUsers } from '../../hooks/useUsers';
import { useProfessions, Profession } from '../../hooks/useProfessions';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { Modal } from '../../components/common/Modal';
import { Table } from '../../components/common/Table';
import { FiArrowLeft, FiEdit2, FiTrash2, FiKey } from 'react-icons/fi';
import { sendPasswordResetEmail, updatePassword, getAuth } from '@firebase/auth';

interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  professionId?: string;
  specialityIds?: string[];
  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface EditForm {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface PasswordForm {
  newPassword: string;
  confirmPassword: string;
}

const UserDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const { getUser, updateUser, deleteUser } = useUsers();
  const { getProfession } = useProfessions();
  const [user, setUser] = useState<User | null>(null);
  const [profession, setProfession] = useState<Profession | null>(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState<EditForm>({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    newPassword: '',
    confirmPassword: '',
  });
  const auth = getAuth();

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;
      try {
        const userData = await getUser(id);
        if (userData) {
          setUser(userData);
          if (userData.professionId) {
            const professionData = await getProfession(userData.professionId);
            setProfession(professionData);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        toast.error('Erreur lors du chargement de l\'utilisateur');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id, getUser, getProfession]);

  const handleOpenEditModal = () => {
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role || '',
      });
    }
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteUser(id);
      toast.success('Utilisateur supprimé avec succès');
      navigate('/users');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const handleUpdate = async () => {
    if (!id || !user) return;
    try {
      const updates: Partial<EditForm> = {};
      if (editForm.firstName !== user.firstName) updates.firstName = editForm.firstName;
      if (editForm.lastName !== user.lastName) updates.lastName = editForm.lastName;
      if (editForm.email !== user.email) updates.email = editForm.email;
      if (editForm.role !== user.role) updates.role = editForm.role;

      await updateUser(id, updates);
      
      const updatedUser = await getUser(id);
      if (updatedUser) {
        setUser(updatedUser);
      }
      
      setIsEditModalOpen(false);
      toast.success('Utilisateur mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour de l\'utilisateur');
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success('Email de réinitialisation envoyé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      toast.error('Erreur lors de l\'envoi de l\'email de réinitialisation');
    }
  };

  const handlePasswordUpdate = async () => {
    if (!user?.email) return;
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      // Note: Cette fonction nécessite que l'utilisateur soit récemment connecté
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, passwordForm.newPassword);
        toast.success('Mot de passe mis à jour avec succès');
        setIsPasswordModalOpen(false);
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      toast.error('Erreur lors de la mise à jour du mot de passe');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="alert alert-error">
        <span>Utilisateur non trouvé</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            className="btn btn-ghost btn-circle"
            onClick={() => navigate('/users')}
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">
            {user.firstName} {user.lastName}
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
                <label className="text-sm text-base-content/60">Email</label>
                <p>{user.email}</p>
              </div>
              
              <div>
                <label className="text-sm text-base-content/60">Rôle</label>
                <div className="badge badge-outline">
                  {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-base-content/60">
                  État du profil
                </label>
                <div
                  className={`badge ${
                    user.isProfileComplete ? 'badge-success' : 'badge-warning'
                  }`}
                >
                  {user.isProfileComplete ? 'Complet' : 'Incomplet'}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-base-content/60">
                  Date d'inscription
                </label>
                <p>
                  {format(user.createdAt, 'dd MMMM yyyy à HH:mm', {
                    locale: fr,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Profession & Spécialités</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-base-content/60">Profession</label>
                {profession ? (
                  <p className="font-medium">{profession.name}</p>
                ) : (
                  <p className="text-base-content/60">
                    {user.professionId ? 'Chargement...' : 'Non spécifiée'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm text-base-content/60">Spécialités</label>
                <div className="flex flex-wrap gap-2">
                  {user.specialityIds?.length ? (
                    user.specialityIds.map((id: string) => (
                      <div key={id} className="badge badge-primary">
                        {id}
                      </div>
                    ))
                  ) : (
                    <p className="text-base-content/60">Aucune spécialité</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Sécurité</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-base-content/60">Gestion du mot de passe</label>
                <div className="flex flex-col gap-2 mt-2">
                  <button
                    className="btn btn-outline btn-info gap-2"
                    onClick={handleSendResetEmail}
                  >
                    <FiKey className="w-4 h-4" />
                    Envoyer un email de réinitialisation
                  </button>
                  <button
                    className="btn btn-outline btn-primary gap-2"
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    <FiKey className="w-4 h-4" />
                    Définir un nouveau mot de passe
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-base-content/60">Dernière connexion</label>
                <p className="text-base-content/60">
                  Information non disponible
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier l'utilisateur"
        footer={
          <>
            <button
              className="btn btn-ghost"
              onClick={() => setIsEditModalOpen(false)}
            >
              Annuler
            </button>
            <button className="btn btn-primary" onClick={handleUpdate}>
              Enregistrer
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Prénom</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={editForm.firstName}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, firstName: e.target.value }))
              }
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Nom</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={editForm.lastName}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, lastName: e.target.value }))
              }
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              className="input input-bordered"
              value={editForm.email}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Rôle</span>
            </label>
            <select
              className="select select-bordered"
              value={editForm.role}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, role: e.target.value }))
              }
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
        </div>
      </Modal>

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
            <button className="btn btn-error" onClick={handleDelete}>
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

      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPasswordForm({ newPassword: '', confirmPassword: '' });
        }}
        title="Définir un nouveau mot de passe"
        footer={
          <>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setIsPasswordModalOpen(false);
                setPasswordForm({ newPassword: '', confirmPassword: '' });
              }}
            >
              Annuler
            </button>
            <button 
              className="btn btn-primary"
              onClick={handlePasswordUpdate}
            >
              Enregistrer
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nouveau mot de passe</span>
            </label>
            <input
              type="password"
              className="input input-bordered"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
              }
              placeholder="Minimum 6 caractères"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Confirmer le mot de passe</span>
            </label>
            <input
              type="password"
              className="input input-bordered"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
              placeholder="Retapez le mot de passe"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserDetailsPage; 