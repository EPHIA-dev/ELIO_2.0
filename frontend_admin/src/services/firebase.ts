import { initializeApp } from '@firebase/app';
import { getFirestore, collection } from '@firebase/firestore';
import { getAuth } from '@firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAsK8uZyPX3DLdtvx45Pcz5H6oe4yWrLhM",
  authDomain: "elio-49720.firebaseapp.com",
  projectId: "elio-49720",
  storageBucket: "elio-49720.firebasestorage.app",
  messagingSenderId: "556914818458",
  appId: "1:556914818458:web:6c303d490f0eb56855ce23",
  measurementId: "G-Q8BHJ3G8G2",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Collections references
export const usersRef = collection(db, 'users');
export const establishmentsRef = collection(db, 'establishments');
export const replacementsRef = collection(db, 'replacements');
export const conversationsRef = collection(db, 'conversations'); 