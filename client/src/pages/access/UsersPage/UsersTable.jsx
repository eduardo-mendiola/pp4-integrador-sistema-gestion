import React, { useState, useMemo } from 'react';
import './UsersTable.css';

export default function UsersTable({ users, loading, onView, onEdit, onDelete, canEdit, canDelete }) {
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return ' ⇅';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPersonName = (user) => {
    if (!user.person_id) return '-';
    if (typeof user.person_id === 'object') {
      return `${user.person_id.first_name || ''} ${user.person_id.last_name || ''}`.trim() || '-';
    }
    return '-';
  };

  const getRoleName = (user) => {
    if (!user.role_id) return '-';
    if (typeof user.role_id === 'object') {
      return user.role_id.name || '-';
    }
    return '-';
  };

  const sortedUsers = useMemo(() => {
    let sortableItems = [...users];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortConfig.key) {
          case 'code':
            aValue = a.code || '';
            bValue = b.code || '';
            break;
          case 'username':
            aValue = (a.username || '').toLowerCase();
            bValue = (b.username || '').toLowerCase();
            break;
          case 'email':
            aValue = (a.email || '').toLowerCase();
            bValue = (b.email || '').toLowerCase();
            break;
          case 'person':
            aValue = getPersonName(a).toLowerCase();
            bValue = getPersonName(b).toLowerCase();
            break;
          case 'role':
            aValue = getRoleName(a).toLowerCase();
            bValue = getRoleName(b).toLowerCase();
            break;
          case 'is_active':
            aValue = a.is_active ? 1 : 0;
            bValue = b.is_active ? 1 : 0;
            break;
          case 'last_login':
            aValue = a.last_login ? new Date(a.last_login).getTime() : 0;
            bValue = b.last_login ? new Date(b.last_login).getTime() : 0;
            break;
          case 'created_at':
            aValue = new Date(a.created_at || a.createdAt).getTime();
            bValue = new Date(b.created_at || b.createdAt).getTime();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [users, sortConfig]);

  if (loading) {
    return (
      <div className="users-table-loading">
        <div className="users-table-spinner"></div>
        <span>Cargando usuarios...</span>
      </div>
    );
  }

  if (sortedUsers.length === 0) {
    return (
      <div className="users-table-empty">
        <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <p>No hay usuarios registrados</p>
      </div>
    );
  }

  return (
    <div className="users-table-container">
      <table className="users-table">
        <thead>
          <tr>
            <th style={{ width: '50px' }}>#</th>
            <th className="sortable" onClick={() => handleSort('code')} style={{ width: '120px' }}>
              Código {getSortIcon('code')}
            </th>
            <th className="sortable" onClick={() => handleSort('username')}>
              Usuario {getSortIcon('username')}
            </th>
            <th className="sortable" onClick={() => handleSort('email')}>
              Email {getSortIcon('email')}
            </th>
            <th className="sortable" onClick={() => handleSort('person')}>
              Nombre {getSortIcon('person')}
            </th>
            <th className="sortable" onClick={() => handleSort('role')} style={{ width: '150px' }}>
              Rol {getSortIcon('role')}
            </th>
            <th className="sortable" onClick={() => handleSort('is_active')} style={{ textAlign: 'center', width: '100px' }}>
              Estado {getSortIcon('is_active')}
            </th>
            <th className="sortable" onClick={() => handleSort('last_login')} style={{ width: '160px' }}>
              Último Login {getSortIcon('last_login')}
            </th>
            <th className="text-center" style={{ width: '120px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user, index) => (
            <tr key={user._id || index}>
              <td>{index + 1}</td>
              <td>
                <span className="users-code">{user.code || '-'}</span>
              </td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{getPersonName(user)}</td>
              <td>
                <span className="users-role-badge">
                  {getRoleName(user)}
                </span>
              </td>
              <td style={{ textAlign: 'center' }}>
                <span className={`users-status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                  {user.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>{formatDate(user.last_login)}</td>
              <td className="text-center">
                <div className="users-table-actions">
                  <button 
                    className="users-action-btn view"
                    onClick={() => onView(user)}
                    title="Ver detalles"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  {canEdit && (
                    <button 
                      className="users-action-btn edit"
                      onClick={() => onEdit(user)}
                      title="Editar usuario"
                    >
                      ✏️
                    </button>
                  )}
                  {canDelete && (
                    <button 
                      className="users-action-btn delete"
                      onClick={() => onDelete(user)}
                      title="Eliminar usuario"
                    >
                     🗑️
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}