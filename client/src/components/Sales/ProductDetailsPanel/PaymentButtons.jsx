import React from 'react';
import './ProductDetailsPanel.css';

export default function PaymentButtons({ onPayment, disabled }) {
  const paymentMethods = [
    { method: 'cash', label: 'EFECTIVO', className: 'efectivo' },
    { method: 'credit_card', label: 'TARJETA', className: 'tarjeta' },
    { method: 'debit_card', label: 'DÉBITO', className: 'debito' },
    { method: 'transfer', label: 'TRANSF.', className: 'transferencia' }
  ];

  return (
    <div className="sales-payment-section">
      <div className="sales-payment-grid">
        {paymentMethods.map(({ method, label, className }) => (
          <button
            key={method}
            className={`sales-payment-btn ${className}`}
            onClick={() => onPayment(method)}
            disabled={disabled}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
