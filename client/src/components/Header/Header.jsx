import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  FiSearch,
  FiClock,
  FiLogOut,
  FiChevronDown,
} from 'react-icons/fi';
import './Header.css';

export default function Header() {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Actualizar reloj cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Buscando:', searchQuery);
      // Aquí iría la lógica de búsqueda
    }
  };

  // Formato de hora y fecha
  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date) => {
    const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    const months = [
      'ENE',
      'FEB',
      'MAR',
      'ABR',
      'MAY',
      'JUN',
      'JUL',
      'AGO',
      'SEP',
      'OCT',
      'NOV',
      'DIC',
    ];
    const day = days[date.getDay()];
    const date_num = date.getDate();
    const month = months[date.getMonth()];

    return `${day} ${date_num} ${month}`;
  };

  return (
    <header className="header">
      <div className="header-brand">
        <img
          className="header-logo"
          src="/images/planeta_juguete_logo.png"
          alt="Planeta Juguete"
        />
        <div className="header-brand-copy">
          <span className="header-brand-title">Planeta Juguete</span>
          <span className="header-brand-subtitle">Panel administrativo</span>
        </div>
      </div>

      <div className="header-left">
        <div className="search-bar">
          <form onSubmit={handleSearch}>
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar items (ej. sku@60)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>
        </div>
      </div>

      <div className="header-right">
        <div className="time-info">
          <FiClock className="time-icon" />
          <div className="time">
            {formatTime(currentTime)}
          </div>
          <div className="date">
            {formatDate(currentTime)}
          </div>
        </div>

        <div className="divider"></div>

        <div className="quick-menu">
          <button className="quick-menu-btn" title="Ventas">
            <span>Ventas</span>
          </button>
          <button className="quick-menu-btn" title="Órdenes">
            <span>Órdenes</span>
          </button>
          <button className="quick-menu-btn" title="Nido">
            <span>Nido</span>
          </button>
        </div>

        <div className="divider"></div>

        <div className="user-section">
          <div className="user-badge">
            <span className="user-name">{user?.username || 'Usuario'}</span>
            <span className="badge-status">CAJERO: 5</span>
          </div>

          <div className="user-menu-wrapper">
            <button
              className="user-menu-toggle"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar-small">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <FiChevronDown className={`chevron ${showUserMenu ? 'open' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="user-menu-item">
                  <p className="user-role">{user?.role_id?.name || 'Sin rol'}</p>
                </div>
                <div className="user-menu-item divider-item"></div>
                <button className="user-menu-item logout-btn" onClick={handleLogout}>
                  <FiLogOut /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
