import React from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiPackage, FiTag, FiDollarSign, FiAlertCircle } from 'react-icons/fi';
import './ProductModal.css';

export default function ProductModal({ product, onClose }) {
  if (!product) return null;

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product.name}</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-grid">
            <div className="modal-field">
              <FiPackage className="modal-icon" />
              <div>
                <div className="modal-label">SKU</div>
                <div className="modal-value">{product.sku}</div>
              </div>
            </div>

            {product.category && (
              <div className="modal-field">
                <FiTag className="modal-icon" />
                <div>
                  <div className="modal-label">Categoría</div>
                  <div className="modal-value">{product.category.name}</div>
                </div>
              </div>
            )}

            <div className="modal-field">
              <FiDollarSign className="modal-icon" />
              <div>
                <div className="modal-label">Precio</div>
                <div className="modal-value modal-price">${product.price?.toLocaleString()}</div>
              </div>
            </div>

            <div className="modal-field">
              <FiAlertCircle className="modal-icon" />
              <div>
                <div className="modal-label">Stock</div>
                <div className={`modal-value ${product.stock <= product.min_stock_alert ? 'modal-low-stock' : ''}`}>
                  {product.stock} unidades
                </div>
              </div>
            </div>
          </div>

          {product.stock <= product.min_stock_alert && (
            <div className="modal-alert">
              ⚠️ Stock bajo: quedan {product.stock} unidades (mínimo: {product.min_stock_alert})
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
          <button className="btn-primary">Ver producto completo</button>
        </div>
      </div>
    </div>
  );

  // createPortal mueve el modal al final del <body>, fuera de cualquier grid u overflow
  return createPortal(modalContent, document.body);
}