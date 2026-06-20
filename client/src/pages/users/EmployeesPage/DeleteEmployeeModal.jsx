import React, { useState } from 'react';
import './DeleteEmployeeModal.css';

export default function DeleteEmployeeModal({ employee, onClose, onConfirm, loading }) {
  const [confirmText, setConfirmText] = useState('');

  if (!employee) return null;

  const getPersonName = () => {
    const person = employee.person_id;
    if (!person) return '-';
    if (typeof person === 'object') {
      return `${person.first_name || ''} ${person.last_name || ''}`.trim() || '-';
    }
    return '-';
  };

  const getPersonDni = () => {
    const person = employee.person_id;
    if (!person || typeof person !== 'object') return '-';
    return person.dni || '-';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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

  const requiredText = `ELIMINAR ${employee.employee_code}`;
  const isConfirmed = confirmText === requiredText;

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
    }
  };

  return (
    <div className="delete-employee-overlay" onClick={onClose}>
      <div className="delete-employee-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-employee-icon">️</div>
        
        <h2 className="delete-employee-title">¿Está seguro que desea eliminar este empleado?</h2>
        
        <p className="delete-employee-text">
          Esta acción es <strong>irreversible</strong>. El empleado y su registro laboral serán eliminados permanentemente del sistema.
        </p>

        <div className="delete-employee-confirm-box">
          <label>
            Para confirmar, escriba <strong>{requiredText}</strong> en el siguiente campo:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`Escriba "${requiredText}"`}
            disabled={loading}
            autoFocus
          />
        </div>

        <div className="delete-employee-info">
          <div className="delete-employee-info-row">
            <span>Código:</span>
            <strong>{employee.employee_code}</strong>
          </div>
          <div className="delete-employee-info-row">
            <span>Nombre:</span>
            <strong>{getPersonName()}</strong>
          </div>
          <div className="delete-employee-info-row">
            <span>DNI:</span>
            <strong>{getPersonDni()}</strong>
          </div>
          <div className="delete-employee-info-row">
            <span>Turno:</span>
            <strong>{formatShift(employee.shift_schedule)}</strong>
          </div>
          <div className="delete-employee-info-row">
            <span>Fecha de Ingreso:</span>
            <strong>{formatDate(employee.hire_date)}</strong>
          </div>
        </div>

        <div className="delete-employee-actions">
          <button 
            type="button" 
            className="delete-employee-btn secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            className="delete-employee-btn danger"
            onClick={handleConfirm}
            disabled={!isConfirmed || loading}
          >
            {loading ? 'Eliminando...' : 'Sí, eliminar empleado'}
          </button>
        </div>
      </div>
    </div>
  );
}