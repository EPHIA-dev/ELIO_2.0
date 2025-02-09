import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  QueryDocumentSnapshot,
  startAfter,
  serverTimestamp,
} from '@firebase/firestore';
import { db } from '../services/firebase';

export interface Establishment {
  id: string;
  name: string;
  address: string;
  description: string;
  professionIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UseEstablishmentsOptions {
  pageSize?: number;
  filters?: {
    professionId?: string;
  };
}

export const useEstablishments = (options: UseEstablishmentsOptions = {}) => {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const { pageSize = 10, filters } = options;

  const loadEstablishments = async (isNextPage = false) => {
    try {
      setLoading(true);
      setError(null);

      let q = query(
        collection(db, 'establishments'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      if (filters?.professionId) {
        q = query(q, where('professionIds', 'array-contains', filters.professionId));
      }

      if (isNextPage && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastDoc(lastVisible);
      setHasMore(snapshot.docs.length === pageSize);

      const establishmentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Establishment[];

      setEstablishments((prev) =>
        isNextPage ? [...prev, ...establishmentsData] : establishmentsData
      );
    } catch (err) {
      console.error('Erreur lors du chargement des établissements:', err);
      setError('Erreur lors du chargement des établissements');
    } finally {
      setLoading(false);
    }
  };

  const getEstablishment = async (id: string): Promise<Establishment | null> => {
    try {
      const docRef = doc(db, 'establishments', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Establishment;
      }
      return null;
    } catch (err) {
      console.error('Erreur lors du chargement de l\'établissement:', err);
      throw new Error('Erreur lors du chargement de l\'établissement');
    }
  };

  const getEstablishmentReplacements = async (establishmentId: string) => {
    try {
      const snapshot = await getDocs(collection(db, 'replacements'));
      
      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate?.toDate(),
          endDate: doc.data().endDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }))
        .filter(doc => doc.establishmentId === establishmentId)
        .sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
    } catch (err) {
      console.error('Erreur lors du chargement des remplacements:', err);
      throw new Error('Erreur lors du chargement des remplacements');
    }
  };

  const updateEstablishment = async (id: string, data: Partial<Establishment>): Promise<void> => {
    try {
      const docRef = doc(db, 'establishments', id);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(docRef, updateData);
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      throw new Error('Erreur lors de la mise à jour de l\'établissement');
    }
  };

  const deleteEstablishment = async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, 'establishments', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      throw new Error('Erreur lors de la suppression de l\'établissement');
    }
  };

  useEffect(() => {
    loadEstablishments();
  }, [filters?.professionId]);

  return {
    establishments,
    loading,
    error,
    hasMore,
    loadMore: () => loadEstablishments(true),
    getEstablishment,
    getEstablishmentReplacements,
    updateEstablishment,
    deleteEstablishment,
    refresh: () => loadEstablishments(),
  };
}; 