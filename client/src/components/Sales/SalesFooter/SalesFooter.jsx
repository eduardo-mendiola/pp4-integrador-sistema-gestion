import React from 'react';
import DiscountButton from '../DiscountButton/DiscountButton';
import './SalesFooter.css';

export default function SalesFooter({ totals, itemsCount, loading, onCancel, onPay, discountRate, onDiscountChange }) {
  const formatCurrency = (value) => 
    value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="sales-footer">
      <div className="sales-totals-info">
        <div className="sales-total-item">
          <div className="sales-total-label">Subtotal</div>
          <div className="sales-total-value">${formatCurrency(totals.subtotal)}</div>
        </div>

        <div className="sales-total-item">
          <div className="sales-total-label">Subtotal con desc.</div>
          <div className="sales-total-value">${formatCurrency(totals.subtotal - totals.discount)}</div>
        </div>
        
        <div className="sales-total-item">
          <div className="sales-total-label">IVA ({totals.tax_rate}%)</div>
          <div className="sales-total-value">${formatCurrency(totals.tax)}</div>
        </div>
        
        {/* Botón de descuento antes del total */}
        <DiscountButton 
          discountRate={discountRate}
          onDiscountChange={onDiscountChange}
        />
        
        {/* Si hay descuento, mostrar el cálculo */}
        {totals.discount > 0 && (
          <div className="sales-total-item discount">
            <div className="sales-total-label">
              Descuento ({totals.discount_rate}%)
            </div>
            <div className="sales-total-value">-${formatCurrency(totals.discount)}</div>
          </div>
        )}
        
        <div className="sales-total-item main">
          <div className="sales-total-label">
            TOTAL <span className="sales-total-badge">{itemsCount} ITEMS</span>
          </div>
          <div className="sales-total-value main">
            ${formatCurrency(totals.total)}
          </div>
        </div>
      </div>

      <div className="sales-actions">
        <button 
          className="sales-btn sales-btn-cancel"
          onClick={onCancel}
          disabled={loading || itemsCount === 0}
        >
          <span>⊘</span>
          CANCELAR
        </button>
        <button 
          className="sales-btn sales-btn-pay"
          onClick={onPay}
          disabled={loading || itemsCount === 0}
        >
          $ COBRAR
        </button>
      </div>
    </div>
  );
}
