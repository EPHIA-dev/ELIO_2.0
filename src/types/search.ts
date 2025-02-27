export interface HealthcareFacility {
  id: string;
  name: string;
  address: string;
  city: string;
  type: 'facility';
}

export interface City {
  id: string;
  name: string;
  type: 'city';
}

export interface SearchResult {
  id: string;
  name: string;
  address?: string;
  city?: string;
  type: 'facility' | 'city';
}

export interface Specialty {
  id: string;
  name: string;
  category: 'exam' | 'specialty';
  icon?: string;
} 