import React from 'react';
import './SalesMessage.css';

export default function SalesMessage({ message, onClose }) {
  if (!message || !message.text) return null;

  return (
    <div className={`sales-message ${message.type}`}>
      <span>{message.text}</span>
      {onClose && (
        <button className="sales-message-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
}