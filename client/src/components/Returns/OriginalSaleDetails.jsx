import React from 'react';
import './OriginalSaleDetails.css';

export default function OriginalSaleDetails({ 
  sale, 
  returnItems, 
  onUpdateQuantity,
  onToggleSelectionMode,
  selectionMode
}) {
  if (!sale) return null;

  const getInvoiceNumber = () => (sale._id || '').slice(-8).toUpperCase();

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

  const formatCurrency = (value) => 
    (value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });

  const selectedItems = returnItems.filter(item => item.quantity > 0);
  const returnTotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const returnNeto = selectedItems.reduce((sum, item) => sum + (item.price / 1.21) * item.quantity, 0);
  const returnIVA = returnTotal - returnNeto;

  return (
    <div className="original-sale-container">
      <div className="original-sale-header">
        <div>
          <h3>Factura Original</h3>
          <span className="original-sale-invoice">N° {getInvoiceNumber()}</span>
        </div>
        <button 
          className="toggle-mode-btn"
          onClick={onToggleSelectionMode}
        >
          {selectionMode === 'full' ? 'Selección Individual' : 'Devolución Total'}
        </button>
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
          <span className="value total">${formatCurrency(sale.total)}</span>
        </div>
      </div>

      <div className="original-sale-items-header">
        <h4>Productos Comprados</h4>
        <p className="items-hint">
          {selectionMode === 'full' 
            ? 'Devolución completa por defecto. Haz clic en "Selección Individual" para ajustar cantidades.' 
            : 'Ingresa manualmente la cantidad a devolver de cada producto.'}
        </p>
      </div>

      <div className="original-sale-items">
        {returnItems.map(item => (
          <div key={item.productId} className={`original-sale-item ${selectionMode === 'full' ? 'mode-full' : 'mode-individual'}`}>
            <div className="item-info">
              <div className="item-name">{item.name}</div>
              <div className="item-price">
                ${formatCurrency(item.price)} c/u
                <span className="item-qty-original">(Compró: {item.maxQuantity})</span>
              </div>
            </div>

            <div className="item-controls">
              {selectionMode === 'full' ? (
                <span className="full-qty-badge">{item.maxQuantity} uds.</span>
              ) : (
                <>
                  <label className="quantity-label">Devuelve:</label>
                  <input
                    type="number"
                    className="quantity-input"
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(item.productId, parseInt(e.target.value) || 0)}
                    min="0"
                    max={item.maxQuantity}
                    placeholder="0"
                  />
                  {item.quantity > 0 && (
                    <div className="item-subtotal">${formatCurrency(item.subtotal)}</div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedItems.length > 0 && (
        <div className="return-breakdown">
          <h4>Desglose de la Devolución</h4>
          <div className="breakdown-row">
            <span>Subtotal Neto:</span>
            <span>${formatCurrency(returnNeto)}</span>
          </div>
          <div className="breakdown-row">
            <span>IVA (21%):</span>
            <span>${formatCurrency(returnIVA)}</span>
          </div>
          <div className="breakdown-row total">
            <span>Total a Devolver:</span>
            <span>${formatCurrency(returnTotal)}</span>
          </div>
        </div>
      )}
    </div>
  );
}