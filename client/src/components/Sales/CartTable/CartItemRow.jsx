import React from 'react';
import './CartTable.css';

export default function CartItemRow({
  item,
  isSelected,
  editingQuantity,
  itemDiscount,
  onSelect,
  onRemove,
  onToggleActive,
  onQuantityFocus,
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
    <tr 
      className={`${isSelected ? 'selected' : ''} ${!isActive ? 'inactive' : ''}`}
      onClick={() => onSelect(item)}
    >
      <td>
        <input 
          type="checkbox" 
          className="sales-checkbox"
          checked={isActive}
          onChange={(e) => {
            e.stopPropagation();
            onToggleActive(item._id);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td>
        <span className="sales-product-sku">{item.sku}</span>
      </td>
      <td>
        <div className="sales-product-name">{item.name}</div>
        {item.discount > 0 && (
          <div className="sales-product-discount">
            Descuento especial (${item.discount.toLocaleString()})
          </div>
        )}
      </td>
      <td className="text-center">
        <input
          type="number"
          className="sales-quantity-input"
          value={editingQuantity ?? item.quantity}
          onFocus={(e) => onQuantityFocus(e, item)}
          onChange={(e) => onQuantityChange(item._id, e.target.value)}
          onBlur={() => onQuantityBlur(item._id)}
          onKeyDown={(e) => onQuantityKeyDown(e, item._id)}
          min="1"
          onClick={(e) => e.stopPropagation()}
          disabled={!isActive}
        />
      </td>
      <td className="text-right">
        {item.originalPrice > item.price && (
          <span className="sales-price-original">
            ${item.originalPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        )}
        <span className="sales-price-final">
          ${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </span>
      </td>
      <td className="text-center">
        <div className="sales-discount-wrapper">
          <input
            type="number"
            className="sales-discount-input"
            value={itemDiscount || 0}
            onChange={(e) => {
              e.stopPropagation();
              const value = parseFloat(e.target.value) || 0;
              onItemDiscountChange(item._id, Math.min(Math.max(0, value), 100));
            }}
            onClick={(e) => e.stopPropagation()}
            min="0"
            max="100"
            disabled={!isActive}
            title="Descuento %"
          />
          <span className="sales-discount-suffix">%</span>
        </div>
      </td>
      <td className="text-right">
        {itemDiscount > 0 && (
          <span className="sales-price-discount">
            -${itemDiscountAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        )}
        <span className="sales-price">
          ${itemTotalAfterDiscount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </span>
      </td>
      <td className="text-center">
        <button 
          className="sales-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item._id);
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