import { useState, useEffect } from 'react';
import { User, signInWithEmailAndPassword, signOut } from '@firebase/auth';
import { doc, getDoc } from '@firebase/firestore';
import { auth, db } from '../services/firebase';

interface AdminUser extends User {
  isAdmin?: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si l'utilisateur est admin dans Firestore
  const checkAdminRole = async (firebaseUser: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.data();
      
      if (userData?.role === 'admin') {
        setUser({ ...firebaseUser, isAdmin: true });
      } else {
        await signOut(auth);
        setUser(null);
        setError('Accès non autorisé - Compte non administrateur');
      }
    } catch (err) {
      console.error('Erreur lors de la vérification du rôle:', err);
      await signOut(auth);
      setUser(null);
      setError('Erreur lors de la vérification des droits d\'accès');
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          await checkAdminRole(firebaseUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      if (!email.includes('@')) {
        throw new Error('Format d\'email invalide');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await checkAdminRole(userCredential.user);
      
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      if (err.message === 'Format d\'email invalide') {
        setError('Veuillez entrer une adresse email valide');
      } else if (err.code === 'auth/invalid-email') {
        setError('Adresse email invalide');
      } else if (err.code === 'auth/user-not-found') {
        setError('Utilisateur non trouvé');
      } else if (err.code === 'auth/wrong-password') {
        setError('Mot de passe incorrect');
      } else {
        setError('Erreur de connexion');
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
  };
}; 