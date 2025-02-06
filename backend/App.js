import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { API_URL } from './config';

// Initialisation de Firebase (si ce n'est pas déjà fait ailleurs)
const firebaseConfig = {
  // Votre configuration Firebase
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Fonction de connexion
const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Utilisateur connecté:", userCredential.user.email);
    // createUser sera appelé automatiquement grâce à onAuthStateChanged
  } catch (error) {
    console.error("Erreur de connexion:", error);
  }
};

const createUser = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not logged in');
      return;
    }

    const token = await user.getIdToken();
    console.log('Token obtained:', token);

    const response = await fetch(`${API_URL}/create_user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({})
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Écouteur d'état d'authentification
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:', user.email);
    createUser();
  } else {
    console.log('User is signed out');
  }
});

// Exemple d'utilisation
// login('user@example.com', 'password'); 