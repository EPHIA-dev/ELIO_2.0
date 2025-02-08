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

interface UseUsersOptions {
  pageSize?: number;
  filters?: {
    role?: string;
    professionId?: string;
  };
}

export const useUsers = (options: UseUsersOptions = {}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const { pageSize = 10, filters } = options;

  const loadUsers = async (isNextPage = false) => {
    try {
      setLoading(true);
      setError(null);

      let q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      // Appliquer les filtres
      if (filters?.role) {
        q = query(q, where('role', '==', filters.role));
      }
      if (filters?.professionId) {
        q = query(q, where('professionId', '==', filters.professionId));
      }

      // Pagination
      if (isNextPage && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const newUsers = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as User[];

      setUsers(prev => isNextPage ? [...prev, ...newUsers] : newUsers);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === pageSize);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const getUser = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return {
          uid: userDoc.id,
          ...userDoc.data(),
          createdAt: userDoc.data().createdAt?.toDate(),
          updatedAt: userDoc.data().updatedAt?.toDate(),
        } as User;
      }
      return null;
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', err);
      throw new Error('Erreur lors de la récupération de l\'utilisateur');
    }
  };

  const updateUser = async (uid: string, data: Partial<User>) => {
    try {
      const userRef = doc(db, 'users', uid);
      
      // Filtrer les champs undefined
      const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      // Ajouter la date de mise à jour
      cleanData.updatedAt = new Date();

      await updateDoc(userRef, cleanData);
      await loadUsers(); // Recharger la liste
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
      throw new Error('Erreur lors de la mise à jour de l\'utilisateur');
    }
  };

  const deleteUser = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid));
      setUsers(prev => prev.filter(user => user.uid !== uid));
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
      throw new Error('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filters?.role, filters?.professionId]);

  return {
    users,
    loading,
    error,
    hasMore,
    loadMore: () => loadUsers(true),
    getUser,
    updateUser,
    deleteUser,
    refresh: () => loadUsers(),
  };
}; 