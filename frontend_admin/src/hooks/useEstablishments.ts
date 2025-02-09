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
import { Establishment, Replacement } from '../types';

export const useEstablishments = () => {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    try {
      setLoading(true);
      setError(null);

      let q = query(
        collection(db, 'establishments'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastDoc(lastVisible);
      setHasMore(snapshot.docs.length === 10);

      const establishmentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        doctorIds: doc.data().doctorIds || [],
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Establishment[];

      setEstablishments((prev) =>
        lastDoc ? [...prev, ...establishmentsData] : establishmentsData
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
          doctorIds: data.doctorIds || [],
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

  const getEstablishmentReplacements = async (establishmentId: string): Promise<Replacement[]> => {
    try {
      const q = query(
        collection(db, 'replacements'),
        where('establishmentId', '==', establishmentId)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Replacement[];
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
    loadMore();
  }, []);

  return {
    establishments,
    loading,
    error,
    hasMore,
    loadMore,
    getEstablishment,
    getEstablishmentReplacements,
    updateEstablishment,
    deleteEstablishment,
  };
}; 