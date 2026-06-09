import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FiX, FiPackage, FiTag, FiDollarSign, FiAlertCircle } from 'react-icons/fi';
import './ProductModal.css';

const DEFAULT_IMAGE = '/images/imagen-no-disponible-750x750.png';

export default function ProductModal({ product, onClose }) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  if (!product) return null;

  const imageUrl = product.image || DEFAULT_IMAGE;

  const handleImageError = () => {
    setImgError(true);
  };

  const handleViewProduct = () => {
    onClose();
    navigate(`/productos/${product._id}`);
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header con título y botón cerrar */}
        <div className="modal-header">
          <h2>{product.name}</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Body con 3 columnas */}
        <div className="modal-body">
          <div className="modal-content">
            {/* Columna 1: SKU, Precio, Edad */}
            <div className="modal-column">
              <div className="modal-field">
                <FiPackage className="modal-icon" />
                <div>
                  <div className="modal-label">SKU</div>
                  <div className="modal-value">{product.sku}</div>
                </div>
              </div>

              <div className="modal-field">
                <FiDollarSign className="modal-icon" />
                <div>
                  <div className="modal-label">Precio</div>
                  <div className="modal-value modal-price">${product.price?.toLocaleString()}</div>
                </div>
              </div>

              {product.age_range && (
                <div className="modal-field">
                  <div className="modal-label">Rango de edad</div>
                  <div className="modal-value">{product.age_range} años</div>
                </div>
              )}
            </div>

            {/* Columna 2: Categoría, Stock */}
            <div className="modal-column">
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
                <FiAlertCircle className="modal-icon" />
                <div>
                  <div className="modal-label">Stock</div>
                  <div className={`modal-value ${product.stock <= product.min_stock_alert ? 'modal-low-stock' : ''}`}>
                    {product.stock} unidades
                  </div>
                </div>
              </div>

              {product.metadata?.brand && (
                <div className="modal-field">
                  <div className="modal-label">Marca</div>
                  <div className="modal-value">{product.metadata.brand}</div>
                </div>
              )}
            </div>

            {/* Columna 3: Imagen */}
            <div className="modal-column modal-image-column">
              <img
                src={imgError ? DEFAULT_IMAGE : imageUrl}
                alt={product.name}
                className="modal-product-image"
                onError={handleImageError}
              />
            </div>
          </div>

          {product.stock <= product.min_stock_alert && (
            <div className="modal-alert">
              ⚠️ Stock bajo: quedan {product.stock} unidades (mínimo: {product.min_stock_alert})
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
          <button className="btn-primary" onClick={handleViewProduct}>
            Ver producto completo
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}