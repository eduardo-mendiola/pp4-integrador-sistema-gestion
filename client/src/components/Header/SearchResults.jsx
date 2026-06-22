import React from 'react';

export default function SearchResults({ results, onSelect, onClose }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="search-results-dropdown">
      <div className="search-results-header">
        <span>{results.length} resultado(s) encontrado(s)</span>
        <button className="close-results" onClick={onClose}></button>
      </div>
      <div className="search-results-list">
        {results.map((product) => (
          <div
            key={product._id}
            className="search-result-item"
            onClick={() => onSelect(product)}
          >
            <div className="result-sku">{product.sku}</div>
            <div className="result-info">
              <div className="result-name">{product.name}</div>
              <div className="result-meta">
                {product.category?.name && (
                  <span className="result-category">{product.category.name}</span>
                )}
                {product.stock !== undefined && (
                  <span className={`result-stock ${product.stock <= product.min_stock_alert ? 'low-stock' : ''}`}>
                    Stock: {product.stock}
                  </span>
                )}
              </div>
            </div>
            <div className="result-price">${product.price?.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
