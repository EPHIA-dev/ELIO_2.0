import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEstablishments } from '../../hooks/useEstablishments';
import { useProfessions } from '../../hooks/useProfessions';
import { useSpecialties } from '../../hooks/useSpecialties';
import { isValid, parseISO, startOfDay, format } from 'date-fns';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';
import { addDoc, collection } from '@firebase/firestore';
import { db } from '../../services/firebase';

interface NewReplacementForm {
  title: string;
  description: string;
  status: 'open' | 'closed' | 'cancelled';
  urgency: 'normal' | 'high';
  establishmentId: string;
  professionId: string;
  specialtyId: string;
  startDate: Date | null;
  endDate: Date | null;
}

const NewReplacementPage = () => {
  const navigate = useNavigate();
  const { establishments } = useEstablishments();
  const { professions } = useProfessions();
  const { specialties } = useSpecialties();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<NewReplacementForm>({
    title: '',
    description: '',
    status: 'open',
    urgency: 'normal',
    establishmentId: '',
    professionId: '',
    specialtyId: '',
    startDate: startOfDay(new Date()),
    endDate: startOfDay(new Date()),
  });

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    try {
      return isValid(date) ? format(date, 'yyyy-MM-dd') : '';
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return '';
    }
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    try {
      if (!value) {
        setForm(prev => ({ ...prev, [field]: null }));
        return;
      }

      const parsedDate = parseISO(value);
      if (isValid(parsedDate)) {
        const normalizedDate = startOfDay(parsedDate);
        setForm(prev => ({ ...prev, [field]: normalizedDate }));
      } else {
        setForm(prev => ({ ...prev, [field]: null }));
      }
    } catch (error) {
      console.error(`Erreur lors de la conversion de la date ${field}:`, error);
      setForm(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateDates = (): boolean => {
    if (!form.startDate || !form.endDate) {
      toast.error('Les dates de début et de fin sont requises');
      return false;
    }

    if (!isValid(form.startDate) || !isValid(form.endDate)) {
      toast.error('Les dates saisies ne sont pas valides');
      return false;
    }

    if (form.startDate > form.endDate) {
      toast.error('La date de début doit être antérieure à la date de fin');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.description || !form.establishmentId || !form.professionId) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!validateDates()) {
      return;
    }

    try {
      setLoading(true);
      const docRef = await addDoc(collection(db, 'replacements'), {
        ...form,
        startDate: form.startDate,
        endDate: form.endDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      toast.success('Remplacement créé avec succès');
      navigate(`/replacements/${docRef.id}`);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création du remplacement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          className="btn btn-ghost btn-circle"
          onClick={() => navigate('/replacements')}
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Nouveau remplacement</h1>
      </div>

      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl">
        <div className="card-body space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Titre</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
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
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Statut</span>
            </label>
            <select
              className="select select-bordered"
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  status: e.target.value as 'open' | 'closed' | 'cancelled',
                }))
              }
              required
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
              value={form.urgency}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  urgency: e.target.value as 'normal' | 'high',
                }))
              }
              required
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
              value={form.establishmentId}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  establishmentId: e.target.value,
                }))
              }
              required
            >
              <option value="">Sélectionner un établissement</option>
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
              value={form.professionId}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  professionId: e.target.value,
                  specialtyId: '', // Reset specialty when profession changes
                }));
              }}
              required
            >
              <option value="">Sélectionner une profession</option>
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
              value={form.specialtyId}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  specialtyId: e.target.value,
                }))
              }
            >
              <option value="">Sélectionner une spécialité</option>
              {specialties
                .filter((s) => s.professionId === form.professionId)
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
              value={formatDateForInput(form.startDate)}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Date de fin</span>
            </label>
            <input
              type="date"
              className="input input-bordered"
              value={formatDateForInput(form.endDate)}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate('/replacements')}
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

export default NewReplacementPage; 