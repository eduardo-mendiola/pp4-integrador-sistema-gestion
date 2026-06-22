import React from 'react';
import './CancelSaleConfirmModal.css';

export default function CancelSaleConfirmModal({ sale, onClose, onConfirm }) {
  if (!sale) return null;

  const getClientName = () => {
    return sale.customer_name || 
           sale.metadata?.customer_name || 
           sale.client_id?.business_name ||
           sale.client_id?.first_name ||
           '-';
  };

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

  return (
    <div className="cancel-confirm-overlay" onClick={onClose}>
      <div className="cancel-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cancel-confirm-icon">⚠️</div>
        
        <h2 className="cancel-confirm-title">¿Está seguro que desea anular esta venta?</h2>
        
        <p className="cancel-confirm-text">
          Esta acción es <strong>irreversible</strong>. Una vez anulada, la venta no podrá ser restituida y se reintegrará el stock de los productos involucrados.
        </p>

        <div className="cancel-confirm-info">
          <div className="cancel-confirm-info-row">
            <span>N° Venta:</span>
            <strong>{(sale._id || '').slice(-8).toUpperCase()}</strong>
          </div>
          <div className="cancel-confirm-info-row">
            <span>Fecha:</span>
            <strong>{formatDate(sale.createdAt || sale.created_at)}</strong>
          </div>
          <div className="cancel-confirm-info-row">
            <span>Cliente:</span>
            <strong>{getClientName()}</strong>
          </div>
          <div className="cancel-confirm-info-row">
            <span>Total:</span>
            <strong className="cancel-confirm-total">
              ${(sale.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

        <div className="cancel-confirm-actions">
          <button 
            type="button" 
            className="cancel-confirm-btn secondary"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            className="cancel-confirm-btn danger"
            onClick={onConfirm}
          >
            Sí, continuar con la anulación
          </button>
        </div>
      </div>
    </div>
  );
}
