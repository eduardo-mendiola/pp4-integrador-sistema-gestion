import React from 'react';
import './PromotionDeleteModal.css';

export default function PromotionDeleteModal({ isOpen, promotion, onConfirm, onCancel, saving }) {
  if (!isOpen || !promotion) return null;

  return (
    <div className="promo-delete-overlay" onClick={onCancel}>
      <div className="promo-delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="promo-delete-header">
          <div>
            <h2>Confirmar Eliminación</h2>
            <span className="promo-delete-id">ID: {(promotion._id || '').slice(-8).toUpperCase()}</span>
          </div>
          <button className="promo-delete-close" onClick={onCancel}>✕</button>
        </div>

        <div className="promo-delete-body">
          <div className="promo-delete-warning-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div className="promo-delete-section">
            <h3 className="promo-delete-section-title">¿Estás seguro?</h3>
            <p className="promo-delete-message">
              Estás a punto de eliminar la promoción <strong>"{promotion.name}"</strong>.
            </p>
            <p className="promo-delete-hint">
              Esta acción no se puede deshacer y la promoción dejará de aplicarse inmediatamente.
            </p>
          </div>
        </div>

        <div className="promo-delete-footer">
          <button 
            className="promo-delete-btn secondary" 
            onClick={onCancel} 
            disabled={saving}
          >
            Cancelar
          </button>
          <button 
            className="promo-delete-btn danger" 
            onClick={onConfirm} 
            disabled={saving}
          >
            {saving ? 'Eliminando...' : '🗑️ Eliminar Promoción'}
          </button>
        </div>
      </div>
    </div>
  );
}