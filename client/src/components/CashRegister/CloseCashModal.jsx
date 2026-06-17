import React, { useState, useEffect } from 'react';
import './CloseCashModal.css';

const DENOMINATIONS = {
  bill: [
    { value: 20000, label: '$20.000' }, { value: 10000, label: '$10.000' },
    { value: 2000, label: '$2.000' }, { value: 1000, label: '$1.000' },
    { value: 500, label: '$500' }, { value: 200, label: '$200' },
    { value: 100, label: '$100' }, { value: 50, label: '$50' },
    { value: 20, label: '$20' }, { value: 10, label: '$10' }
  ],
  coin: [
    { value: 10, label: '$10' }, { value: 5, label: '$5' },
    { value: 2, label: '$2' }, { value: 1, label: '$1' }
  ]
};

export default function CloseCashModal({ isOpen, onClose, onConfirm, cashRegister, dailySummary, loading }) {
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

  const initialAmount = cashRegister?.initialAmount || 0;
  const totalIncomes = dailySummary?.totalIncomes || 0;
  const totalExpenses = dailySummary?.totalExpenses || 0;
  
  // ✅ Cálculo específico para EFECTIVO
  const cashIncomes = dailySummary?.byPaymentMethod?.cash?.incomes || 0;
  const cashExpenses = dailySummary?.byPaymentMethod?.cash?.expenses || 0;
  const expectedCash = initialAmount + cashIncomes - cashExpenses;

  const loadedAmount = cashBreakdown.reduce((sum, item) => sum + (item.denomination * item.quantity), 0);
  const difference = loadedAmount - expectedCash;

  const handleAddItem = () => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }
    setCashBreakdown([...cashBreakdown, {
      id: Date.now() + Math.random(),
      type: selectedType,
      denomination: selectedDenomination,
      quantity: qty,
      subtotal: selectedDenomination * qty
    }]);
    setQuantity('');
    setError('');
  };

  const handleRemoveItem = (id) => setCashBreakdown(cashBreakdown.filter(item => item.id !== id));

  const handleUpdateQuantity = (id, newQty) => {
    const qty = parseInt(newQty);
    if (isNaN(qty) || qty < 0) return;
    setCashBreakdown(cashBreakdown.map(item => 
      item.id === id ? { ...item, quantity: qty, subtotal: item.denomination * qty } : item
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

  const formatCurrency = (value) => (value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });

  const getDifferenceInfo = () => {
    if (loadedAmount === 0) return { className: 'neutral', message: 'Cargue el efectivo para ver la diferencia' };
    if (difference === 0) return { className: 'zero', message: '✅ Caja cuadrada - Sin diferencia' };
    if (difference > 0) return { className: 'positive', message: '💰 Sobrante en caja' };
    return { className: 'negative', message: '⚠️ Faltante en caja' };
  };

  if (!isOpen) return null;

  return (
    <div className="close-cash-overlay" onClick={() => onClose()}>
      <div className="close-cash-modal" onClick={(e) => e.stopPropagation()}>
        <div className="close-cash-header">
          <div className="close-cash-icon">🔒</div>
          <div>
            <h2>Cierre de Caja y Arqueo</h2>
            <p className="close-cash-subtitle">Verifique los totales por método de pago y cuente el efectivo</p>
          </div>
          <button className="close-cash-close" onClick={() => onClose()}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="close-cash-body">
          
          {/* Resumen por Método de Pago (Solo lectura) */}
          <div className="payment-methods-summary">
            <h3>Resumen del Día por Método de Pago</h3>
            <div className="pm-grid">
              {['cash', 'debit_card', 'credit_card', 'transfer'].map(method => {
                const data = dailySummary?.byPaymentMethod?.[method] || { incomes: 0, expenses: 0 };
                const labels = { cash: '💵 Efectivo', debit_card: '💳 Débito', credit_card: '💳 Crédito', transfer: '🏦 Transferencia' };
                const isCash = method === 'cash';
                
                return (
                  <div key={method} className={`pm-card ${isCash ? 'pm-card-cash' : ''}`}>
                    <div className="pm-title">{labels[method]}</div>
                    <div className="pm-row">
                      <span>Ingresos:</span>
                      <strong className="text-green">${formatCurrency(data.incomes)}</strong>
                    </div>
                    <div className="pm-row">
                      <span>Egresos:</span>
                      <strong className="text-red">${formatCurrency(data.expenses)}</strong>
                    </div>
                    {isCash && (
                      <div className="pm-row pm-row-total">
                        <span>Saldo Esperado:</span>
                        <strong>${formatCurrency(initialAmount + data.incomes - data.expenses)}</strong>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECCIÓN: Arqueo de Efectivo (Interactivo) */}
          <div className="cash-breakdown-section">
            <h3>Conteo de Efectivo Físico</h3>
            <div className="cash-breakdown-form">
              <div className="cash-breakdown-field">
                <label>Tipo</label>
                <div className="cash-type-selector">
                  <button type="button" className={`cash-type-btn ${selectedType === 'bill' ? 'active' : ''}`} onClick={() => setSelectedType('bill')}>💵 Billete</button>
                  <button type="button" className={`cash-type-btn ${selectedType === 'coin' ? 'active' : ''}`} onClick={() => setSelectedType('coin')}>🪙 Moneda</button>
                </div>
              </div>
              <div className="cash-breakdown-field">
                <label>Denominación</label>
                <select value={selectedDenomination} onChange={(e) => setSelectedDenomination(Number(e.target.value))}>
                  {DENOMINATIONS[selectedType].map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div className="cash-breakdown-field">
                <label>Cantidad</label>
                <input type="number" value={quantity} onChange={(e) => { setQuantity(e.target.value); setError(''); }} placeholder="0" min="1" />
              </div>
              <button type="button" className="cash-breakdown-add-btn" onClick={handleAddItem}>+ Agregar</button>
            </div>
            {error && <span className="cash-breakdown-error">{error}</span>}

            {cashBreakdown.length > 0 ? (
              <div className="cash-breakdown-table-wrapper">
                <table className="cash-breakdown-table">
                  <thead><tr><th>Tipo</th><th>Denominación</th><th>Cantidad</th><th>Subtotal</th><th>Acción</th></tr></thead>
                  <tbody>
                    {cashBreakdown.map(item => (
                      <tr key={item.id}>
                        <td><span className="cash-type-badge">{item.type === 'bill' ? '💵' : '🪙'}</span></td>
                        <td className="denomination-cell">${item.denomination.toLocaleString('es-AR')}</td>
                        <td><input type="number" value={item.quantity} onChange={(e) => handleUpdateQuantity(item.id, e.target.value)} min="0" className="quantity-edit-input" /></td>
                        <td className="subtotal-cell">${formatCurrency(item.subtotal)}</td>
                        <td><button type="button" className="remove-item-btn" onClick={() => handleRemoveItem(item.id)}>🗑️</button></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="total-label">TOTAL CONTADO:</td>
                      <td colSpan="2" className="total-value">${formatCurrency(loadedAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="cash-breakdown-empty">No hay efectivo cargado. El monto final será $0.00</div>
            )}
          </div>

          {/* Diferencia Final */}
          <div className={`close-cash-difference ${getDifferenceInfo().className}`}>
            <div className="close-cash-difference-header">
              <div className="close-cash-difference-row">
                <span>Saldo Inicial (Apertura):</span>
                <strong>${formatCurrency(initialAmount)}</strong>
              </div>
              <div className="close-cash-difference-row">
                <span>Efectivo Esperado (Sistema):</span>
                <strong>${formatCurrency(expectedCash)}</strong>
              </div>
              <div className="close-cash-difference-row">
                <span>Efectivo Contado (Real):</span>
                <strong>${formatCurrency(loadedAmount)}</strong>
              </div>
              <div className="close-cash-difference-row difference-row">
                <span>DIFERENCIA:</span>
                <strong className="difference-value">
                  {difference === 0 ? '$0.00' : `${difference > 0 ? '+' : '-'}$${formatCurrency(Math.abs(difference))}`}
                </strong>
              </div>
            </div>
            <div className="close-cash-difference-message">{getDifferenceInfo().message}</div>
          </div>

          <div className="close-cash-field">
            <label>Notas de Cierre (opcional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: Arqueo realizado, billetes contados..." rows={2} disabled={loading} />
          </div>

          <div className="close-cash-actions">
            <button type="button" className="close-cash-btn secondary" onClick={() => onClose()} disabled={loading}>Cancelar</button>
            <button type="submit" className="close-cash-btn danger" disabled={loading}>{loading ? 'Cerrando...' : '🔒 Cerrar Caja'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}