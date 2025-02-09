import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs } from '@firebase/firestore';
import { db } from '../services/firebase';

export interface Profession {
  id: string;
  name: string;
  description: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useProfessions = () => {
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfessions = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'professions'));
      const professionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Profession[];
      setProfessions(professionsData);
    } catch (err) {
      console.error('Erreur lors du chargement des professions:', err);
      setError('Erreur lors du chargement des professions');
    } finally {
      setLoading(false);
    }
  };

  const getProfession = async (id: string) => {
    try {
      const docRef = doc(db, 'professions', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate(),
        } as Profession;
      }
      return null;
    } catch (err) {
      console.error('Erreur lors de la récupération de la profession:', err);
      return null;
    }
  };

  useEffect(() => {
    loadProfessions();
  }, []);

  return {
    professions,
    loading,
    error,
    getProfession,
    refresh: loadProfessions,
  };
}; 