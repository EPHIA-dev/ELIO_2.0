import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiLogOut } from 'react-icons/fi';
import { routes } from '../../config/routes';

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    console.log('État de l\'authentification:', { user, loading });
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!user?.isAdmin) {
    console.log('Utilisateur non authentifié, redirection vers /login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="drawer lg:drawer-open bg-base-200">
      <input 
        id="drawer" 
        type="checkbox" 
        className="drawer-toggle" 
        checked={isDrawerOpen}
        onChange={(e) => setIsDrawerOpen(e.target.checked)}
      />
      
      <div className="drawer-content flex flex-col min-h-screen">
        {/* Navbar */}
        <div className="navbar bg-base-100 shadow-md lg:hidden">
          <div className="flex-none">
            <label htmlFor="drawer" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </label>
          </div>
          <div className="flex-1">
            <span className="text-xl font-bold">Admin ELIO</span>
          </div>
        </div>

        {/* Contenu principal */}
        <main className="flex-1 p-4 lg:p-8 bg-base-200">
          <div className="container mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
      
      {/* Sidebar */}
      <div className="drawer-side">
        <label htmlFor="drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <aside className="w-80 min-h-screen bg-base-100">
          <div className="p-4 bg-base-100 border-b border-base-200">
            <h1 className="text-2xl font-bold">Admin ELIO</h1>
          </div>
          
          <ul className="menu menu-lg p-4 gap-2">
            {routes.map((route) => {
              const Icon = route.icon;
              return (
                <li key={route.path}>
                  <Link
                    to={route.path}
                    className={`flex items-center gap-2 ${
                      location.pathname === route.path ? 'active' : ''
                    }`}
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {route.label}
                  </Link>
                </li>
              );
            })}
            
            <li className="mt-auto">
              <button
                onClick={logout}
                className="flex items-center gap-2 text-error"
              >
                <FiLogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}; 