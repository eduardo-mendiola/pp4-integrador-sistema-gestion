import React, { useState, useRef, useEffect } from 'react';
import { apiRequest } from '../../services/api.js';
import './OperationPanel.css';

const operationTypes = [
  { 
    id: 'return', 
    label: 'DEVOLUCIÓN', 
    description: 'El cliente recibe dinero',
    color: '#84A3D3'
  },
  { 
    id: 'credit_note', 
    label: 'NOTA DE CRÉDITO', 
    description: 'Saldo a favor del cliente',
    color: '#95B8D1'
  },
  { 
    id: 'exchange_same', 
    label: 'CAMBIO (MISMO)', 
    description: 'Por talle/color diferente',
    color: '#B8E0D2'
  },
  { 
    id: 'exchange_other', 
    label: 'CAMBIO (OTRO)', 
    description: 'Por otro producto',
    color: '#9CADCE'
  }
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
  exchangeItems,
  onAddExchangeItem,
  onUpdateExchangeQuantity,
  totals
}) {
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [customReason, setCustomReason] = useState('');
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  const isExchange = operationType === 'exchange_same' || operationType === 'exchange_other';

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
      return { text: 'Sin diferencia', color: '#6c757d' };
    }
    if (totals.difference > 0) {
      return { text: 'A COBRAR AL CLIENTE', color: '#28a745' };
    }
    return { text: 'A DEVOLVER AL CLIENTE', color: '#dc3545' };
  };

  const balanceLabel = getBalanceLabel();

  return (
    <div className="operation-panel">
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
        <h3>Motivo de la Operación</h3>
        <div className="reason-chips">
          {reasonOptions.map(reason => (
            <button
              key={reason.id}
              className={`reason-chip ${returnReason === reason.id ? 'active' : ''}`}
              onClick={() => setReturnReason(reason.id)}
            >
              {reason.label}
            </button>
          ))}
        </div>
        
        {/* ✅ CAMBIO: Ahora es un textarea real que baja de línea */}
        {returnReason === 'otro' && (
          <textarea
            className="custom-reason-input"
            placeholder="Especifique el motivo detallado..."
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            rows={3}
          />
        )}
      </div>

      {isExchange && (
        <div className="exchange-section" ref={searchRef}>
          <h3>Productos del Cambio</h3>
          <div className="exchange-search-wrapper">
            <input
              type="text"
              className="exchange-search-input"
              placeholder="Buscar producto nuevo..."
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

          {exchangeItems.length > 0 && (
            <div className="exchange-items-list">
              {exchangeItems.map(item => (
                <div key={item.productId} className="exchange-item">
                  <div className="exchange-item-info">
                    <span className="exchange-item-name">{item.name}</span>
                    <span className="exchange-item-price">${formatCurrency(item.price)} c/u</span>
                  </div>
                  <div className="exchange-item-controls">
                    <input
                      type="number"
                      className="exchange-qty-input"
                      value={item.quantity}
                      onChange={(e) => onUpdateExchangeQuantity(item.productId, parseInt(e.target.value) || 0)}
                      min="1"
                    />
                    <span className="exchange-item-subtotal">${formatCurrency(item.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="balance-section">
        <div className="balance-row">
          <span>Total de la compra original:</span>
          <span>${formatCurrency(totals.returnTotal)}</span>
        </div>
        {isExchange && (
          <div className="balance-row">
            <span>Total productos nuevos:</span>
            <span>${formatCurrency(totals.exchangeTotal)}</span>
          </div>
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

      <button className="process-btn">
        Procesar Operación
      </button>
    </div>
  );
}