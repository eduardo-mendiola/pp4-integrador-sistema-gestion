import React from 'react';
import './EmployeeDetailsModal.css';

export default function EmployeeDetailsModal({ employee, onClose, onEdit }) {
  if (!employee) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPersonInfo = () => {
    const person = employee.person_id;
    if (!person || typeof person !== 'object') return {};
    return {
      name: `${person.first_name || ''} ${person.last_name || ''}`.trim() || '-',
      dni: person.dni || '-',
      email: person.email || '-',
      phone: person.phone || '-',
      address: person.address
    };
  };

  const formatAddress = (address) => {
    if (!address) return '-';
    const { street, number, neighborhood, city } = address;
    const parts = [street, number, neighborhood, city].filter(p => p && p.trim());
    return parts.length > 0 ? parts.join(', ') : '-';
  };

  const formatShift = (shift) => {
    if (!shift) return '-';
    const translations = {
      'morning': 'Mañana',
      'afternoon': 'Tarde',
      'night': 'Noche',
      'full_time': 'Turno Completo',
      'part_time': 'Medio Tiempo'
    };
    return translations[shift] || shift.charAt(0).toUpperCase() + shift.slice(1);
  };

  const isActive = !employee.termination_date;
  const personInfo = getPersonInfo();

  return (
    <div className="employee-details-overlay" onClick={onClose}>
      <div className="employee-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="employee-details-header">
          <div>
            <h2>Detalle de Empleado</h2>
            <span className="employee-details-code">{employee.employee_code || 'Sin código'}</span>
          </div>
          <div className="employee-details-header-actions">
            <span className={`employee-details-status-badge ${isActive ? 'active' : 'inactive'}`}>
              {isActive ? 'Activo' : 'Inactivo'}
            </span>
            <button className="employee-details-close" onClick={onClose}></button>
          </div>
        </div>

        <div className="employee-details-body">
          {/* Información del Empleado */}
          <div className="employee-details-section">
            <h3 className="employee-details-section-title">Información Laboral</h3>
            <div className="employee-details-grid">
              <div className="employee-details-field">
                <span className="employee-details-field-label">Fecha de Ingreso</span>
                <span className="employee-details-field-value">{formatDate(employee.hire_date)}</span>
              </div>
              <div className="employee-details-field">
                <span className="employee-details-field-label">Turno</span>
                <span className="employee-details-field-value">{formatShift(employee.shift_schedule)}</span>
              </div>
              {!isActive && employee.termination_date && (
                <div className="employee-details-field field-span-2">
                  <span className="employee-details-field-label">Fecha de Baja</span>
                  <span className="employee-details-field-value">{formatDate(employee.termination_date)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Persona Asociada */}
          <div className="employee-details-section">
            <h3 className="employee-details-section-title">Datos Personales</h3>
            <div className="employee-details-grid">
              <div className="employee-details-field">
                <span className="employee-details-field-label">Nombre Completo</span>
                <span className="employee-details-field-value">{personInfo.name}</span>
              </div>
              <div className="employee-details-field">
                <span className="employee-details-field-label">DNI</span>
                <span className="employee-details-field-value">{personInfo.dni}</span>
              </div>
              <div className="employee-details-field">
                <span className="employee-details-field-label">Email</span>
                <span className="employee-details-field-value">{personInfo.email}</span>
              </div>
              <div className="employee-details-field">
                <span className="employee-details-field-label">Teléfono</span>
                <span className="employee-details-field-value">{personInfo.phone}</span>
              </div>
              <div className="employee-details-field field-span-2">
                <span className="employee-details-field-label">Dirección</span>
                <span className="employee-details-field-value">{formatAddress(personInfo.address)}</span>
              </div>
            </div>
          </div>

          {/* Usuario Asociado (si existe) */}
          {employee.user && (
            <div className="employee-details-section">
              <h3 className="employee-details-section-title">Credenciales de Acceso</h3>
              <div className="employee-details-grid">
                <div className="employee-details-field">
                  <span className="employee-details-field-label">Usuario</span>
                  <span className="employee-details-field-value">{employee.user.username}</span>
                </div>
                <div className="employee-details-field">
                  <span className="employee-details-field-label">Email</span>
                  <span className="employee-details-field-value">{employee.user.email}</span>
                </div>
                <div className="employee-details-field">
                  <span className="employee-details-field-label">Rol</span>
                  <span className="employee-details-field-value employee-details-role">
                    {employee.user.role_id?.name || 'Sin rol'}
                  </span>
                </div>
                <div className="employee-details-field">
                  <span className="employee-details-field-label">Último Login</span>
                  <span className="employee-details-field-value">{formatDateTime(employee.user.last_login)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="employee-details-footer">
          <button className="employee-details-btn secondary" onClick={onClose}>
            Cerrar
          </button>
          {onEdit && (
            <button className="employee-details-btn primary" onClick={() => onEdit(employee)}>
              Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}