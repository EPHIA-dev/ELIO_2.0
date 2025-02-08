import { useState, useEffect } from 'react';
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
} from '@firebase/firestore';
import { db } from '../services/firebase';

interface Workload {
  days: string[];
  hours: {
    start: string;
    end: string;
  };
}

interface Rate {
  amount: number;
  type: 'hourly' | 'daily' | 'fixed';
  currency: string;
}

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
  workload: Workload;
  rate: Rate;
  periods: string[];
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UseReplacementsOptions {
  pageSize?: number;
  filters?: {
    status?: string;
    establishmentId?: string;
    professionId?: string;
    specialtyId?: string;
  };
}

export const useReplacements = (options: UseReplacementsOptions = {}) => {
  const [replacements, setReplacements] = useState<Replacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const { pageSize = 10, filters } = options;

  const loadReplacements = async (isNextPage = false) => {
    try {
      setLoading(true);
      setError(null);

      let q = query(
        collection(db, 'replacements'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      // Appliquer les filtres
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.establishmentId) {
        q = query(q, where('establishmentId', '==', filters.establishmentId));
      }
      if (filters?.professionId) {
        q = query(q, where('professionId', '==', filters.professionId));
      }
      if (filters?.specialtyId) {
        q = query(q, where('specialtyId', '==', filters.specialtyId));
      }

      // Pagination
      if (isNextPage && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const newReplacements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Replacement[];

      setReplacements(prev => isNextPage ? [...prev, ...newReplacements] : newReplacements);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === pageSize);
    } catch (err) {
      console.error('Erreur lors du chargement des remplacements:', err);
      setError('Erreur lors du chargement des remplacements');
    } finally {
      setLoading(false);
    }
  };

  const getReplacement = async (id: string) => {
    try {
      const replacementDoc = await getDoc(doc(db, 'replacements', id));
      if (replacementDoc.exists()) {
        const data = replacementDoc.data();
        return {
          id: replacementDoc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Replacement;
      }
      return null;
    } catch (err) {
      console.error('Erreur lors de la récupération du remplacement:', err);
      throw new Error('Erreur lors de la récupération du remplacement');
    }
  };

  const getReplacementConversations = async (id: string) => {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('replacementId', '==', id)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastActivity: doc.data().lastActivity?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }));
    } catch (err) {
      console.error('Erreur lors de la récupération des conversations:', err);
      throw new Error('Erreur lors de la récupération des conversations');
    }
  };

  const updateReplacement = async (id: string, data: Partial<Replacement>) => {
    try {
      const replacementRef = doc(db, 'replacements', id);
      await updateDoc(replacementRef, {
        ...data,
        updatedAt: new Date(),
      });
      await loadReplacements();
    } catch (err) {
      console.error('Erreur lors de la mise à jour du remplacement:', err);
      throw new Error('Erreur lors de la mise à jour du remplacement');
    }
  };

  const deleteReplacement = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'replacements', id));
      setReplacements(prev => prev.filter(replacement => replacement.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression du remplacement:', err);
      throw new Error('Erreur lors de la suppression du remplacement');
    }
  };

  useEffect(() => {
    loadReplacements();
  }, [
    filters?.status,
    filters?.establishmentId,
    filters?.professionId,
    filters?.specialtyId,
  ]);

  return {
    replacements,
    loading,
    error,
    hasMore,
    loadMore: () => loadReplacements(true),
    getReplacement,
    getReplacementConversations,
    updateReplacement,
    deleteReplacement,
    refresh: () => loadReplacements(),
  };
}; 