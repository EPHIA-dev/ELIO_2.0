import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";

interface UserProfile {
  isProfileComplete: boolean;
  onboardingStep: number;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (doc) => {
        if (doc.exists()) {
          setProfile({
            isProfileComplete: doc.data().isProfileComplete,
            onboardingStep: doc.data().onboardingStep,
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching user profile:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { profile, loading };
};
