import React from 'react';
import './CartTable.css';

export default function CartItemRow({
  item,
  isSelected,
  editingQuantity,
  onSelect,
  onRemove,
  onQuantityFocus,
  onQuantityChange,
  onQuantityBlur,
  onQuantityKeyDown
}) {
  return (
    <tr 
      className={isSelected ? 'selected' : ''}
      onClick={() => onSelect(item)}
    >
      <td>
        <input 
          type="checkbox" 
          className="sales-checkbox"
          checked={true}
          onChange={() => {}}
        />
      </td>
      <td>
        <span className="sales-product-sku">{item.sku}</span>
      </td>
      <td>
        <div className="sales-product-name">{item.name}</div>
        {item.discount > 0 && (
          <div className="sales-product-discount">
            Discount - Special Price (${item.discount.toLocaleString()})
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
        />
      </td>
      <td className="text-right">
        {item.originalPrice > item.price && (
          <span className="sales-price-original">
            ${item.originalPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        )}
        <span className="sales-price-final">
          ${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </span>
      </td>
      <td className="text-right">
        <span className="sales-price">
          ${(item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
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