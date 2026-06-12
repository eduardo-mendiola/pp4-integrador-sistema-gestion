import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { menuConfig } from './menuConfig.js';
import {
  FiHome,
  FiUsers,
  FiShoppingCart,
  FiBox,
  FiTruck,
  FiCreditCard,
  FiGift,
  FiBarChart2,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiLogOut,
} from 'react-icons/fi';
import './Sidebar.css';

// Map de iconos
const iconMap = {
  FiHome,
  FiUsers,
  FiShoppingCart,
  FiBox,
  FiTruck,
  FiCreditCard,
  FiGift,
  FiBarChart2,
  FiSettings,
};

export default function Sidebar() {
  const { user, logout, hasPermission } = useAuth();
  const [expandedMenu, setExpandedMenu] = useState(null);

  // Filtrar menús según permisos
  const visibleMenus = menuConfig.filter((menu) => {
    if (menu.permission === null) return true; // Configuración visible para todos
    return hasPermission(menu.permission);
  });

  const toggleSubmenu = (menuId) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  const handleLogout = async () => {
    await logout();
  };

  const getIcon = (iconName) => {
    const Icon = iconMap[iconName];
    return Icon ? <Icon className="sidebar-icon" /> : null;
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {visibleMenus.map((menu) => (
          <div key={menu.id} className="nav-item-wrapper">
            {menu.submenu ? (
              <button
                className={`nav-item nav-item-parent ${
                  expandedMenu === menu.id ? 'expanded' : ''
                }`}
                onClick={() => toggleSubmenu(menu.id)}
              >
                <div className="nav-item-content">
                  {getIcon(menu.icon)}
                  <span className="nav-label">{menu.label}</span>
                </div>
                <FiChevronDown
                  className={`chevron ${
                    expandedMenu === menu.id ? 'rotated' : ''
                  }`}
                />
              </button>
            ) : (
              <NavLink
                to={menu.path}
                end
                className={({ isActive }) =>
                  `nav-item nav-link ${isActive ? 'active' : ''}`
                }
              >
                <div className="nav-item-content">
                  {getIcon(menu.icon)}
                  <span className="nav-label">{menu.label}</span>
                </div>
              </NavLink>
            )}

            {menu.submenu && expandedMenu === menu.id && (
              <div className="submenu">
                {menu.submenu.map((subitem) => (
                  <NavLink
                    key={subitem.id}
                    to={subitem.path}
                    end
                    className={({ isActive }) =>
                      `submenu-item ${isActive ? 'active' : ''}`
                    }
                  >
                    <FiChevronRight className="submenu-icon" />
                    <span>{subitem.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <p className="user-name">{user?.username || 'Usuario'}</p>
            <p className="user-role">{user?.role_id?.name || 'Sin rol'}</p>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout} title="Cerrar sesión">
          <FiLogOut />
        </button>
      </div>
    </aside>
  );
}
