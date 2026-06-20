import React from 'react';
import './PersonDetails.css';

export default function PersonDetails({ person, onClose, onEdit, canEdit }) {
  if (!person) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFullName = () => {
    return `${person.first_name || ''} ${person.last_name || ''}`.trim() || '-';
  };

  const hasAddress = () => {
    return person.address && (
      person.address.street ||
      person.address.number ||
      person.address.neighborhood ||
      person.address.city
    );
  };

  return (
    <div className="person-details-overlay" onClick={onClose}>
      <div className="person-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="person-details-header">
          <h2>Detalles de Persona</h2>
          <button className="person-details-close" onClick={onClose}>✕</button>
        </div>

        <div className="person-details-body">
          {/* Sección: Datos Personales */}
          <div className="person-details-section">
            <h3 className="person-details-section-title">Datos Personales</h3>
            <div className="person-details-grid">
              <div className="person-details-field">
                <label>DNI</label>
                <div className="person-details-value">{person.dni || '-'}</div>
              </div>

              <div className="person-details-field">
                <label>Nombre Completo</label>
                <div className="person-details-value">{getFullName()}</div>
              </div>

              <div className="person-details-field">
                <label>Email</label>
                <div className="person-details-value">{person.email || '-'}</div>
              </div>

              <div className="person-details-field">
                <label>Teléfono</label>
                <div className="person-details-value">{person.phone || '-'}</div>
              </div>
            </div>
          </div>

          {/* Sección: Dirección */}
          <div className="person-details-section">
            <h3 className="person-details-section-title">Dirección</h3>
            {hasAddress() ? (
              <div className="person-details-grid">
                <div className="person-details-field field-span-2">
                  <label>Calle</label>
                  <div className="person-details-value">{person.address.street || '-'}</div>
                </div>

                <div className="person-details-field">
                  <label>Número</label>
                  <div className="person-details-value">{person.address.number || '-'}</div>
                </div>

                <div className="person-details-field">
                  <label>Barrio</label>
                  <div className="person-details-value">{person.address.neighborhood || '-'}</div>
                </div>

                <div className="person-details-field field-span-2">
                  <label>Ciudad</label>
                  <div className="person-details-value">{person.address.city || '-'}</div>
                </div>
              </div>
            ) : (
              <div className="person-details-empty">Sin dirección registrada</div>
            )}
          </div>

          {/* Sección: Relaciones */}
          <div className="person-details-section">
            <h3 className="person-details-section-title">Relaciones del Sistema</h3>
            <div className="person-details-grid">
              <div className="person-details-field">
                <label>Usuario del Sistema</label>
                <div className="person-details-value">
                  <span className={`person-details-badge ${person.has_user ? 'yes' : 'no'}`}>
                    {person.has_user ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>

              <div className="person-details-field">
                <label>Empleado</label>
                <div className="person-details-value">
                  <span className={`person-details-badge ${person.is_employee ? 'yes' : 'no'}`}>
                    {person.is_employee ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Metadata */}
          <div className="person-details-section">
            <h3 className="person-details-section-title">Información del Registro</h3>
            <div className="person-details-grid">
              <div className="person-details-field">
                <label>Fecha de Creación</label>
                <div className="person-details-value">{formatDate(person.created_at)}</div>
              </div>

              <div className="person-details-field">
                <label>Última Modificación</label>
                <div className="person-details-value">{formatDate(person.updated_at)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="person-details-footer">
          <button 
            type="button" 
            className="person-details-btn secondary" 
            onClick={onClose}
          >
            Cerrar
          </button>
          {canEdit && (
            <button 
              type="button" 
              className="person-details-btn primary"
              onClick={() => {
                onClose();
                onEdit(person);
              }}
            >
              Editar Persona
            </button>
          )}
        </div>
      </div>
    </div>
  );
}