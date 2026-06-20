import React from 'react';
import './UserDetailsModal.css';


export default function UserDetailsModal({ user, onClose, onEdit }) {
  if (!user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPersonName = () => {
    const person = user.person_id;
    if (!person) return '-';
    if (typeof person === 'object') {
      return `${person.first_name || ''} ${person.last_name || ''}`.trim() || '-';
    }
    return '-';
  };

  const getPersonInfo = () => {
    const person = user.person_id;
    if (!person || typeof person !== 'object') return {};
    return {
      dni: person.dni || '-',
      email: person.email || '-',
      phone: person.phone || '-',
      address: person.address
    };
  };

  const getRoleName = () => {
    const role = user.role_id;
    if (!role) return '-';
    if (typeof role === 'object') {
      return role.name || '-';
    }
    return '-';
  };

  const getRoleDescription = () => {
    const role = user.role_id;
    if (!role || typeof role !== 'object') return '-';
    return role.description || '-';
  };

  const getFallbackRoleName = () => {
    const role = user.fallback_role_id;
    if (!role) return null;
    if (typeof role === 'object') {
      return role.name || null;
    }
    return null;
  };

  const personInfo = getPersonInfo();
  const fallbackRole = getFallbackRoleName();

  const formatAddress = () => {
    if (!personInfo.address) return '-';
    const { street, number, neighborhood, city } = personInfo.address;
    const parts = [street, number, neighborhood, city].filter(p => p && p.trim());
    return parts.length > 0 ? parts.join(', ') : '-';
  };

  return (
    <div className="user-details-overlay" onClick={onClose}>
      <div className="user-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-details-header">
          <div>
            <h2>Detalle de Usuario</h2>
            <span className="user-details-code">{user.code || 'Sin código'}</span>
          </div>
          <div className="user-details-header-actions">
            <span className={`user-details-status-badge ${user.is_active ? 'active' : 'inactive'}`}>
              {user.is_active ? 'Activo' : 'Inactivo'}
            </span>
            <button className="user-details-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="user-details-body">
          {/* Información de la cuenta */}
          <div className="user-details-section">
            <h3 className="user-details-section-title">Información de la Cuenta</h3>
            <div className="user-details-grid">
              <div className="user-details-field">
                <span className="user-details-field-label">Usuario</span>
                <span className="user-details-field-value">{user.username}</span>
              </div>
              <div className="user-details-field">
                <span className="user-details-field-label">Email</span>
                <span className="user-details-field-value">{user.email}</span>
              </div>
              <div className="user-details-field">
                <span className="user-details-field-label">Creado el</span>
                <span className="user-details-field-value">{formatDate(user.created_at || user.createdAt)}</span>
              </div>
              <div className="user-details-field">
                <span className="user-details-field-label">Último Login</span>
                <span className="user-details-field-value">{formatDate(user.last_login)}</span>
              </div>
            </div>
          </div>

          {/* Rol */}
          <div className="user-details-section">
            <h3 className="user-details-section-title">Rol Asignado</h3>
            <div className="user-details-grid">
              <div className="user-details-field">
                <span className="user-details-field-label">Rol</span>
                <span className="user-details-field-value user-details-role">
                  {getRoleName()}
                </span>
              </div>
              <div className="user-details-field">
                <span className="user-details-field-label">Descripción</span>
                <span className="user-details-field-value">{getRoleDescription()}</span>
              </div>
              {fallbackRole && (
                <div className="user-details-field field-span-2">
                  <span className="user-details-field-label">Rol de Respaldo</span>
                  <span className="user-details-field-value">{fallbackRole}</span>
                </div>
              )}
            </div>
          </div>

          {/* Persona asociada */}
          <div className="user-details-section">
            <h3 className="user-details-section-title">Persona Asociada</h3>
            <div className="user-details-grid">
              <div className="user-details-field">
                <span className="user-details-field-label">Nombre Completo</span>
                <span className="user-details-field-value">{getPersonName()}</span>
              </div>
              <div className="user-details-field">
                <span className="user-details-field-label">DNI</span>
                <span className="user-details-field-value">{personInfo.dni}</span>
              </div>
              <div className="user-details-field">
                <span className="user-details-field-label">Email</span>
                <span className="user-details-field-value">{personInfo.email}</span>
              </div>
              <div className="user-details-field">
                <span className="user-details-field-label">Teléfono</span>
                <span className="user-details-field-value">{personInfo.phone}</span>
              </div>
              <div className="user-details-field field-span-2">
                <span className="user-details-field-label">Dirección</span>
                <span className="user-details-field-value">{formatAddress()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="user-details-footer">
          {onEdit && (
            <button className="user-details-btn primary" onClick={() => onEdit(user)}>
              Editar
          </button>
          )}
          <button className="user-details-btn secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}