import React from 'react';
import './ProductSearchBar.css';

export default function ProductSearchBar({
  searchQuery,
  onSearchChange,
  customerName,
  onCustomerChange,
  filteredProducts,
  onProductSelect,
  showResults
}) {
  return (
    <div className="sales-search-bar">
      <div className="sales-search-input-wrapper">
        <span className="sales-search-icon">🔍</span>
        <input
          type="text"
          className="sales-search-input"
          placeholder="Buscar productos (SKU, nombre)..."
          value={searchQuery}
          onChange={onSearchChange}
          onFocus={() => searchQuery.length >= 2 && showResults(true)}
        />
        
        {showResults && searchQuery.length >= 2 && (
          <div className="sales-search-results">
            {filteredProducts.length === 0 ? (
              <div className="sales-search-no-results">
                No se encontraron productos
              </div>
            ) : (
              filteredProducts.map(product => (
                <div
                  key={product._id}
                  className="sales-search-result-item"
                  onClick={() => onProductSelect(product)}
                >
                  <div>
                    <div className="sales-search-result-name">{product.name}</div>
                    <div className="sales-search-result-sku">
                      SKU: {product.sku}
                    </div>
                  </div>
                  <div className="sales-search-result-price">
                    ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      <input
        type="text"
        placeholder="Nombre del cliente"
        value={customerName}
        onChange={(e) => onCustomerChange(e.target.value)}
        className="sales-customer-input"
      />
    </div>
  );
}