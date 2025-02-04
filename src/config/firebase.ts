// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAsK8uZyPX3DLdtvx45Pcz5H6oe4yWrLhM",
  authDomain: "elio-49720.firebaseapp.com",
  projectId: "elio-49720",
  storageBucket: "elio-49720.firebasestorage.app",
  messagingSenderId: "556914818458",
  appId: "1:556914818458:web:6c303d490f0eb56855ce23",
  measurementId: "G-Q8BHJ3G8G2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configurer la persistance
setPersistence(auth, browserLocalPersistence);

export { auth };
export const db = getFirestore(app);
export { app };
