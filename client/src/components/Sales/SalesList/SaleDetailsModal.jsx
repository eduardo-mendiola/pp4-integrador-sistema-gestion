import React from 'react';
import './SaleDetailsModal.css';

export default function SaleDetailsModal({ sale, onClose, onReprint }) {
  if (!sale) return null;

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

  const getClientName = () => {
    return sale.customer_name || 
           sale.metadata?.customer_name || 
           sale.client_id?.business_name ||
           sale.client_id?.first_name ||
           '-';
  };

  const getClientDocument = () => {
    const client = sale.client_id;
    if (!client) return '-';
    return `${client.document_type || ''}: ${client.document_number || '-'}`;
  };

  const getCashierName = () => {
    const employee = sale.employee_id;
    if (!employee) return '-';
    return employee.username || employee.name || '-';
  };

  const statusConfig = {
    PAID: { label: 'Pagada', color: '#28a745' },
    PENDING: { label: 'Pendiente', color: '#ffc107', textColor: '#333' },
    CANCELLED: { label: 'Anulada', color: '#dc3545' }
  };

  const status = statusConfig[sale.status] || statusConfig.PENDING;

  const getPaymentMethodName = (method) => {
    if (!method) return '-';
    if (typeof method === 'string') return method;
    if (method.name) return method.name;
    return '-';
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
    <div className="sale-details-overlay" onClick={onClose}>
      <div className="sale-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sale-details-header">
          <div>
            <h2>Detalle de Venta</h2>
            <span className="sale-details-id">N° {(sale._id || '').slice(-8).toUpperCase()}</span>
          </div>
          <div className="sale-details-header-actions">
            <span 
              className="sale-details-status-badge"
              style={{ 
                backgroundColor: status.color,
                color: status.textColor || 'white'
              }}
            >
              {status.label}
            </span>
            <button className="sale-details-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="sale-details-body">
          {/* Info General */}
          <div className="sale-details-section">
            <h3 className="sale-details-section-title">Información General</h3>
            <div className="sale-details-grid">
              <div className="sale-details-field">
                <span className="sale-details-field-label">Fecha</span>
                <span className="sale-details-field-value">{formatDate(sale.createdAt || sale.created_at)}</span>
              </div>
              <div className="sale-details-field">
                <span className="sale-details-field-label">Cajero</span>
                <span className="sale-details-field-value">{getCashierName()}</span>
              </div>
            </div>
          </div>

          {/* Cliente */}
          <div className="sale-details-section">
            <h3 className="sale-details-section-title">Cliente</h3>
            <div className="sale-details-grid">
              <div className="sale-details-field">
                <span className="sale-details-field-label">Nombre</span>
                <span className="sale-details-field-value">{getClientName()}</span>
              </div>
              <div className="sale-details-field">
                <span className="sale-details-field-label">Documento</span>
                <span className="sale-details-field-value">{getClientDocument()}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="sale-details-section">
            <h3 className="sale-details-section-title">Productos ({sale.items?.length || 0})</h3>
            <div className="sale-details-items-table">
              <div className="sale-details-items-header">
                <span>Producto</span>
                <span>Cant.</span>
                <span>Precio Unit.</span>
                <span>Subtotal</span>
              </div>
              {sale.items?.map((item, index) => (
                <div key={index} className="sale-details-item-row">
                  <span className="sale-details-item-name">{getProductInfo(item)}</span>
                  <span className="sale-details-item-qty">{item.quantity}</span>
                  <span className="sale-details-item-price">${formatCurrency(item.price)}</span>
                  <span className="sale-details-item-subtotal">${formatCurrency(item.subtotal || item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="sale-details-section">
            <div className="sale-details-totals">
              <div className="sale-details-total-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(sale.subtotal || sale.items?.reduce((sum, i) => sum + (i.subtotal || i.price * i.quantity), 0) || 0)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="sale-details-total-row">
                  <span>Descuento:</span>
                  <span>-${formatCurrency(sale.discount)}</span>
                </div>
              )}
              {sale.tax > 0 && (
                <div className="sale-details-total-row">
                  <span>IVA:</span>
                  <span>${formatCurrency(sale.tax)}</span>
                </div>
              )}
              <div className="sale-details-total-row sale-details-total-final">
                <span>TOTAL:</span>
                <span>${formatCurrency(sale.total)}</span>
              </div>
            </div>
          </div>

          {/* Pagos */}
          {sale.payments && sale.payments.length > 0 && (
            <div className="sale-details-section">
              <h3 className="sale-details-section-title">Pagos</h3>
              <div className="sale-details-payments">
                {sale.payments.map((payment, index) => (
                  <div key={index} className="sale-details-payment-row">
                    <div className="sale-details-payment-info">
                      <span className="sale-details-payment-method">
                        {getPaymentMethodName(payment.method)}
                      </span>
                      {payment.reference && (
                        <span className="sale-details-payment-ref">{payment.reference}</span>
                      )}
                    </div>
                    <span className="sale-details-payment-amount">
                      ${formatCurrency(payment.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata / Motivo de anulación */}
          {sale.metadata?.cancel_reason && (
            <div className="sale-details-section sale-details-cancel-reason">
              <h3 className="sale-details-section-title">Motivo de Anulación</h3>
              <p>{sale.metadata.cancel_reason}</p>
            </div>
          )}
        </div>

        <div className="sale-details-footer">
          <button className="sale-details-btn secondary" onClick={onClose}>
            Cerrar
          </button>
          {sale.status === 'PAID' && onReprint && (
            <button className="sale-details-btn primary" onClick={() => onReprint(sale)}>
              🖨️ Reimprimir Comprobante
            </button>
          )}
        </div>
      </div>
    </div>
  );
}