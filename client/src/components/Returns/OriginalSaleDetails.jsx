import React from 'react';
import './OriginalSaleDetails.css';

export default function OriginalSaleDetails({ 
  sale, 
  returnItems, 
  onUpdateQuantity,
  onToggleSelectionMode,
  selectionMode,
  totals,
  onViewReturnDetail 
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
  const { breakdown } = totals;

  // Obtener devoluciones asociadas
  const returns = sale.return_ids || [];

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

      {/* Operaciones anteriores */}
      {returns.length > 0 && (
        <div className="previous-returns-section">
          <h4>Operaciones Realizadas ({returns.length})</h4>
          <div className="previous-returns-list">
            {returns.map((returnItem, index) => (
              <div key={returnItem._id || index} className="previous-return-item">
                <div className="return-info">
                  <span className="return-type-badge">{returnItem.type}</span>
                  <span className="return-date">
                    {formatDate(returnItem.createdAt)}
                  </span>
                  <span className="return-amount">
                    ${formatCurrency(returnItem.total)}
                  </span>
                </div>
                <button 
                  className="view-return-detail-btn"
                  onClick={() => onViewReturnDetail && onViewReturnDetail(returnItem)}
                  title="Ver detalle"
                >
                  📄
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="original-sale-items-header">
        <h4>Productos Comprados</h4>
        <p className="items-hint">
          {selectionMode === 'full' 
            ? 'Devolución completa por defecto. Haz clic en "Selección Individual" para ajustar cantidades.' 
            : 'Ingresa manualmente la cantidad a devolver de cada producto.'}
        </p>
      </div>

      <div className="original-sale-items">
        {returnItems.map(item => {
          const hasDiscount = item.discount_rate > 0 || item.discount > 0;
          
          return (
            <div key={item.productId} className={`original-sale-item ${selectionMode === 'full' ? 'mode-full' : 'mode-individual'} ${hasDiscount ? 'with-discount' : ''}`}>
              <div className="item-info">
                <div className="item-name">
                  {item.name}
                  {hasDiscount && <span className="item-discount-badge">-{item.discount_rate}%</span>}
                </div>
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
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedItems.length > 0 && breakdown && (
        <div className="return-breakdown">
          <h4>Desglose de la Devolución</h4>
          <div className="breakdown-row">
            <span>Subtotal Bruto:</span>
            <span>${formatCurrency(breakdown.subtotalBruto)}</span>
          </div>
          
          {breakdown.descuentosIndividuales > 0 && (
            <div className="breakdown-row discount">
              <span>Descuentos por producto:</span>
              <span>-${formatCurrency(breakdown.descuentosIndividuales)}</span>
            </div>
          )}
          
          {breakdown.descuentoGlobal > 0 && (
            <div className="breakdown-row discount">
              <span>Descuento global ({sale.discount_rate}%):</span>
              <span>-${formatCurrency(breakdown.descuentoGlobal)}</span>
            </div>
          )}
          
          <div className="breakdown-row">
            <span>Base Imponible:</span>
            <span>${formatCurrency(breakdown.baseImponible)}</span>
          </div>
          
          <div className="breakdown-row">
            <span>IVA ({breakdown.taxRate}%):</span>
            <span>${formatCurrency(breakdown.iva)}</span>
          </div>
          
          <div className="breakdown-row total">
            <span>Total a Devolver:</span>
            <span>${formatCurrency(totals.returnTotal)}</span>
          </div>
        </div>
      )}
    </div>
  );
}