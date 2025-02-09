// Types communs pour les dates
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Types pour les statistiques
export interface Trend {
  value: number;
  isPositive: boolean;
}

export interface Stat {
  total: number;
  trend: Trend;
}

export interface DashboardStats {
  users: Stat;
  establishments: Stat;
  activeReplacements: Stat;
  conversations: Stat;
}

// Types pour les filtres
export interface BaseFilters {
  search?: string;
  dateRange?: DateRange;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserFilters extends BaseFilters {
  role?: string;
  professionId?: string;
  isProfileComplete?: boolean;
}

export interface EstablishmentFilters extends BaseFilters {
  professionId?: string;
}

export interface ReplacementFilters extends BaseFilters {
  status?: 'open' | 'closed' | 'cancelled';
  urgency?: 'normal' | 'high';
  establishmentId?: string;
  professionId?: string;
  specialtyId?: string;
}

// Types pour les options de sélection
export interface SelectOption {
  value: string;
  label: string;
}

// Types pour les messages d'erreur
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Types pour les réponses d'API
export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
}

// Types pour la pagination
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
}

// Types pour les actions modales
export type ModalAction = 'create' | 'edit' | 'delete' | 'view';

// Types pour les notifications
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
}

// Types pour les breadcrumbs
export interface BreadcrumbItem {
  label: string;
  path?: string;
}

// Types pour les permissions
export type Permission = 
  | 'users.view'
  | 'users.edit'
  | 'users.delete'
  | 'establishments.view'
  | 'establishments.edit'
  | 'establishments.delete'
  | 'replacements.view'
  | 'replacements.edit'
  | 'replacements.delete';

// Types pour les thèmes
export type Theme = 'light' | 'dark';

export interface Establishment {
  id: string;
  name: string;
  address: string;
  description: string;
  professionIds: string[];
  doctorIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Replacement {
  id: string;
  title: string;
  description: string;
  establishmentId: string;
  professionId: string;
  doctorId?: string;
  startDate: Date;
  endDate: Date;
  status: 'open' | 'closed' | 'cancelled';
  urgency: 'normal' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  lastMessage: string;
  lastActivity: Date;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  uid?: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  photoURL?: string;
  status: 'active' | 'inactive' | 'banned' | 'pending';
  role: 'admin' | 'doctor' | 'establishment';
  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
} 