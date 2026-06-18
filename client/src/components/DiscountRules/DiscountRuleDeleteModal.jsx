import React from 'react';
import './DiscountRuleDeleteModal.css';

export default function DiscountRuleDeleteModal({ isOpen, rule, promotionsCount, onConfirm, onCancel, saving }) {
  if (!isOpen || !rule) return null;

  return (
    <div className="rule-delete-overlay" onClick={onCancel}>
      <div className="rule-delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rule-delete-header">
          <div>
            <h2>Confirmar Eliminación</h2>
            <span className="rule-delete-id">ID: {(rule._id || '').slice(-8).toUpperCase()}</span>
          </div>
          <button className="rule-delete-close" onClick={onCancel}>✕</button>
        </div>

        <div className="rule-delete-body">
          <div className="rule-delete-warning-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div className="rule-delete-section">
            <h3 className="rule-delete-section-title">¿Estás seguro?</h3>
            <p className="rule-delete-message">
              Estás a punto de eliminar la regla <strong>"{rule.name}"</strong> con un descuento del <strong>{rule.percentage}%</strong>.
            </p>
            <p className="rule-delete-hint">
              Esta acción no se puede deshacer.
            </p>
          </div>

          {promotionsCount > 0 && (
            <div className="rule-delete-alert">
              <div className="rule-delete-alert-icon">⚠️</div>
              <div className="rule-delete-alert-content">
                <strong>Atención:</strong> Esta regla está siendo utilizada por{' '}
                <strong>{promotionsCount} {promotionsCount === 1 ? 'promoción' : 'promociones'}</strong>.
                <br />
                Al eliminarla, se desasociará automáticamente de dichas promociones.
              </div>
            </div>
          )}
        </div>

        <div className="rule-delete-footer">
          <button 
            className="rule-delete-btn secondary" 
            onClick={onCancel} 
            disabled={saving}
          >
            Cancelar
          </button>
          <button 
            className="rule-delete-btn danger" 
            onClick={onConfirm} 
            disabled={saving}
          >
            {saving ? 'Eliminando...' : '🗑️ Eliminar Regla'}
          </button>
        </div>
      </div>
    </div>
  );
}