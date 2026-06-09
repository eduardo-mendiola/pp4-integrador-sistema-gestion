import React from 'react';
import CartItemRow from './CartItemRow';
import './CartTable.css';

export default function CartTable({
  items,
  selectedItemId,
  editingQuantities,
  onSelectItem,
  onRemoveItem,
  onQuantityFocus,
  onQuantityChange,
  onQuantityBlur,
  onQuantityKeyDown
}) {
  return (
    <div className="sales-products-panel">
      <div className="sales-products-header">
        <h3>Productos</h3>
        <span className="sales-items-count">{items.length} items</span>
      </div>

      {items.length === 0 ? (
        <div className="sales-empty-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p>Busca y agrega productos al carrito</p>
        </div>
      ) : (
        <div className="sales-products-table">
          <table className="sales-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>SKU</th>
                <th>Nombre del Producto</th>
                <th className="text-center" style={{ width: '100px' }}>Cant.</th>
                <th className="text-right" style={{ width: '120px' }}>Precio</th>
                <th className="text-right" style={{ width: '120px' }}>Total</th>
                <th className="text-center" style={{ width: '60px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <CartItemRow
                  key={item._id}
                  item={item}
                  isSelected={selectedItemId === item._id}
                  editingQuantity={editingQuantities[item._id]}
                  onSelect={onSelectItem}
                  onRemove={onRemoveItem}
                  onQuantityFocus={onQuantityFocus}
                  onQuantityChange={onQuantityChange}
                  onQuantityBlur={onQuantityBlur}
                  onQuantityKeyDown={onQuantityKeyDown}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}