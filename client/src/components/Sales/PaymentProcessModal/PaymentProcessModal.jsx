import React from 'react';
import CashPaymentForm from './CashPaymentForm';
import CardPaymentForm from './CardPaymentForm';
import TransferPaymentForm from './TransferPaymentForm';
import './PaymentProcessModal.css';

const methodConfig = {
  cash: { title: 'Pago en Efectivo', icon: '💵' },
  credit_card: { title: 'Pago con Tarjeta de Crédito', icon: '💳' },
  debit_card: { title: 'Pago con Tarjeta de Débito', icon: '🏦' },
  transfer: { title: 'Transferencia Bancaria', icon: '' }
};

export default function PaymentProcessModal({
  isOpen,
  method,
  total,
  client,
  items,
  loading,
  onClose,
  onProcess
}) {
  if (!isOpen || !method) return null;

  const config = methodConfig[method] || methodConfig.cash;

  const renderForm = () => {
    switch (method) {
      case 'cash':
        return (
          <CashPaymentForm
            total={total}
            loading={loading}
            onProcess={onProcess}
            onCancel={onClose}
          />
        );
      case 'credit_card':
      case 'debit_card':
        return (
          <CardPaymentForm
            total={total}
            method={method}
            loading={loading}
            onProcess={onProcess}
            onCancel={onClose}
          />
        );
      case 'transfer':
        return (
          <TransferPaymentForm
            total={total}
            loading={loading}
            onProcess={onProcess}
            onCancel={onClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="payment-process-overlay" onClick={onClose}>
      <div className="payment-process-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-process-header">
          <div className="payment-process-title">
            <span className="payment-process-icon">{config.icon}</span>
            <h2>{config.title}</h2>
          </div>
          <button className="payment-process-close" onClick={onClose}>×</button>
        </div>

        <div className="payment-process-summary">
          <div className="payment-process-summary-row">
            <span>Cliente:</span>
            <strong>{client?.business_name || `${client?.first_name} ${client?.last_name}`}</strong>
          </div>
          <div className="payment-process-summary-row">
            <span>Productos:</span>
            <strong>{items?.length || 0} items</strong>
          </div>
          <div className="payment-process-summary-total">
            <span>Total a cobrar:</span>
            <span className="payment-process-total-value">
              ${total?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="payment-process-body">
          {renderForm()}
        </div>
      </div>
    </div>
  );
}