import React, { useState } from 'react';
import './DeleteRoleModal.css';

export default function DeleteRoleModal({ role, onClose, onConfirm, loading }) {
  const [confirmText, setConfirmText] = useState('');

  if (!role) return null;

  const requiredText = `ELIMINAR ${role.name}`;
  const isConfirmed = confirmText === requiredText;

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
    }
  };

  return (
    <div className="delete-role-overlay" onClick={onClose}>
      <div className="delete-role-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-role-icon">️</div>
        
        <h2 className="delete-role-title">¿Está seguro que desea eliminar este rol?</h2>
        
        <p className="delete-role-text">
          Esta acción es <strong>irreversible</strong>. Los usuarios asignados a este rol perderán sus permisos y deberán ser reasignados.
        </p>

        <div className="delete-role-confirm-box">
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

        <div className="delete-role-info">
          <div className="delete-role-info-row">
            <span>Nombre:</span>
            <strong>{role.name}</strong>
          </div>
          <div className="delete-role-info-row">
            <span>Descripción:</span>
            <strong>{role.description || '-'}</strong>
          </div>
          <div className="delete-role-info-row">
            <span>Permisos:</span>
            <strong>{role.permissions?.length || 0} permisos asignados</strong>
          </div>
          <div className="delete-role-info-row">
            <span>Estado:</span>
            <strong className={role.is_active ? 'active' : 'inactive'}>
              {role.is_active ? 'Activo' : 'Inactivo'}
            </strong>
          </div>
        </div>

        <div className="delete-role-actions">
          <button 
            type="button" 
            className="delete-role-btn secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            className="delete-role-btn danger"
            onClick={handleConfirm}
            disabled={!isConfirmed || loading}
          >
            {loading ? 'Eliminando...' : 'Sí, eliminar rol'}
          </button>
        </div>
      </div>
    </div>
  );
}