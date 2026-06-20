import React from 'react';
import { permissionCategories, permissionLabels } from './permissionsConfig';
import './RoleDetailsModal.css';

export default function RoleDetailsModal({ role, onClose, onEdit }) {
  if (!role) return null;

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

  const getPermissionsByCategory = () => {
    return permissionCategories.map(category => {
      const selected = category.permissions.filter(p => role.permissions?.includes(p));
      return {
        ...category,
        selected,
        allSelected: selected.length === category.permissions.length
      };
    }).filter(cat => cat.selected.length > 0);
  };

  const categoriesWithPermissions = getPermissionsByCategory();

  return (
    <div className="role-details-overlay" onClick={onClose}>
      <div className="role-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="role-details-header">
          <div>
            <h2>Detalle de Rol</h2>
            <span className="role-details-name">{role.name}</span>
          </div>
          <div className="role-details-header-actions">
            <span className={`role-details-status-badge ${role.is_active ? 'active' : 'inactive'}`}>
              {role.is_active ? 'Activo' : 'Inactivo'}
            </span>
            <button className="role-details-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="role-details-body">
          {/* Información General */}
          <div className="role-details-section">
            <h3 className="role-details-section-title">Información General</h3>
            <div className="role-details-grid">
              <div className="role-details-field">
                <span className="role-details-field-label">Nombre</span>
                <span className="role-details-field-value">{role.name}</span>
              </div>
              <div className="role-details-field">
                <span className="role-details-field-label">Descripción</span>
                <span className="role-details-field-value">{role.description || '-'}</span>
              </div>
              <div className="role-details-field">
                <span className="role-details-field-label">Total de Permisos</span>
                <span className="role-details-field-value role-details-permissions-count">
                  {role.permissions?.length || 0}
                </span>
              </div>
              <div className="role-details-field">
                <span className="role-details-field-label">Creado el</span>
                <span className="role-details-field-value">{formatDate(role.created_at || role.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Permisos por Categoría */}
          <div className="role-details-section">
            <h3 className="role-details-section-title">Permisos Asignados</h3>
            
            {categoriesWithPermissions.length === 0 ? (
              <div className="role-details-no-permissions">
                Este rol no tiene permisos asignados
              </div>
            ) : (
              <div className="role-details-categories">
                {categoriesWithPermissions.map(category => (
                  <div key={category.id} className={`role-details-category ${category.allSelected ? 'all-selected' : ''}`}>
                    <div className="role-details-category-header">
                      <h4 className="role-details-category-title">{category.label}</h4>
                      <span className="role-details-category-count">
                        {category.selected.length} / {category.permissions.length}
                      </span>
                    </div>
                    <div className="role-details-permissions-list">
                      {category.permissions.map(permission => {
                        const isSelected = role.permissions?.includes(permission);
                        return (
                          <span 
                            key={permission} 
                            className={`role-details-permission-tag ${isSelected ? 'selected' : 'not-selected'}`}
                          >
                            {permissionLabels[permission] || permission}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="role-details-footer">
          <button className="role-details-btn secondary" onClick={onClose}>
            Cerrar
          </button>
          {onEdit && (
            <button className="role-details-btn primary" onClick={() => onEdit(role)}>
              Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}