import React from 'react';
import './ExchangeItemsTable.css';

export default function ExchangeItemRow({
  item,
  editingQuantity,
  itemDiscount,
  onRemove,
  onToggleActive,
  onRowFocus,
  onQuantityChange,
  onQuantityBlur,
  onQuantityKeyDown,
  onItemDiscountChange
}) {
  const isActive = item.active !== false;
  const itemSubtotal = item.price * item.quantity;
  const itemDiscountAmount = itemSubtotal * ((itemDiscount || 0) / 100);
  const itemTotalAfterDiscount = itemSubtotal - itemDiscountAmount;
  
  return (
    <tr className={`${!isActive ? 'inactive' : ''}`}>
      <td>
        <input 
          type="checkbox" 
          className="exchange-checkbox"
          checked={isActive}
          onChange={(e) => {
            e.stopPropagation();
            onToggleActive(item.productId);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td>
        <span className="exchange-product-sku">{item.sku || '-'}</span>
      </td>
      <td>
        <div className="exchange-product-name">{item.name}</div>
      </td>
      <td className="text-center">
        <input
          type="number"
          className="exchange-quantity-input"
          value={editingQuantity ?? item.quantity}
          onFocus={(e) => onRowFocus(e, item)}
          onChange={(e) => onQuantityChange(item.productId, e.target.value)}
          onBlur={() => onQuantityBlur(item.productId)}
          onKeyDown={(e) => onQuantityKeyDown(e, item.productId)}
          min="1"
          onClick={(e) => e.stopPropagation()}
          disabled={!isActive}
        />
      </td>
      <td className="text-right">
        <span className="exchange-price-final">
          ${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </span>
      </td>
      <td className="text-center">
        <div className="exchange-discount-wrapper">
          <input
            type="number"
            className="exchange-discount-input"
            value={itemDiscount || 0}
            onFocus={(e) => onRowFocus(e, item)}
            onChange={(e) => {
              e.stopPropagation();
              const value = parseFloat(e.target.value) || 0;
              onItemDiscountChange(item.productId, Math.min(Math.max(0, value), 100));
            }}
            onClick={(e) => e.stopPropagation()}
            min="0"
            max="100"
            disabled={!isActive}
            title="Descuento %"
          />
          <span className="exchange-discount-suffix">%</span>
        </div>
      </td>
      <td className="text-right">
        {itemDiscount > 0 && (
          <span className="exchange-price-discount">
            -${itemDiscountAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        )}
        <span className="exchange-price">
          ${itemTotalAfterDiscount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </span>
      </td>
      <td className="text-center">
        <button 
          className="exchange-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.productId);
          }}
          title="Eliminar producto"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </td>
    </tr>
  );
}