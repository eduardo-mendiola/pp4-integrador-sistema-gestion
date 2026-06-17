import React from 'react';
import './SalesMessage.css';

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
  idle: '●',
  closed: '⊘'
};

export default function SalesMessage({ message, onClose, cashRegisterStatus }) {
  const hasMessage = message && message.text;
  const isCashClosed = cashRegisterStatus && cashRegisterStatus.status !== 'OPEN';
  
  let type, text, icon;
  
  if (hasMessage) {
    type = message.type;
    text = message.text;
    icon = ICONS[type] || ICONS.info;
  } else if (isCashClosed) {
    type = 'closed';
    text = 'Caja cerrada - Abra la caja para procesar ventas';
    icon = ICONS.closed;
  } else {
    type = 'idle';
    text = 'Sistema en línea';
    icon = ICONS.idle;
  }

  return (
    <div className={`sales-message ${type}`}>
      <div className="sales-message-content">
        <span className="sales-message-icon">{icon}</span>
        <span className="sales-message-text-container">{text}</span>
      </div>
      {hasMessage && onClose && (
        <button className="sales-message-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
}