import React from 'react';
import './ReturnDetailModal.css';

export default function ReturnDetailModal({ returnData, onClose }) {
  if (!returnData) return null;

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

  const formatCurrency = (value) => {
    return (value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
  };

  const getTypeLabel = (type) => {
    const labels = {
      'RETURN': 'Devolución',
      'CREDIT_NOTE': 'Nota de Crédito',
      'EXCHANGE_SAME': 'Cambio (Mismo)',
      'EXCHANGE_OTHER': 'Cambio (Otro)'
    };
    return labels[type] || type;
  };

  const getReasonLabel = (reason) => {
    const labels = {
      'defectuoso': 'Defectuoso',
      'talle_incorrecto': 'Talle incorrecto',
      'opcion_cliente': 'Opción del cliente',
      'no_conforme': 'No conforme',
      'otro': 'Otro'
    };
    return labels[reason] || reason;
  };

  const getProductInfo = (item) => {
    if (item.product) {
      if (typeof item.product === 'object') {
        return item.product.name || 'Producto';
      }
      return 'Producto';
    }
    return item.name || 'Producto';
  };

  return (
    <div className="return-detail-overlay" onClick={onClose}>
      <div className="return-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="return-detail-header">
          <div>
            <h2>Detalle de Operación</h2>
            <span className="return-detail-id">N° {(returnData._id || '').slice(-8).toUpperCase()}</span>
          </div>
          <button className="return-detail-close" onClick={onClose}>✕</button>
        </div>

        <div className="return-detail-body">
          <div className="return-detail-section">
            <h3 className="return-detail-section-title">Información General</h3>
            <div className="return-detail-grid">
              <div className="return-detail-field">
                <span className="return-detail-field-label">Tipo</span>
                <span className="return-detail-field-value">{getTypeLabel(returnData.type)}</span>
              </div>
              <div className="return-detail-field">
                <span className="return-detail-field-label">Fecha</span>
                <span className="return-detail-field-value">{formatDate(returnData.createdAt)}</span>
              </div>
              <div className="return-detail-field">
                <span className="return-detail-field-label">Motivo</span>
                <span className="return-detail-field-value">
                  {getReasonLabel(returnData.reason)}
                  {returnData.reason === 'otro' && returnData.reason_custom && `: ${returnData.reason_custom}`}
                </span>
              </div>
              <div className="return-detail-field">
                <span className="return-detail-field-label">Empleado</span>
                <span className="return-detail-field-value">
                  {returnData.employee_id?.username || returnData.employee_id?.name || '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="return-detail-section">
            <h3 className="return-detail-section-title">Productos Devueltos</h3>
            <div className="return-detail-items">
              {returnData.items?.map((item, index) => (
                <div key={index} className="return-detail-item">
                  <span className="return-detail-item-name">{getProductInfo(item)}</span>
                  <span className="return-detail-item-qty">x{item.quantity}</span>
                  <span className="return-detail-item-price">${formatCurrency(item.price)}</span>
                  <span className="return-detail-item-subtotal">${formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="return-detail-section">
            <div className="return-detail-totals">
              <div className="return-detail-total-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(returnData.subtotal)}</span>
              </div>
              {returnData.discount > 0 && (
                <div className="return-detail-total-row discount">
                  <span>Descuento:</span>
                  <span>-${formatCurrency(returnData.discount)}</span>
                </div>
              )}
              {returnData.tax > 0 && (
                <div className="return-detail-total-row">
                  <span>IVA ({returnData.tax_rate}%):</span>
                  <span>${formatCurrency(returnData.tax)}</span>
                </div>
              )}
              <div className="return-detail-total-row total">
                <span>TOTAL:</span>
                <span>${formatCurrency(returnData.total)}</span>
              </div>
            </div>
          </div>

          {returnData.exchange_items && returnData.exchange_items.length > 0 && (
            <div className="return-detail-section">
              <h3 className="return-detail-section-title">Productos de Cambio</h3>
              <div className="return-detail-items">
                {returnData.exchange_items.map((item, index) => (
                  <div key={index} className="return-detail-item">
                    <span className="return-detail-item-name">{item.name || 'Producto'}</span>
                    <span className="return-detail-item-qty">x{item.quantity}</span>
                    <span className="return-detail-item-price">${formatCurrency(item.price)}</span>
                    <span className="return-detail-item-subtotal">${formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ✅ SECCIÓN: Desglose del Crédito Aplicado (Claro y sin confusiones) */}
          {returnData.metadata?.is_replacement && (
            <div className="return-detail-section">
              <h3 className="return-detail-section-title">Desglose del Cambio</h3>
              <div className="return-detail-totals">
                <div className="return-detail-total-row">
                  <span>Crédito a favor (Neto sin IVA):</span>
                  <span>${formatCurrency(returnData.metadata.credit_applied_net)}</span>
                </div>
                <div className="return-detail-total-row">
                  <span>Crédito a favor (IVA 21%):</span>
                  <span>${formatCurrency(returnData.metadata.credit_applied_tax)}</span>
                </div>
                <div className="return-detail-total-row" style={{ fontWeight: '700', borderTop: '1px solid #e1e8ed', paddingTop: '8px' }}>
                  <span>Total del Crédito a favor:</span>
                  <span>${formatCurrency(returnData.metadata.credit_applied_total)}</span>
                </div>
                
                <div className="return-detail-total-row total" style={{ marginTop: '16px', borderTop: '2px solid #333', paddingTop: '12px' }}>
                  <span>Diferencia final a pagar:</span>
                  <span>${formatCurrency(returnData.difference > 0 ? returnData.difference : 0)}</span>
                </div>

                {returnData.difference <= 0 && (
                  <div className="return-detail-total-row" style={{ color: '#28a745', fontWeight: '700', marginTop: '8px' }}>
                    <span>✓ El crédito cubre el total de la nueva compra</span>
                    <span>$0,00</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="return-detail-footer">
          <button className="return-detail-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}