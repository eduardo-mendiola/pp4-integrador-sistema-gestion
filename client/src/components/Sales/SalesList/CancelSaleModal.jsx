import React, { useState, useEffect } from 'react';
import './CancelSaleModal.css';

export default function CancelSaleModal({ sale, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (sale) {
      setReason('');
      setError('');
    }
  }, [sale?._id]);
  
  if (!sale) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('El motivo de anulación es obligatorio');
      return;
    }
    
    if (reason.trim().length < 5) {
      setError('El motivo debe tener al menos 5 caracteres');
      return;
    }
    
    onConfirm(sale, reason.trim());
  };

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
    <div className="cancel-sale-overlay" onClick={onClose}>
      <div className="cancel-sale-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cancel-sale-header">
          <div className="cancel-sale-icon">⚠️</div>
          <div>
            <h2>Anular Venta</h2>
            <p className="cancel-sale-subtitle">Esta acción no se puede deshacer</p>
          </div>
          <button className="cancel-sale-close" onClick={onClose}>✕</button>
        </div>

        <div className="cancel-sale-body">
          <div className="cancel-sale-warning">
            <strong>Atención:</strong> Al anular esta venta, se cambiará su estado a "ANULADA" y dejará de contar en las estadísticas.
          </div>

          <div className="cancel-sale-info">
            <div className="cancel-sale-info-row">
              <span>N° Venta:</span>
              <strong>{(sale._id || '').slice(-8).toUpperCase()}</strong>
            </div>
            <div className="cancel-sale-info-row">
              <span>Fecha:</span>
              <strong>{formatDate(sale.createdAt || sale.created_at)}</strong>
            </div>
            <div className="cancel-sale-info-row">
              <span>Cliente:</span>
              <strong>{getClientName()}</strong>
            </div>
            <div className="cancel-sale-info-row">
              <span>Total:</span>
              <strong className="cancel-sale-total">
                ${(sale.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="cancel-sale-field">
              <label>Motivo de anulación *</label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError('');
                }}
                placeholder="Ingrese el motivo por el cual se anula esta venta..."
                rows={4}
                autoFocus
                disabled={loading}
              />
              {error && <span className="cancel-sale-error">{error}</span>}
            </div>

            <div className="cancel-sale-actions">
              <button 
                type="button" 
                className="cancel-sale-btn secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="cancel-sale-btn danger"
                disabled={loading}
              >
                {loading ? 'Anulando...' : 'Confirmar Anulación'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}