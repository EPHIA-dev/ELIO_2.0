import { FiHome, FiUsers, FiBookmark, FiCalendar } from 'react-icons/fi';

export const routes = [
  {
    path: '/',
    label: 'Dashboard',
    icon: FiHome,
  },
  {
    path: '/users',
    label: 'Utilisateurs',
    icon: FiUsers,
  },
  {
    path: '/establishments',
    label: 'Établissements',
    icon: FiBookmark,
  },
  {
    path: '/replacements',
    label: 'Remplacements',
    icon: FiCalendar,
  },
] as const;

export type RoutePath = typeof routes[number]['path']; 