import Constants from 'expo-constants';
import { BACKEND_URL } from '@env';
import { auth } from './firebase';

// Obtenir l'adresse IP locale pour Expo Go
const getLocalHostAddress = () => {
  if (__DEV__) {
    // En développement, utiliser l'IP du debuggerHost
    const debuggerHost = Constants.expoConfig?.hostUri
      ? Constants.expoConfig.hostUri.split(':')[0]
      : '192.168.1.52'; // IP par défaut si non trouvée
    
    const url = `http://${debuggerHost}:5000`;
    console.log('🔧 Backend URL:', url); // Debug de l'URL
    return url;
  }
  // En production, utiliser l'URL configurée
  return BACKEND_URL;
};

export const API_URL = getLocalHostAddress();

// Fonction utilitaire pour obtenir le token
const getAuthToken = async () => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('No auth token available');
  return token;
};

// Fonction utilitaire pour les appels API
const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  console.log('🌐 Calling API:', `${API_URL}${endpoint}`);

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    console.error('❌ API Error:', await response.text());
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

// Endpoints spécifiques
export const api = {
  // Debug
  ping: async () => {
    try {
      console.log('🏓 Tentative de ping vers:', API_URL);
      const response = await fetch(`${API_URL}/ping`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Ping réussi:', data);
      return data;
    } catch (error) {
      console.error('❌ Ping échoué:', error);
      throw error;
    }
  },

  // Utilisateurs
  createUser: async (userData: any) => {
    return fetchApi('/create_user', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  updateUser: async (userId: string, userData: any) => {
    return fetchApi(`/update_user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  // Recherche
  searchReplacements: async (searchParams: {
    professionId: string;
    establishmentIds: string[];
    specialtyIds?: string[];
    startDate?: string;
    endDate?: string;
  }) => {
    console.log('🔍 Recherche avec paramètres:', searchParams);
    return fetchApi('/search_replacements', {
      method: 'POST',
      body: JSON.stringify(searchParams)
    });
  },

  // Messages
  sendMessage: async (messageData: {
    type: string;
    content: string;
    conversationId: string;
  }) => {
    return fetchApi('/send_message', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  },

  deleteMessage: async (conversationId: string, messageId: string) => {
    return fetchApi(`/delete_message/${conversationId}/${messageId}`, {
      method: 'DELETE'
    });
  }
}; 