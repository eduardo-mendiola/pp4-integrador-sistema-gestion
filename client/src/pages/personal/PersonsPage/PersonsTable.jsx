import React, { useState, useMemo } from 'react';
import './PersonsTable.css';

export default function PersonsTable({ persons, loading, onView, onEdit, onDelete, canEdit, canDelete }) {
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

  const getFullName = (person) => {
    return `${person.first_name || ''} ${person.last_name || ''}`.trim() || '-';
  };

  const hasUser = (person) => {
    return person.has_user || Boolean(person.user_id || person.user);
  };

  const isEmployee = (person) => {
    return person.is_employee || Boolean(person.employee_id || person.employee);
  };

  const sortedPersons = useMemo(() => {
    let sortableItems = [...persons];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortConfig.key) {
          case 'dni':
            aValue = (a.dni || '').toString();
            bValue = (b.dni || '').toString();
            break;
          case 'name':
            aValue = getFullName(a).toLowerCase();
            bValue = getFullName(b).toLowerCase();
            break;
          case 'email':
            aValue = (a.email || '').toLowerCase();
            bValue = (b.email || '').toLowerCase();
            break;
          case 'phone':
            aValue = (a.phone || '').toLowerCase();
            bValue = (b.phone || '').toLowerCase();
            break;
          case 'has_user':
            aValue = hasUser(a) ? 1 : 0;
            bValue = hasUser(b) ? 1 : 0;
            break;
          case 'is_employee':
            aValue = isEmployee(a) ? 1 : 0;
            bValue = isEmployee(b) ? 1 : 0;
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
  }, [persons, sortConfig]);

  if (loading) {
    return (
      <div className="persons-table-loading">
        <div className="persons-table-spinner"></div>
        <span>Cargando personas...</span>
      </div>
    );
  }

  if (sortedPersons.length === 0) {
    return (
      <div className="persons-table-empty">
        <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <p>No hay personas registradas</p>
      </div>
    );
  }

  return (
    <div className="persons-table-container">
      <table className="persons-table">
        <thead>
          <tr>
            <th style={{ width: '50px' }}>#</th>
            <th className="sortable" onClick={() => handleSort('dni')} style={{ width: '120px' }}>
              DNI {getSortIcon('dni')}
            </th>
            <th className="sortable" onClick={() => handleSort('name')}>
              Nombre {getSortIcon('name')}
            </th>
            <th className="sortable" onClick={() => handleSort('email')}>
              Email {getSortIcon('email')}
            </th>
            <th className="sortable" onClick={() => handleSort('phone')} style={{ width: '140px' }}>
              Teléfono {getSortIcon('phone')}
            </th>
            <th className="sortable" onClick={() => handleSort('has_user')} style={{ textAlign: 'center', width: '110px' }}>
              Usuario {getSortIcon('has_user')}
            </th>
            <th className="sortable" onClick={() => handleSort('is_employee')} style={{ textAlign: 'center', width: '120px' }}>
              Empleado {getSortIcon('is_employee')}
            </th>
            <th className="text-center" style={{ width: '120px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedPersons.map((person, index) => (
            <tr key={person._id || index}>
              <td>{index + 1}</td>
              <td>
                <span className="persons-dni">{person.dni || '-'}</span>
              </td>
              <td>{getFullName(person)}</td>
              <td>{person.email || '-'}</td>
              <td>{person.phone || '-'}</td>
              <td style={{ textAlign: 'center' }}>
                <span className={`persons-relation-badge ${hasUser(person) ? 'yes' : 'no'}`}>
                  {hasUser(person) ? 'Sí' : 'No'}
                </span>
              </td>
              <td style={{ textAlign: 'center' }}>
                <span className={`persons-relation-badge ${isEmployee(person) ? 'yes' : 'no'}`}>
                  {isEmployee(person) ? 'Sí' : 'No'}
                </span>
              </td>
              <td className="text-center">
                <div className="persons-table-actions">
                  <button 
                    className="persons-action-btn view"
                    onClick={() => onView(person)}
                    title="Ver detalles"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  {canEdit && (
                    <button 
                      className="persons-action-btn edit"
                      onClick={() => onEdit(person)}
                      title="Editar persona"
                    >
                      ✏️
                    </button>
                  )}
                  {canDelete && !hasUser(person) && !isEmployee(person) && (
                    <button 
                      className="persons-action-btn delete"
                      onClick={() => onDelete(person)}
                      title="Eliminar persona"
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