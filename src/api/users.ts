import {
  doc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

interface CreateUserData {
  uid: string;
  email: string;
}

interface UpdateUserData {
  onboardingStep?: number;
  isProfileComplete?: boolean;
  professionId?: string;
  specialityIds?: string[];
  firstName?: string;
  lastName?: string;
  birthDate?: Timestamp;
}

export const createUserDocument = async ({ uid, email }: CreateUserData) => {
  try {
    const timestamp = serverTimestamp();
    await setDoc(doc(db, "users", uid), {
      email,
      createdAt: timestamp,
      updatedAt: timestamp,
      role: "user",
      isProfileComplete: false,
      onboardingStep: 0,
    });
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, data: UpdateUserData) => {
  try {
    await updateDoc(doc(db, "users", uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};
