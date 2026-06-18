import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  if (!loading && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page-bg">
      <div className="login-container">
        
        <div className="login-sidebar">
          <div className="sidebar-content">
            <div className="circle-logo">
              <h2>Tecno<span>Flow</span><span className="registered-symbol">®</span></h2>
            </div>
          </div>
          
          <div className="sidebar-footer">
            <div className="footer-bottom-content">
              <h3>
                Tecnova<span className="registered-symbol">®</span>
              </h3>
              <p>Solutions</p>
            </div>
          </div>
        </div>

        <section className="login-card">
          {/* Logo y Título */}
          <img src="/images/planeta_juguete_logo.png" alt="Logo" style={{ width: '12.5rem', margin: '1rem auto 2rem' }} />
          {/* <h1 className="brand-name">JUGUETES MÁGICOS</h1> */}

          <div className="login-header text-center">
            <h2>Ingreso a (nombre de la app)</h2>
            <p>Plataforma de gestión POS.</p>
          </div>

          {/* Formulario */}
          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                className="form-control custom-input"
                placeholder="Usuario o Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control custom-input"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span 
                  className="position-absolute top-50 end-0 translate-middle-y me-3"
                  style={{ cursor: 'pointer', color: '#6c757d', transform: 'translateY(-60%)' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                </span>
              </div>

              <a href="#" className="forgot-link">¿Olvidaste tu Contraseña?</a>

              <button type="submit" className="btn btn-ingresar w-100" disabled={submitting}>
                {submitting ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>

            {error && <div className="alert alert-danger mt-3 py-1 small text-center">{error}</div>}
          </div>

          {/* Footer */}
          <footer className="login-footer">
            <p className="mb-1">Términos de Servicio y Privacidad</p>
            <div className="d-flex align-items-center justify-content-center gap-1">
              <span>Powered by</span>
              <img src="/images/aws.svg" alt="AWS" style={{ height: '1.5rem' }} />
            </div>
          </footer>

        </section>
      </div>
      
    </div>
  );
}
