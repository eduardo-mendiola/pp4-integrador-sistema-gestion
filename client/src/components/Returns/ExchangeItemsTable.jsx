import React from 'react';
import ExchangeItemRow from './ExchangeItemRow';
import './ExchangeItemsTable.css';

export default function ExchangeItemsTable({
  items,
  editingQuantities,
  itemDiscounts,
  onRemoveItem,
  onToggleActive,
  onRowFocus,
  onQuantityChange,
  onQuantityBlur,
  onQuantityKeyDown,
  onItemDiscountChange
}) {
  const activeItemsCount = items.filter(item => item.active !== false).length;
  
  if (items.length === 0) {
    return (
      <div className="exchange-empty-state">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <p>Busca y agrega productos para el cambio</p>
      </div>
    );
  }

  return (
    <div className="exchange-items-panel">
      <div className="exchange-items-header">
        <h3>Productos del Cambio</h3>
        <span className="exchange-items-count">
          {activeItemsCount} de {items.length} activos
        </span>
      </div>

      <div className="exchange-items-table-wrapper">
        <table className="exchange-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>SKU</th>
              <th>Nombre del Producto</th>
              <th className="text-center" style={{ width: '100px' }}>Cant.</th>
              <th className="text-right" style={{ width: '120px' }}>Precio</th>
              <th className="text-center" style={{ width: '90px' }}>Desc. %</th>
              <th className="text-right" style={{ width: '130px' }}>Total</th>
              <th className="text-center" style={{ width: '60px' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <ExchangeItemRow
                key={item.productId}
                item={item}
                editingQuantity={editingQuantities[item.productId]}
                itemDiscount={itemDiscounts[item.productId] || 0}
                onRemove={onRemoveItem}
                onToggleActive={onToggleActive}
                onRowFocus={onRowFocus}
                onQuantityChange={onQuantityChange}
                onQuantityBlur={onQuantityBlur}
                onQuantityKeyDown={onQuantityKeyDown}
                onItemDiscountChange={onItemDiscountChange}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}