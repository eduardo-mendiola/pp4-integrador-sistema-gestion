import React from 'react';
import './PaymentMethodModal.css';

const methods = [
  { id: 'cash', label: 'EFECTIVO', icon: '💵', className: 'efectivo' },
  { id: 'credit_card', label: 'TARJETA CRÉDITO', icon: '💳', className: 'tarjeta' },
  { id: 'debit_card', label: 'DÉBITO', icon: '🏦', className: 'debito' },
  { id: 'transfer', label: 'TRANSFERENCIA', icon: '🔄', className: 'transferencia' }
];

export default function PaymentMethodModal({ isOpen, onClose, onSelectMethod, total }) {
  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>Seleccione Método de Pago</h2>
          <button className="payment-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="payment-modal-amount">
          <span>Total a cobrar:</span>
          <span className="payment-modal-amount-value">
            ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="payment-methods-grid">
          {methods.map((method) => (
            <button
              key={method.id}
              className={`payment-method-btn ${method.className}`}
              onClick={() => onSelectMethod(method.id)}
            >
              <span className="payment-method-icon">{method.icon}</span>
              <span className="payment-method-label">{method.label}</span>
            </button>
          ))}
        </div>

        <button className="payment-modal-cancel-btn" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
