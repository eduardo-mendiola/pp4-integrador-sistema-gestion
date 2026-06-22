import React from 'react';
import './ProductDetailsPanel.css';

export default function ProductDetailsPanel({ selectedItem }) {
  // Si no hay producto seleccionado, mostrar estado vacío
  if (!selectedItem) {
    return (
      <div className="sales-details-panel">
        <div className="sales-details-empty">
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3>Sin producto seleccionado</h3>
          <p>Selecciona un producto de la lista para ver sus detalles</p>
        </div>
      </div>
    );
  }

  // URL de imagen por defecto
  const defaultImage = '/images/imagen-no-disponible-750x750.png';
  const imageUrl = selectedItem.image || defaultImage;

  return (
    <div className="sales-details-panel">
      <div className="sales-details-header">
        <h3 className="sales-details-title">{selectedItem.name}</h3>
        <div className="sales-product-image-container">
          <img 
            src={imageUrl} 
            alt={selectedItem.name}
            className="sales-product-image"
            onError={(e) => {
              e.target.src = defaultImage;
            }}
          />
        </div>
      </div>

      <div className="sales-details-info">
        <div className="sales-detail-section">
          <h4 className="sales-detail-section-title">Información del Producto</h4>
          
          <div className="sales-detail-row">
            <span className="sales-detail-label">Precio</span>
            <span className="sales-detail-value price">
              ${selectedItem.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          {selectedItem.originalPrice && selectedItem.originalPrice > selectedItem.price && (
            <div className="sales-detail-row">
              <span className="sales-detail-label">Precio Original</span>
              <span className="sales-detail-value original">
                ${selectedItem.originalPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          
          <div className="sales-detail-row">
            <span className="sales-detail-label">SKU</span>
            <span className="sales-detail-value code">{selectedItem.sku}</span>
          </div>
          
          <div className="sales-detail-row">
            <span className="sales-detail-label">Categoría</span>
            <span className="sales-detail-value">{selectedItem.category || '-'}</span>
          </div>
        </div>

        <div className="sales-detail-section">
          <h4 className="sales-detail-section-title">Stock y Descuentos</h4>
          
          <div className="sales-detail-row">
            <span className="sales-detail-label">Disponibles</span>
            <span className={`sales-detail-value stock ${selectedItem.stock <= 5 ? 'low' : 'ok'}`}>
              {selectedItem.stock} {selectedItem.stock === 1 ? 'unidad' : 'unidades'}
            </span>
          </div>
          
          {selectedItem.discount > 0 && (
            <div className="sales-detail-row">
              <span className="sales-detail-label">Descuento</span>
              <span className="sales-detail-value discount">
                ${selectedItem.discount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        {selectedItem.description && (
          <div className="sales-detail-section">
            <h4 className="sales-detail-section-title">Descripción</h4>
            <p className="sales-detail-description">{selectedItem.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
