import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs } from '@firebase/firestore';
import { db } from '../services/firebase';

export interface Specialty {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
  professionId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const useSpecialties = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSpecialties = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'specialties'));
      const specialtiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Specialty[];
      setSpecialties(specialtiesData);
    } catch (err) {
      console.error('Erreur lors du chargement des spécialités:', err);
      setError('Erreur lors du chargement des spécialités');
    } finally {
      setLoading(false);
    }
  };

  const getSpecialty = async (id: string) => {
    try {
      const docRef = doc(db, 'specialties', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate(),
        } as Specialty;
      }
      return null;
    } catch (err) {
      console.error('Erreur lors de la récupération de la spécialité:', err);
      return null;
    }
  };

  useEffect(() => {
    loadSpecialties();
  }, []);

  return {
    specialties,
    loading,
    error,
    getSpecialty,
    refresh: loadSpecialties,
  };
}; 