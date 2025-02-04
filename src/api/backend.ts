import { BACKEND_URL } from '@env';
import { auth } from '../config/firebase';
import { Timestamp } from 'firebase/firestore';

interface UpdateUserData {
  onboardingStep?: number;
  isProfileComplete?: boolean;
  professionId?: string;
  specialityIds?: string[];
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
}

export const updateUserProfile = async (uid: string, data: UpdateUserData) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('No auth token available');

    const response = await fetch(`${BACKEND_URL}/update_user/${uid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update user profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

interface SearchParams {
  professionId: string;
  establishmentIds: string[];
  specialtyIds: string[];
  startDate: string;
  endDate: string;
}

export const searchReplacements = async (params: SearchParams) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('No auth token available');

    const response = await fetch(`${BACKEND_URL}/search_replacements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to search replacements');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching replacements:', error);
    throw error;
  }
}; 