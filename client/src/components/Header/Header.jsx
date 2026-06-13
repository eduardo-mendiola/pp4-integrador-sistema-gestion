import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  FiSearch,
  FiClock,
  FiLogOut,
  FiChevronDown,
  FiBell,
} from 'react-icons/fi';
import SearchResults from './SearchResults.jsx';
import './Header.css';

export default function Header({ onProductSelect }) {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);
  const productsLoaded = useRef(false);

  // Actualizar reloj cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Cargar productos y escuchar evento de actualización
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        
        if (data.success) {
          setAllProducts(data.data);
          productsLoaded.current = true;
        }
      } catch (error) {
        console.error('Error cargando productos:', error);
      }
    };

    // Cargar al inicio
    loadProducts();

    // Escuchar evento de actualización de productos
    const handleProductsUpdate = () => {
      console.log('🔄 Actualizando productos en Header...');
      loadProducts();
    };

    window.addEventListener('productsUpdated', handleProductsUpdate);

    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdate);
    };
  }, []);

  // Cerrar menús al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
      if (!event.target.closest('.user-menu-wrapper')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const searchProducts = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    const filtered = allProducts.filter(product => {
      if (product.sku?.toLowerCase().includes(lowerQuery)) return true;
      if (product.name?.toLowerCase().includes(lowerQuery)) return true;
      if (product.category?.name?.toLowerCase().includes(lowerQuery)) return true;
      return false;
    });

    setSearchResults(filtered.slice(0, 10));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    setIsSearching(true);

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      searchProducts(value);
      setIsSearching(false);
    }, 300);
  };

  const handleSelectProduct = (product) => {
    if (onProductSelect) {
      onProductSelect(product);
    }
    setSearchResults([]);
    setSearchQuery('');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date) => {
    const days = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const day = days[date.getDay()];
    const date_num = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${date_num} ${month} ${year}`;
  };

  const userBadge = user?.role_id?.name === 'user' 
    ? 'CAJA: 1' 
    : user?.role_id?.name?.toUpperCase() || 'SIN ROL';

  return (
    <header className="header">
      {/* Logo */}
      <div className="header-logo-wrapper">
        <img
          className="header-logo"
          src="/images/planeta_juguete_logo2.png"
          alt="Planeta Juguete"
        />
      </div>

      {/* Barra de búsqueda */}
      <div className="header-search" ref={searchRef}>
        <form onSubmit={(e) => e.preventDefault()} className="search-form">
          <input
            type="text"
            placeholder="Buscar items (ej. sku660)..."
            value={searchQuery}
            onChange={handleInputChange}
            className="search-input"
          />
          <button type="submit" className="search-button">
            <FiSearch />
          </button>
        </form>

        {searchResults.length > 0 && (
          <SearchResults
            results={searchResults}
            onSelect={handleSelectProduct}
            onClose={() => setSearchResults([])}
          />
        )}

        {isSearching && (
          <div className="search-loading">Buscando...</div>
        )}

        {searchQuery && !isSearching && searchResults.length === 0 && (
          <div className="search-no-results">
            No se encontraron resultados
          </div>
        )}
      </div>

      {/* Sección derecha */}
      <div className="header-right">
        <div className="time-info">
          <FiClock className="time-icon" />
          <div className="time-content">
            <div className="time">{formatTime(currentTime)}</div>
            <div className="date">{formatDate(currentTime)}</div>
          </div>
        </div>

        {user?.role_id?.name && (
          <div className="cajero-badge">
            {userBadge}
          </div>
        )}

        <button className="notification-btn" title="Notificaciones">
          <FiBell className="notification-icon" />
          <span className="notification-badge">0</span>
        </button>

        <div className="user-menu-wrapper">
          <button
            className="user-menu-toggle"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <span className="user-name-header">
              {user?.username || 'Usuario'}
            </span>
            <FiChevronDown className={`chevron ${showUserMenu ? 'open' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="user-menu-dropdown">
              <div className="user-menu-header">
                <p className="user-role">{user?.role_id?.name || 'Sin rol'}</p>
                <p className="user-email">{user?.email || ''}</p>
              </div>
              <div className="user-menu-item divider-item"></div>
              <button className="user-menu-item logout-btn" onClick={handleLogout}>
                <FiLogOut /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}