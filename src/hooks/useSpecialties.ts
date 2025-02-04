import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Specialty {
  id: string;
  name: string;
  description?: string;
}

export const useSpecialties = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const specialtiesRef = collection(db, 'specialties');
      const snapshot = await getDocs(specialtiesRef);
      
      const specialtiesData: Specialty[] = [];
      snapshot.forEach((doc) => {
        specialtiesData.push({
          id: doc.id,
          ...doc.data() as Omit<Specialty, 'id'>
        });
      });

      setSpecialties(specialtiesData);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors de la récupération des spécialités:', err);
      setError('Impossible de charger les spécialités');
      setLoading(false);
    }
  };

  return { specialties, loading, error, refetch: fetchSpecialties };
}; 