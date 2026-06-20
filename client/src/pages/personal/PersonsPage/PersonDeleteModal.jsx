import React, { useState } from 'react';
import './PersonDeleteModal.css';

export default function PersonDeleteModal({ person, onClose, onConfirm, loading }) {
  const [confirmText, setConfirmText] = useState('');

  if (!person) return null;

  const getFullName = () => {
    return `${person.first_name || ''} ${person.last_name || ''}`.trim() || '-';
  };

  const requiredText = `ELIMINAR ${person.dni}`;
  const isConfirmed = confirmText === requiredText;

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
    }
  };

  return (
    <div className="delete-person-overlay" onClick={onClose}>
      <div className="delete-person-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-person-icon">⚠️</div>
        
        <h2 className="delete-person-title">¿Está seguro que desea eliminar esta persona?</h2>
        
        <p className="delete-person-text">
          Esta acción es <strong>irreversible</strong>. La persona y todos sus datos serán eliminados permanentemente del sistema.
        </p>

        <div className="delete-person-confirm-box">
          <label>
            Para confirmar, escriba exactamente:
            <br />
            <strong>{requiredText}</strong>
            <br />
            en el campo de abajo:
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

        <div className="delete-person-info">
          <div className="delete-person-info-row">
            <span>DNI:</span>
            <strong>{person.dni}</strong>
          </div>
          <div className="delete-person-info-row">
            <span>Nombre:</span>
            <strong>{getFullName()}</strong>
          </div>
          <div className="delete-person-info-row">
            <span>Email:</span>
            <strong>{person.email || '-'}</strong>
          </div>
          <div className="delete-person-info-row">
            <span>Teléfono:</span>
            <strong>{person.phone || '-'}</strong>
          </div>
        </div>

        <div className="delete-person-actions">
          <button 
            type="button" 
            className="delete-person-btn secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            className="delete-person-btn danger"
            onClick={handleConfirm}
            disabled={!isConfirmed || loading}
          >
            {loading ? 'Eliminando...' : 'Sí, eliminar persona'}
          </button>
        </div>
      </div>
    </div>
  );
}