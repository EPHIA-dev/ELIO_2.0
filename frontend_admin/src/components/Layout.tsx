import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { routes } from '../config/routes';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="drawer lg:drawer-open">
      <input
        id="drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={isDrawerOpen}
        onChange={(e) => setIsDrawerOpen(e.target.checked)}
      />

      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className="w-full navbar bg-base-100 shadow-lg lg:hidden">
          <div className="flex-none">
            <label htmlFor="drawer" className="btn btn-square btn-ghost drawer-button">
              {isDrawerOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </label>
          </div>
          <div className="flex-1">
            <span className="text-xl font-bold">ELIO Admin</span>
          </div>
        </div>

        {/* Contenu principal */}
        <main className="flex-1 p-6">
          {children || <Outlet />}
        </main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label htmlFor="drawer" className="drawer-overlay"></label>
        <div className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
          {/* Logo */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 mb-4">
            <span className="text-2xl font-bold">ELIO Admin</span>
          </div>

          {/* Menu items */}
          <ul className="menu menu-lg gap-2">
            {routes.map((route) => {
              const Icon = route.icon;
              return (
                <li key={route.path}>
                  <a
                    className={location.pathname === route.path ? 'active' : ''}
                    onClick={() => {
                      navigate(route.path);
                      setIsDrawerOpen(false);
                    }}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    {route.label}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Déconnexion */}
          <div className="mt-auto">
            <button
              className="btn btn-ghost btn-block justify-start gap-2 text-error"
              onClick={handleLogout}
            >
              <FiLogOut className="w-5 h-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 