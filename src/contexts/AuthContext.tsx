import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../config/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier s'il y a un utilisateur stocké localement
    const checkStoredUser = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId && auth.currentUser) {
          setUser(auth.currentUser);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la vérification de l'utilisateur stocké:",
          error
        );
      }
    };

    // Écouter les changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await AsyncStorage.setItem("userId", user.uid);
          setUser(user);
        } catch (error) {
          console.error("Erreur lors du stockage de l'ID utilisateur:", error);
        }
      } else {
        try {
          await AsyncStorage.removeItem("userId");
          setUser(null);
        } catch (error) {
          console.error(
            "Erreur lors de la suppression de l'ID utilisateur:",
            error
          );
        }
      }
      setLoading(false);
    });

    checkStoredUser();
    return unsubscribe;
  }, []);

  const signIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
