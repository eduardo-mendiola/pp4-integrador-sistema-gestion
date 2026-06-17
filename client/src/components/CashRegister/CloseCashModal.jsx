import React, { useState, useEffect } from 'react';
import './CloseCashModal.css';

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

export default function CloseCashModal({ 
  isOpen, onClose, onConfirm, cashRegister, dailySummary, loading 
}) {
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

  // Calcular montos
  const initialAmount = cashRegister?.initialAmount || 0;
  const totalIncomes = dailySummary?.totalIncomes || 0;
  const totalExpenses = dailySummary?.totalExpenses || 0;
  const expectedAmount = initialAmount + totalIncomes - totalExpenses;

  // Calcular total cargado del desglose
  const loadedAmount = cashBreakdown.reduce((sum, item) => sum + (item.denomination * item.quantity), 0);
  
  // Diferencia = cargado - esperado
  const difference = loadedAmount - expectedAmount;

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
    
    if (loadedAmount < 0) {
      setError('El monto cargado no puede ser negativo');
      return;
    }
    
    onConfirm(loadedAmount, notes.trim(), cashBreakdown);
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

  // Determinar clase y mensaje de diferencia
  const getDifferenceInfo = () => {
    if (loadedAmount === 0) {
      return { className: 'neutral', message: 'Cargue el efectivo para ver la diferencia' };
    }
    if (difference === 0) {
      return { className: 'zero', message: '✅ Caja cuadrada - Sin diferencia' };
    }
    if (difference > 0) {
      return { className: 'positive', message: '💰 Sobrante en caja' };
    }
    return { className: 'negative', message: '⚠️ Faltante en caja' };
  };

  const diffInfo = getDifferenceInfo();

  if (!isOpen) return null;

  return (
    <div className="close-cash-overlay" onClick={handleClose}>
      <div className="close-cash-modal" onClick={(e) => e.stopPropagation()}>
        <div className="close-cash-header">
          <div className="close-cash-icon">🔒</div>
          <div>
            <h2>Cerrar Caja</h2>
            <p className="close-cash-subtitle">Realice el arqueo cargando el efectivo</p>
          </div>
          <button className="close-cash-close" onClick={handleClose}>X</button>
        </div>

        <form onSubmit={handleSubmit} className="close-cash-body">
          {/* Resumen del día */}
          <div className="close-cash-summary">
            <h3>Resumen del Día</h3>
            <div className="close-cash-summary-row">
              <span>Monto Inicial:</span>
              <strong>${formatCurrency(initialAmount)}</strong>
            </div>
            <div className="close-cash-summary-row income">
              <span>(+) Ingresos:</span>
              <strong>${formatCurrency(totalIncomes)}</strong>
            </div>
            <div className="close-cash-summary-row expense">
              <span>(-) Egresos:</span>
              <strong>${formatCurrency(totalExpenses)}</strong>
            </div>
            <div className="close-cash-summary-row expected">
              <span>MONTO ESPERADO:</span>
              <strong>${formatCurrency(expectedAmount)}</strong>
            </div>
          </div>

          {/* Desglose de efectivo */}
          <div className="cash-breakdown-section">
            <h3>Arqueo de Efectivo</h3>
            
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
                      <td colSpan="3" className="total-label">TOTAL CARGADO:</td>
                      <td colSpan="2" className="total-value">
                        ${formatCurrency(loadedAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {cashBreakdown.length === 0 && (
              <div className="cash-breakdown-empty">
                No hay efectivo cargado. El monto final será $0.00
              </div>
            )}
          </div>

          {/* Diferencia */}
          <div className={`close-cash-difference ${diffInfo.className}`}>
            <div className="close-cash-difference-header">
              <div className="close-cash-difference-row">
                <span>Monto Esperado:</span>
                <strong>${formatCurrency(expectedAmount)}</strong>
              </div>
              <div className="close-cash-difference-row">
                <span>Total Cargado:</span>
                <strong>${formatCurrency(loadedAmount)}</strong>
              </div>
              <div className="close-cash-difference-row difference-row">
                <span>DIFERENCIA:</span>
                <strong className="difference-value">
                  {difference === 0 ? '$0.00' : 
                   `${difference > 0 ? '+' : '-'}$${formatCurrency(Math.abs(difference))}`}
                </strong>
              </div>
            </div>
            <div className="close-cash-difference-message">
              {diffInfo.message}
            </div>
          </div>

          {/* Notas */}
          <div className="close-cash-field">
            <label>Notas de Cierre (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Arqueo realizado, billetes contados..."
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Acciones */}
          <div className="close-cash-actions">
            <button 
              type="button" 
              className="close-cash-btn secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="close-cash-btn danger"
              disabled={loading}
            >
              {loading ? 'Cerrando...' : '🔒 Cerrar Caja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}