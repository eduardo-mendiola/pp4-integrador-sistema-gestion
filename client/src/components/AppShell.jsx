import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { moduleCards } from '../config/modules.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AppShell() {
  const { user, logout, hasPermission, hasRole } = useAuth();

  const visibleModules = moduleCards.filter((module) => {
    if (module.key === 'dashboard') {
      return true;
    }

    if (module.permission && !hasPermission(module.permission)) {
      return false;
    }

    if (module.allowedRoles && module.allowedRoles.length > 0 && !hasRole(...module.allowedRoles)) {
      return false;
    }

    return true;
  });

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">Planeta Jueguete</div>
          <p className="sidebar-subtitle">Panel operativo</p>
        </div>

        <nav className="nav-links">
          {visibleModules.map((module) => (
            <NavLink key={module.key} to={module.path} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              {module.label}
            </NavLink>
          ))}
        </nav>

        <button type="button" className="secondary-button sidebar-logout" onClick={logout}>
          Cerrar sesión
        </button>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">Sistema de gestión</p>
            <h1>Bienvenido, {user?.username || 'usuario'}</h1>
          </div>

          <div className="user-chip">
            <span>{user?.role_id?.name || 'Sin rol'}</span>
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}