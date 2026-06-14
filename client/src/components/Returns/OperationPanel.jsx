import React, { useState, useRef, useEffect } from 'react';
import { apiRequest } from '../../services/api.js';
import ExchangeItemsTable from './ExchangeItemsTable';
import DiscountButton from '../Sales/DiscountButton/DiscountButton';
import './OperationPanel.css';

const operationTypes = [
  { id: 'return', label: 'DEVOLUCIÓN', description: 'El cliente recibe dinero', color: '#84A3D3' },
  { id: 'credit_note', label: 'NOTA DE CRÉDITO', description: 'Saldo a favor del cliente', color: '#95B8D1' },
  { id: 'exchange_same', label: 'CAMBIO (MISMO)', description: 'Por talle/color diferente', color: '#B8E0D2' },
  { id: 'exchange_other', label: 'CAMBIO (OTRO)', description: 'Por otro producto', color: '#9CADCE' }
];

const reasonOptions = [
  { id: 'defectuoso', label: 'Defectuoso' },
  { id: 'talle_incorrecto', label: 'Talle incorrecto' },
  { id: 'opcion_cliente', label: 'Opción del cliente' },
  { id: 'no_conforme', label: 'No conforme' },
  { id: 'otro', label: 'Otro' }
];

export default function OperationPanel({
  operationType,
  setOperationType,
  returnReason,
  setReturnReason,
  customReason,
  setCustomReason,
  exchangeItems,
  exchangeItemDiscounts,
  exchangeDiscountRate,
  setExchangeDiscountRate,
  editingExchangeQuantities,
  onAddExchangeItem,
  onRemoveExchangeItem,
  onToggleExchangeItemActive,
  onExchangeQuantityFocus,
  onExchangeQuantityChange,
  onExchangeQuantityBlur,
  onExchangeQuantityKeyDown,
  onSetExchangeItemDiscount,
  totals,
  onProcessReturn,
  loading,
  error,
  warning,
  operationCompleted
}) {
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  const isExchangeOther = operationType === 'exchange_other';
  const isExchangeSame = operationType === 'exchange_same';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchProducts = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await apiRequest('/api/products');
      const products = response.data || response;
      const filtered = products.filter(p => 
        p.name?.toLowerCase().includes(query.toLowerCase()) ||
        p.sku?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
      setSearchResults(filtered);
    } catch (err) {
      console.error('Error buscando productos:', err);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setProductSearch(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => searchProducts(value), 300);
  };

  const handleSelectProduct = (product) => {
    onAddExchangeItem(product);
    setProductSearch('');
    setSearchResults([]);
  };

  const formatCurrency = (value) => 
    (value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });

  const getBalanceLabel = () => {
    if (totals.difference === 0) {
      return { text: 'Sin diferencia a pagar', color: '#6c757d' };
    }
    if (totals.difference > 0) {
      return { text: 'DIFERENCIA A PAGAR (con IVA)', color: '#28a745' };
    }
    return { text: 'SALDO A FAVOR DEL CLIENTE', color: '#dc3545' };
  };

  const balanceLabel = getBalanceLabel();

  const handleProcess = () => {
    onProcessReturn();
  };

  if (operationCompleted) {
    return (
      <div className="operation-panel">
        <div className="operation-completed">
          <div className="completed-icon">✓</div>
          <h3>¡Operación Completada!</h3>
          <p>La devolución/cambio se ha procesado exitosamente.</p>
          <p className="completed-hint">Volviendo a la búsqueda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="operation-panel">
      {error && (
        <div className="operation-error">
          {error}
        </div>
      )}

      {warning && (
        <div className="operation-warning">
          ⚠️ {warning}
        </div>
      )}

      <div className="operation-type-section">
        <h3>Tipo de Operación</h3>
        <div className="operation-type-grid">
          {operationTypes.map(type => (
            <button
              key={type.id}
              className={`operation-type-btn ${operationType === type.id ? 'active' : ''}`}
              onClick={() => setOperationType(type.id)}
              style={{ 
                backgroundColor: operationType === type.id ? type.color : 'white',
                color: operationType === type.id ? 'white' : '#333',
                borderColor: type.color
              }}
            >
              <span className="operation-type-label">{type.label}</span>
              <span className="operation-type-desc">{type.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="reason-section">
        <h3>Motivo de la Operación <span className="required">*</span></h3>
        <div className="reason-chips">
          {reasonOptions.map(reason => (
            <button
              key={reason.id}
              className={`reason-chip ${returnReason === reason.id ? 'active' : ''} ${!returnReason && warning ? 'needs-selection' : ''}`}
              onClick={() => setReturnReason(reason.id)}
            >
              {reason.label}
            </button>
          ))}
        </div>
        
        {returnReason === 'otro' && (
          <textarea
            className={`custom-reason-input ${!customReason.trim() && warning ? 'needs-input' : ''}`}
            placeholder="Especifique el motivo detallado..."
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            rows={3}
          />
        )}
      </div>

      {isExchangeOther && (
        <div className="exchange-section" ref={searchRef}>
          <div className="exchange-search-wrapper">
            <input
              type="text"
              className="exchange-search-input"
              placeholder="Buscar producto para agregar al cambio..."
              value={productSearch}
              onChange={handleSearchChange}
            />
            {searchResults.length > 0 && (
              <div className="exchange-search-results">
                {searchResults.map(product => (
                  <div 
                    key={product._id} 
                    className="exchange-search-result"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <span className="product-name">{product.name}</span>
                    <span className="product-price">${formatCurrency(product.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ExchangeItemsTable
            items={exchangeItems}
            editingQuantities={editingExchangeQuantities}
            itemDiscounts={exchangeItemDiscounts}
            onRemoveItem={onRemoveExchangeItem}
            onToggleActive={onToggleExchangeItemActive}
            onQuantityFocus={onExchangeQuantityFocus}
            onQuantityChange={onExchangeQuantityChange}
            onQuantityBlur={onExchangeQuantityBlur}
            onQuantityKeyDown={onExchangeQuantityKeyDown}
            onItemDiscountChange={onSetExchangeItemDiscount}
          />
        </div>
      )}

      {isExchangeSame && exchangeItems.length > 0 && (
        <div className="exchange-same-info">
          <p>Se procesará el cambio por los <strong>mismos productos y cantidades</strong> seleccionados en el panel izquierdo.</p>
          <p className="exchange-same-hint">No hay diferencia de valor a cobrar ni a devolver.</p>
        </div>
      )}

      <div className="balance-section">
        <div className="balance-row">
          <span>Crédito a favor (con IVA):</span>
          <span>${formatCurrency(totals.returnTotal)}</span>
        </div>
        {isExchangeOther && (
          <>
            <div className="balance-row">
              <span>Total productos nuevos (con IVA):</span>
              <span>${formatCurrency(totals.exchangeTotal)}</span>
            </div>
            <div className="balance-discount-row">
              <DiscountButton 
                discountRate={exchangeDiscountRate}
                onDiscountChange={setExchangeDiscountRate}
              />
              {exchangeDiscountRate > 0 && (
                <span className="balance-discount-label">
                  Descuento aplicado: {exchangeDiscountRate}%
                </span>
              )}
            </div>
          </>
        )}
        <div className="balance-difference" style={{ borderColor: balanceLabel.color }}>
          <span className="balance-label" style={{ color: balanceLabel.color }}>
            {balanceLabel.text}
          </span>
          <span className="balance-amount" style={{ color: balanceLabel.color }}>
            ${formatCurrency(Math.abs(totals.difference))}
          </span>
        </div>
      </div>

      <button 
        className="process-btn"
        onClick={handleProcess}
        disabled={loading || operationCompleted}
      >
        {loading ? 'Procesando...' : 'Procesar Operación'}
      </button>
    </div>
  );
}