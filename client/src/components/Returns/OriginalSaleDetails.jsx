import React from 'react';
import './OriginalSaleDetails.css';

export default function OriginalSaleDetails({ 
  sale, 
  returnItems, 
  onUpdateQuantity 
}) {
  if (!sale) return null;

  const getInvoiceNumber = () => {
    return (sale._id || '').slice(-8).toUpperCase();
  };

  const getClientName = () => {
    return sale.customer_name || 
           sale.metadata?.customer_name || 
           sale.client_id?.business_name ||
           sale.client_id?.first_name ||
           'Sin nombre';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="original-sale-container">
      <div className="original-sale-header">
        <h3>Factura Original</h3>
        <span className="original-sale-invoice">N° {getInvoiceNumber()}</span>
      </div>

      <div className="original-sale-info">
        <div className="original-sale-info-row">
          <span className="label">Fecha:</span>
          <span className="value">{formatDate(sale.createdAt || sale.created_at)}</span>
        </div>
        <div className="original-sale-info-row">
          <span className="label">Cliente:</span>
          <span className="value">{getClientName()}</span>
        </div>
        <div className="original-sale-info-row">
          <span className="label">Total original:</span>
          <span className="value total">${(sale.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="original-sale-items-header">
        <h4>Productos Comprados</h4>
        <p className="items-hint">Seleccione la cantidad a devolver</p>
      </div>

      <div className="original-sale-items">
        {returnItems.map(item => (
          <div key={item.productId} className={`original-sale-item ${item.quantity > 0 ? 'selected' : ''}`}>
            <div className="item-info">
              <div className="item-name">{item.name}</div>
              <div className="item-price">
                ${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })} c/u
                <span className="item-qty-original">
                  (Compró: {item.maxQuantity})
                </span>
              </div>
            </div>
            <div className="item-controls">
              <label className="quantity-label">Devuelve:</label>
              <div className="quantity-input-wrapper">
                <button 
                  className="qty-btn"
                  onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                  disabled={item.quantity === 0}
                >
                  -
                </button>
                <input
                  type="number"
                  className="quantity-input"
                  value={item.quantity}
                  onChange={(e) => onUpdateQuantity(item.productId, parseInt(e.target.value) || 0)}
                  min="0"
                  max={item.maxQuantity}
                />
                <button 
                  className="qty-btn"
                  onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                  disabled={item.quantity === item.maxQuantity}
                >
                  +
                </button>
              </div>
              {item.quantity > 0 && (
                <div className="item-subtotal">
                  ${item.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}