import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
    if (user?.isAdmin) {
      console.log('Utilisateur connecté, redirection vers le dashboard');
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Tentative de connexion avec:', { email });
    
    try {
      await login(email, password);
      // La redirection sera gérée par le useEffect ci-dessus
    } catch (err) {
      console.error('Erreur lors de la connexion:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center mb-6">ELIO Admin</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Mot de passe</span>
              </label>
              <input
                type="password"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full">
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 