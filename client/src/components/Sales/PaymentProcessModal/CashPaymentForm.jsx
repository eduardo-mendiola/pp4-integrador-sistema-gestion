import React, { useState, useEffect } from 'react';
import './CashPaymentForm.css';

export default function CashPaymentForm({ total, loading, onProcess, onCancel }) {
  const [amountReceived, setAmountReceived] = useState('');
  const [change, setChange] = useState(0);

  useEffect(() => {
    const received = parseFloat(amountReceived) || 0;
    setChange(received - total);
  }, [amountReceived, total]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const received = parseFloat(amountReceived);
    
    if (isNaN(received) || received < total) {
      alert('El monto recibido debe ser mayor o igual al total');
      return;
    }

    onProcess({
      amount_received: received,
      change: change
    });
  };

  const quickAmounts = [total, Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500, Math.ceil(total / 1000) * 1000];

  return (
    <form className="cash-form" onSubmit={handleSubmit}>
      <div className="cash-form-field">
        <label>Monto Recibido *</label>
        <input
          type="number"
          step="0.01"
          value={amountReceived}
          onChange={(e) => setAmountReceived(e.target.value)}
          placeholder="0.00"
          autoFocus
          className="cash-form-input"
        />
      </div>

      <div className="cash-form-quick-amounts">
        <span className="cash-form-quick-label">Montos rápidos:</span>
        <div className="cash-form-quick-buttons">
          {quickAmounts.map((amount, idx) => (
            <button
              key={idx}
              type="button"
              className="cash-form-quick-btn"
              onClick={() => setAmountReceived(amount.toString())}
            >
              ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </button>
          ))}
        </div>
      </div>

      <div className={`cash-form-change ${change < 0 ? 'negative' : change > 0 ? 'positive' : 'exact'}`}>
        <div className="cash-form-change-label">
          {change < 0 ? 'Falta:' : change > 0 ? 'Vuelto:' : 'Monto exacto ✓'}
        </div>
        <div className="cash-form-change-value">
          ${Math.abs(change).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div className="cash-form-actions">
        <button 
          type="button" 
          className="cash-form-btn cancel"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="cash-form-btn process"
          disabled={loading || change < 0 || !amountReceived}
        >
          {loading ? 'Procesando...' : 'Procesar Pago'}
        </button>
      </div>
    </form>
  );
}