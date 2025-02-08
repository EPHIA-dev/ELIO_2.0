import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfessions } from '../../hooks/useProfessions';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';
import { addDoc } from '@firebase/firestore';
import { establishmentsRef } from '../../services/firebase';

interface NewEstablishmentForm {
  name: string;
  address: string;
  description: string;
  professionIds: string[];
  doctorIds: string[];
}

const NewEstablishmentPage = () => {
  const navigate = useNavigate();
  const { professions } = useProfessions();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<NewEstablishmentForm>({
    name: '',
    address: '',
    description: '',
    professionIds: [],
    doctorIds: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.address || !form.professionIds.length) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      const docRef = await addDoc(establishmentsRef, {
        ...form,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      toast.success('Établissement créé avec succès');
      navigate(`/establishments/${docRef.id}`);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de l\'établissement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          className="btn btn-ghost btn-circle"
          onClick={() => navigate('/establishments')}
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Nouvel établissement</h1>
      </div>

      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl">
        <div className="card-body space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nom</span>
              <span className="label-text-alt text-error">*</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Adresse</span>
              <span className="label-text-alt text-error">*</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={form.address}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, address: e.target.value }))
              }
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={4}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Professions</span>
              <span className="label-text-alt text-error">*</span>
            </label>
            <select
              multiple
              className="select select-bordered min-h-[120px]"
              value={form.professionIds}
              onChange={(e) => {
                const selectedOptions = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                setForm((prev) => ({
                  ...prev,
                  professionIds: selectedOptions,
                }));
              }}
              required
            >
              {professions.map((profession) => (
                <option key={profession.id} value={profession.id}>
                  {profession.name}
                </option>
              ))}
            </select>
            <label className="label">
              <span className="label-text-alt">
                Maintenez Ctrl (Cmd sur Mac) pour sélectionner plusieurs professions
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate('/establishments')}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                'Créer'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewEstablishmentPage; 