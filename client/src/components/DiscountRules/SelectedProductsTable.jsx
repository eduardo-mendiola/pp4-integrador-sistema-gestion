import React from 'react';
import './SelectedProductsTable.css';

export default function SelectedProductsTable({ products, onRemove, onToggleActive }) {
  if (products.length === 0) {
    return (
      <div className="selected-products-empty">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <p>Busca productos arriba y agrégalos a la regla</p>
      </div>
    );
  }

  return (
    <div className="selected-products-panel">
      <div className="selected-products-header">
        <h3>Productos Seleccionados</h3>
        <span className="selected-products-count">
          {products.length} {products.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      <div className="selected-products-table-wrapper">
        <table className="selected-products-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th style={{ width: '120px' }}>SKU</th>
              <th>Nombre del Producto</th>
              <th className="text-right" style={{ width: '120px' }}>Precio</th>
              <th className="text-center" style={{ width: '100px' }}>Stock</th>
              <th className="text-center" style={{ width: '80px' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  <input
                    type="checkbox"
                    className="selected-products-checkbox"
                    checked={true}
                    onChange={() => onToggleActive && onToggleActive(product._id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td>
                  <span className="selected-product-sku">{product.sku || '-'}</span>
                </td>
                <td>
                  <div className="selected-product-name">{product.name}</div>
                  {product.brand && (
                    <div className="selected-product-brand">Marca: {product.brand}</div>
                  )}
                </td>
                <td className="text-right">
                  <span className="selected-product-price">
                    ${product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="text-center">
                  <span className={`selected-product-stock ${product.stock <= (product.min_stock_alert || 0) ? 'low' : ''}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="text-center">
                  <button
                    className="selected-product-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(product._id);
                    }}
                    title="Quitar de la regla"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
