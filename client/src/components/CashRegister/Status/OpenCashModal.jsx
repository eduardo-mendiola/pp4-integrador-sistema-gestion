import React, { useState, useEffect } from 'react';
import './OpenCashModal.css';

// Denominaciones argentinas (sin $5000 que no existe)
const DENOMINATIONS = {
  bill: [
    { value: 20000, label: '$20.000' },
    { value: 10000, label: '$10.000' },
    { value: 2000, label: '$2.000' },
    { value: 1000, label: '$1.000' },
    { value: 500, label: '$500' },
    { value: 200, label: '$200' },
    { value: 100, label: '$100' },
    { value: 50, label: '$50' },
    { value: 20, label: '$20' },
    { value: 10, label: '$10' }
  ],
  coin: [
    { value: 10, label: '$10' },
    { value: 5, label: '$5' },
    { value: 2, label: '$2' },
    { value: 1, label: '$1' }
  ]
};

export default function OpenCashModal({ isOpen, onClose, onConfirm, loading }) {
  const [cashBreakdown, setCashBreakdown] = useState([]);
  const [selectedType, setSelectedType] = useState('bill');
  const [selectedDenomination, setSelectedDenomination] = useState(DENOMINATIONS.bill[0].value);
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  
  useEffect(() => {
    if (!isOpen) {
      setCashBreakdown([]);
      setSelectedType('bill');
      setSelectedDenomination(DENOMINATIONS.bill[0].value);
      setQuantity('');
      setNotes('');
      setError('');
    }
  }, [isOpen]);

  // Calcular total del desglose
  const totalAmount = cashBreakdown.reduce((sum, item) => sum + (item.denomination * item.quantity), 0);

  const handleAddItem = () => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    const newItem = {
      id: Date.now() + Math.random(),
      type: selectedType,
      denomination: selectedDenomination,
      quantity: qty,
      subtotal: selectedDenomination * qty
    };

    setCashBreakdown([...cashBreakdown, newItem]);
    setQuantity('');
    setError('');
  };

  const handleRemoveItem = (id) => {
    setCashBreakdown(cashBreakdown.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id, newQty) => {
    const qty = parseInt(newQty);
    if (isNaN(qty) || qty < 0) return;

    setCashBreakdown(cashBreakdown.map(item => 
      item.id === id 
        ? { ...item, quantity: qty, subtotal: item.denomination * qty }
        : item
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (totalAmount < 0) {
      setError('El monto total no puede ser negativo');
      return;
    }
    
    onConfirm(totalAmount, notes.trim(), cashBreakdown);
  };

  const handleClose = () => {
    onClose();
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setSelectedDenomination(DENOMINATIONS[type][0].value);
  };

  const formatCurrency = (value) => {
    return (value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
  };

  if (!isOpen) return null;

  return (
    <div className="open-cash-overlay" onClick={handleClose}>
      <div className="open-cash-modal" onClick={(e) => e.stopPropagation()}>
        <div className="open-cash-header">
          <div className="open-cash-icon">🔓</div>
          <div>
            <h2>Abrir Caja</h2>
            <p className="open-cash-subtitle">Desglose el efectivo inicial</p>
          </div>
          <button className="open-cash-close" onClick={handleClose}>X</button>
        </div>

        <form onSubmit={handleSubmit} className="open-cash-body">
          {/* Desglose de efectivo */}
          <div className="cash-breakdown-section">
            <h3>Desglose de Efectivo</h3>
            
            <div className="cash-breakdown-form">
              <div className="cash-breakdown-field">
                <label>Tipo</label>
                <div className="cash-type-selector">
                  <button
                    type="button"
                    className={`cash-type-btn ${selectedType === 'bill' ? 'active' : ''}`}
                    onClick={() => handleTypeChange('bill')}
                  >
                    💵 Billete
                  </button>
                  <button
                    type="button"
                    className={`cash-type-btn ${selectedType === 'coin' ? 'active' : ''}`}
                    onClick={() => handleTypeChange('coin')}
                  >
                    🪙 Moneda
                  </button>
                </div>
              </div>

              <div className="cash-breakdown-field">
                <label>Denominación</label>
                <select
                  value={selectedDenomination}
                  onChange={(e) => setSelectedDenomination(Number(e.target.value))}
                >
                  {DENOMINATIONS[selectedType].map(denom => (
                    <option key={denom.value} value={denom.value}>
                      {denom.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cash-breakdown-field">
                <label>Cantidad</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setError('');
                  }}
                  placeholder="0"
                  min="1"
                />
              </div>

              <button
                type="button"
                className="cash-breakdown-add-btn"
                onClick={handleAddItem}
              >
                + Agregar
              </button>
            </div>

            {error && <span className="cash-breakdown-error">{error}</span>}

            {/* Tabla de desglose */}
            {cashBreakdown.length > 0 && (
              <div className="cash-breakdown-table-wrapper">
                <table className="cash-breakdown-table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Denominación</th>
                      <th>Cantidad</th>
                      <th>Subtotal</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashBreakdown.map(item => (
                      <tr key={item.id}>
                        <td>
                          <span className={`cash-type-badge ${item.type}`}>
                            {item.type === 'bill' ? '💵' : '🪙'}
                          </span>
                        </td>
                        <td className="denomination-cell">
                          ${item.denomination.toLocaleString('es-AR')}
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                            min="0"
                            className="quantity-edit-input"
                          />
                        </td>
                        <td className="subtotal-cell">
                          ${formatCurrency(item.subtotal)}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="remove-item-btn"
                            onClick={() => handleRemoveItem(item.id)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="total-label">TOTAL:</td>
                      <td colSpan="2" className="total-value">
                        ${formatCurrency(totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {cashBreakdown.length === 0 && (
              <div className="cash-breakdown-empty">
                No hay efectivo cargado. El monto inicial será $0.00
              </div>
            )}
          </div>

          {/* Notas */}
          <div className="open-cash-field">
            <label>Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Apertura del turno mañana..."
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Acciones */}
          <div className="open-cash-actions">
            <button 
              type="button" 
              className="open-cash-btn secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="open-cash-btn primary"
              disabled={loading}
            >
              {loading ? 'Abriendo...' : `Abrir Caja ($${formatCurrency(totalAmount)})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}