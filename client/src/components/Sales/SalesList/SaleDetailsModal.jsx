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
    
    // Si es un string directo
    if (typeof method === 'string') {
      const map = { 
        'cash': 'Efectivo', 
        'transfer': 'Transferencia', 
        'card': 'Tarjeta' 
      };
      return map[method.toLowerCase()] || method;
    }
    
    // Si es un objeto populado con .name
    if (method?.name) {
      const name = method.name.toLowerCase();
      if (name.includes('cash') || name.includes('efectivo')) return 'Efectivo';
      if (name.includes('crédito') || name.includes('credito')) return 'Tarjeta de Crédito';
      if (name.includes('débito') || name.includes('debito')) return 'Tarjeta de Débito';
      if (name.includes('transfer') || name.includes('transferencia')) return 'Transferencia';
      return method.name;
    }
    
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

  // Calcular totales desglosados
  const calculateBreakdown = () => {
    const subtotalBruto = sale.items?.reduce((sum, i) => sum + (i.price * i.quantity), 0) || 0;
    const descuentosIndividuales = sale.items?.reduce((sum, i) => sum + (i.discount || 0), 0) || 0;
    const descuentoGlobal = (sale.discount || 0) - descuentosIndividuales;
    
    return {
      subtotalBruto,
      descuentosIndividuales,
      descuentoGlobal,
      descuentoTotal: sale.discount || 0
    };
  };

  const breakdown = calculateBreakdown();

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
                <span>Desc. %</span>
                <span>Descuento</span>
                <span>Subtotal</span>
              </div>
              {sale.items?.map((item, index) => {
                const itemSubtotalBruto = item.price * item.quantity;
                const hasDiscount = item.discount_rate > 0 || item.discount > 0;
                
                return (
                  <div key={index} className={`sale-details-item-row ${hasDiscount ? 'with-discount' : ''}`}>
                    <span className="sale-details-item-name">{getProductInfo(item)}</span>
                    <span className="sale-details-item-qty">{item.quantity}</span>
                    <span className="sale-details-item-price">
                      {hasDiscount && (
                        <span className="sale-details-item-price-original">
                          ${formatCurrency(item.price)}
                        </span>
                      )}
                      ${formatCurrency(item.price)}
                    </span>
                    <span className="sale-details-item-discount-rate">
                      {item.discount_rate > 0 ? `${item.discount_rate}%` : '-'}
                    </span>
                    <span className="sale-details-item-discount">
                      {item.discount > 0 ? `-${formatCurrency(item.discount)}` : '-'}
                    </span>
                    <span className="sale-details-item-subtotal">
                      ${formatCurrency(item.subtotal)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totales */}
          <div className="sale-details-section">
            <div className="sale-details-totals">
              <div className="sale-details-total-row">
                <span>Subtotal Bruto:</span>
                <span>${formatCurrency(breakdown.subtotalBruto)}</span>
              </div>
              
              {breakdown.descuentosIndividuales > 0 && (
                <div className="sale-details-total-row discount">
                  <span>Descuentos por producto:</span>
                  <span>-${formatCurrency(breakdown.descuentosIndividuales)}</span>
                </div>
              )}
              
              {breakdown.descuentoGlobal > 0 && (
                <div className="sale-details-total-row discount">
                  <span>Descuento global ({sale.discount_rate || 0}%):</span>
                  <span>-${formatCurrency(breakdown.descuentoGlobal)}</span>
                </div>
              )}
              
              {sale.discount > 0 && (
                <div className="sale-details-total-row discount-total">
                  <span>Total Descuentos:</span>
                  <span>-${formatCurrency(breakdown.descuentoTotal)}</span>
                </div>
              )}
              
              {sale.tax > 0 && (
                <div className="sale-details-total-row">
                  <span>IVA ({sale.tax_rate || 21}%):</span>
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
          {onReprint && (
            <button className="sale-details-btn primary" onClick={() => onReprint(sale)}>
              🖨️ Imprimir Comprobante
            </button>
          )}
        </div>
      </div>
    </div>
  );
}