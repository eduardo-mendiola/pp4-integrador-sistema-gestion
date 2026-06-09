import React from 'react';
import './SalesFooter.css';

export default function SalesFooter({ totals, itemsCount, loading, onCancel, onPay }) {
  return (
    <div className="sales-footer">
      <div className="sales-totals-info">
        <div className="sales-total-item">
          <div className="sales-total-label">
            Descuento: {totals.discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <div className="sales-total-label">
            Impuesto (IVA): {totals.tax.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="sales-total-item">
          <div className="sales-total-label">
            Subtotal: {totals.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="sales-total-item">
          <div className="sales-total-label">
            TOTAL <span className="sales-total-badge">{itemsCount} ITEMS</span>
          </div>
          <div className="sales-total-value main">
            ${totals.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
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
          $ PAGAR
        </button>
      </div>
    </div>
  );
}