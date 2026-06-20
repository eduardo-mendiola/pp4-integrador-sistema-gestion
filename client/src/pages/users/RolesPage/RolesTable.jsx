import React, { useState, useMemo } from 'react';
import './RolesTable.css';

export default function RolesTable({ roles, loading, onView, onEdit, onDelete, canEdit, canDelete }) {
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
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const sortedRoles = useMemo(() => {
    let sortableItems = [...roles];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortConfig.key) {
          case 'name':
            aValue = (a.name || '').toLowerCase();
            bValue = (b.name || '').toLowerCase();
            break;
          case 'description':
            aValue = (a.description || '').toLowerCase();
            bValue = (b.description || '').toLowerCase();
            break;
          case 'permissions_count':
            aValue = a.permissions?.length || 0;
            bValue = b.permissions?.length || 0;
            break;
          case 'is_active':
            aValue = a.is_active ? 1 : 0;
            bValue = b.is_active ? 1 : 0;
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
  }, [roles, sortConfig]);

  if (loading) {
    return (
      <div className="roles-table-loading">
        <div className="roles-table-spinner"></div>
        <span>Cargando roles...</span>
      </div>
    );
  }

  if (sortedRoles.length === 0) {
    return (
      <div className="roles-table-empty">
        <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p>No hay roles registrados</p>
      </div>
    );
  }

  return (
    <div className="roles-table-container">
      <table className="roles-table">
        <thead>
          <tr>
            <th style={{ width: '50px' }}>#</th>
            <th className="sortable" onClick={() => handleSort('name')}>
              Nombre {getSortIcon('name')}
            </th>
            <th className="sortable" onClick={() => handleSort('description')}>
              Descripción {getSortIcon('description')}
            </th>
            <th className="sortable" onClick={() => handleSort('permissions_count')} style={{ textAlign: 'center', width: '120px' }}>
              Permisos {getSortIcon('permissions_count')}
            </th>
            <th className="sortable" onClick={() => handleSort('is_active')} style={{ textAlign: 'center', width: '100px' }}>
              Estado {getSortIcon('is_active')}
            </th>
            <th className="sortable" onClick={() => handleSort('created_at')} style={{ width: '130px' }}>
              Creado {getSortIcon('created_at')}
            </th>
            <th className="text-center" style={{ width: '120px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedRoles.map((role, index) => (
            <tr key={role._id || index}>
              <td>{index + 1}</td>
              <td>
                <span className="roles-name">{role.name || '-'}</span>
              </td>
              <td>{role.description || '-'}</td>
              <td style={{ textAlign: 'center' }}>
                <span className="roles-permissions-count">
                  {role.permissions?.length || 0}
                </span>
              </td>
              <td style={{ textAlign: 'center' }}>
                <span className={`roles-status-badge ${role.is_active ? 'active' : 'inactive'}`}>
                  {role.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>{formatDate(role.created_at || role.createdAt)}</td>
              <td className="text-center">
                <div className="roles-table-actions">
                  <button 
                    className="roles-action-btn view"
                    onClick={() => onView(role)}
                    title="Ver detalles"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  {canEdit && (
                    <button 
                      className="roles-action-btn edit"
                      onClick={() => onEdit(role)}
                      title="Editar rol"
                    >
                      ✏️
                    </button>
                  )}
                  {canDelete && (
                    <button 
                      className="roles-action-btn delete"
                      onClick={() => onDelete(role)}
                      title="Eliminar rol"
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