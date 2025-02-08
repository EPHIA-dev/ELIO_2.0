import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy loading des pages
const Dashboard = React.lazy(() => import('./pages/dashboard'));
const Users = React.lazy(() => import('./pages/users'));
const UserDetails = React.lazy(() => import('./pages/users/[id]'));
const Establishments = React.lazy(() => import('./pages/establishments'));
const EstablishmentDetails = React.lazy(() => import('./pages/establishments/[id]'));
const NewEstablishment = React.lazy(() => import('./pages/establishments/new'));
const Replacements = React.lazy(() => import('./pages/replacements'));
const ReplacementDetails = React.lazy(() => import('./pages/replacements/[id]'));
const NewReplacement = React.lazy(() => import('./pages/replacements/new'));

// Composant de chargement
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-base-200">
    <span className="loading loading-spinner loading-lg text-primary"></span>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-base-200">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        
        <Routes>
          {/* Route de connexion publique */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Routes protégées */}
          <Route element={<Layout />}>
            <Route
              index
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Dashboard />
                </Suspense>
              }
            />
            
            {/* Routes Utilisateurs */}
            <Route path="users">
              <Route
                index
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Users />
                  </Suspense>
                }
              />
              <Route
                path=":id"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <UserDetails />
                  </Suspense>
                }
              />
            </Route>
            
            {/* Routes Établissements */}
            <Route path="establishments">
              <Route
                index
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Establishments />
                  </Suspense>
                }
              />
              <Route
                path="new"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <NewEstablishment />
                  </Suspense>
                }
              />
              <Route
                path=":id"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <EstablishmentDetails />
                  </Suspense>
                }
              />
            </Route>
            
            {/* Routes Remplacements */}
            <Route path="replacements">
              <Route
                index
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Replacements />
                  </Suspense>
                }
              />
              <Route
                path="new"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <NewReplacement />
                  </Suspense>
                }
              />
              <Route
                path=":id"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ReplacementDetails />
                  </Suspense>
                }
              />
            </Route>
          </Route>

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
