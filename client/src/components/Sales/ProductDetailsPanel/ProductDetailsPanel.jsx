import React from 'react';
import PaymentButtons from './PaymentButtons';
import './ProductDetailsPanel.css';

export default function ProductDetailsPanel({ selectedItem, loading, onPayment, onCheckStock }) {
  const defaultItem = {
    name: 'Master Hero Series - Ultra Rare',
    price: 24500.00,
    sku: 'AF-00923',
    category: 'COLLECTOR-ED',
    stock: 12,
    discount: 0
  };

  const item = selectedItem || defaultItem;

  return (
    <div className="sales-details-panel">
      <div className="sales-details-header">
        <h3>{item.name}</h3>
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name}
            className="sales-product-image"
          />
        ) : (
          <div className="sales-product-image" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8898aa',
            backgroundColor: '#f8f9fa'
          }}>
            Sin imagen
          </div>
        )}
      </div>

      <div className="sales-details-info">
        <div className="sales-detail-row">
          <span className="sales-detail-label">Precio</span>
          <span className="sales-detail-value">
            ${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="sales-detail-row">
          <span className="sales-detail-label">SKU</span>
          <span className="sales-detail-value">{item.sku}</span>
        </div>
        <div className="sales-detail-row">
          <span className="sales-detail-label">Categoría</span>
          <span className="sales-detail-value">{item.category || 'COLLECTOR-ED'}</span>
        </div>
        <div className="sales-detail-row">
          <span className="sales-detail-label">Disponibles</span>
          <span className="sales-detail-value highlight">{item.stock}</span>
        </div>
        <div className="sales-detail-row">
          <span className="sales-detail-label">Descuento</span>
          <span className="sales-detail-value">
            ${(item.discount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <button className="sales-check-stock-btn" onClick={onCheckStock}>
          <span>🔍</span>
          Chequear Stock
        </button>
      </div>

      <PaymentButtons 
        onPayment={onPayment}
        disabled={loading || !selectedItem}
      />
    </div>
  );
}