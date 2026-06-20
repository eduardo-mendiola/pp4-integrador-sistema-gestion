import React, { useState } from 'react';
import './DeleteUserModal.css';

export default function DeleteUserModal({ user, onClose, onConfirm, loading }) {
  const [confirmText, setConfirmText] = useState('');

  if (!user) return null;

  const requiredText = `ELIMINAR ${user.username}`;
  const isConfirmed = confirmText === requiredText;

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
    }
  };

  const getPersonName = () => {
    const person = user.person_id;
    if (!person) return '-';
    if (typeof person === 'object') {
      return `${person.first_name || ''} ${person.last_name || ''}`.trim() || '-';
    }
    return '-';
  };

  const getRoleName = () => {
    const role = user.role_id;
    if (!role) return '-';
    if (typeof role === 'object') {
      return role.name || '-';
    }
    return '-';
  };

  return (
    <div className="delete-user-overlay" onClick={onClose}>
      <div className="delete-user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-user-icon">
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        
        <h2 className="delete-user-title">¿Está seguro que desea eliminar este usuario?</h2>
        
        <p className="delete-user-text">
          Esta acción es <strong>irreversible</strong>. El usuario y sus credenciales de acceso serán eliminados permanentemente del sistema.
        </p>

        <div className="delete-user-confirm-box">
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

        <div className="delete-user-info">
          <div className="delete-user-info-row">
            <span>Usuario:</span>
            <strong>{user.username}</strong>
          </div>
          <div className="delete-user-info-row">
            <span>Persona:</span>
            <strong>{getPersonName()}</strong>
          </div>
          <div className="delete-user-info-row">
            <span>Rol:</span>
            <strong>{getRoleName()}</strong>
          </div>
          <div className="delete-user-info-row">
            <span>Email:</span>
            <strong>{user.email}</strong>
          </div>
        </div>

        <div className="delete-user-actions">
          <button 
            type="button" 
            className="delete-user-btn secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            className="delete-user-btn danger"
            onClick={handleConfirm}
            disabled={!isConfirmed || loading}
          >
            {loading ? 'Eliminando...' : 'Sí, eliminar usuario'}
          </button>
        </div>
      </div>
    </div>
  );
}