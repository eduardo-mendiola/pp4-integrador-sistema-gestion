import React, { useState } from 'react';
import './DiscountButton.css';

export default function DiscountButton({ discountRate, onDiscountChange }) {
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState(discountRate.toString());

  const handleOpenModal = () => {
    setInputValue(discountRate.toString());
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Solo permitir números y un punto decimal
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleApply = () => {
    const rate = parseFloat(inputValue) || 0;
    // Limitar entre 0 y 100
    const validRate = Math.min(Math.max(0, rate), 100);
    onDiscountChange(validRate);
    setShowModal(false);
  };

  const handleClear = () => {
    setInputValue('0');
    onDiscountChange(0);
    setShowModal(false);
  };

  return (
    <>
      <button 
        className={`discount-btn ${discountRate > 0 ? 'active' : ''}`}
        onClick={handleOpenModal}
        title="Aplicar descuento global"
      >
        <span className="discount-icon">%</span>
        <span className="discount-label">
          {discountRate > 0 ? `${discountRate}%` : 'Aplicar Descuento'}
        </span>
      </button>

      {showModal && (
        <div className="discount-modal-overlay" onClick={handleCloseModal}>
          <div className="discount-modal" onClick={(e) => e.stopPropagation()}>
            <div className="discount-modal-header">
              <h3>Aplicar Descuento Global</h3>
              <button className="discount-modal-close" onClick={handleCloseModal}>✕</button>
            </div>

            <div className="discount-modal-body">
              <p className="discount-modal-hint">
                Ingrese el porcentaje de descuento a aplicar sobre el subtotal
              </p>

              <div className="discount-input-wrapper">
                <input
                  type="text"
                  className="discount-input"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="0"
                  autoFocus
                />
                <span className="discount-suffix">%</span>
              </div>

              <div className="discount-quick-options">
                <button onClick={() => setInputValue('5')}>5%</button>
                <button onClick={() => setInputValue('10')}>10%</button>
                <button onClick={() => setInputValue('15')}>15%</button>
                <button onClick={() => setInputValue('20')}>20%</button>
              </div>
            </div>

            <div className="discount-modal-actions">
              <button className="discount-btn-clear" onClick={handleClear}>
                Quitar descuento
              </button>
              <button className="discount-btn-apply" onClick={handleApply}>
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
