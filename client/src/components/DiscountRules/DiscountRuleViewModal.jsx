import React from 'react';
import './DiscountRuleViewModal.css';
import { Permission } from '../Permission';

const AGE_RANGE_LABELS = {
  '0-2': '0 a 2 años',
  '3-5': '3 a 5 años',
  '6-8': '6 a 8 años',
  '9-12': '9 a 12 años',
  '13+': '13+ años'
};

export default function DiscountRuleViewModal({ isOpen, rule, onClose, onEdit }) {
  if (!isOpen || !rule) return null;

  const conditions = rule.conditions || {};

  const hasIdentityFilters = 
    (conditions.productIds?.length > 0) ||
    (conditions.brands?.length > 0) ||
    (conditions.supplierIds?.length > 0) ||
    (conditions.ageRanges?.length > 0);

  const hasStateFilters = 
    conditions.minMonthsWithoutSale != null ||
    conditions.maxMonthsWithoutSale != null ||
    conditions.minStockQuantity != null ||
    conditions.maxStockQuantity != null ||
    conditions.minDaysInStock != null ||
    conditions.maxDaysInStock != null;

  const renderRange = (label, min, max, unit) => {
    const minStr = min != null ? min : '0';
    const maxStr = max != null ? max : '∞';
    return (
      <div className="rule-view-range-item">
        <span className="range-label">{label}:</span>
        <span className="range-value">
          {minStr} {unit} → {maxStr} {unit}
        </span>
      </div>
    );
  };

  return (
    <div className="rule-view-overlay" onClick={onClose}>
      <div className="rule-view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rule-view-header">
          <div>
            <h2>Detalle de Regla de Descuento</h2>
            <span className="rule-view-id">ID: {(rule._id || '').slice(-8).toUpperCase()}</span>
          </div>
          <div className="rule-view-header-actions">
            <span 
              className={`rule-view-status ${rule.active ? 'active' : 'inactive'}`}
            >
              {rule.active ? 'Activa' : 'Inactiva'}
            </span>
            <button className="rule-view-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="rule-view-body">
          {/* Información General */}
          <div className="rule-view-section">
            <h3 className="rule-view-section-title">Información General</h3>
            <div className="rule-view-grid">
              <div className="rule-view-field">
                <span className="rule-view-field-label">Nombre</span>
                <span className="rule-view-field-value">{rule.name}</span>
              </div>
              <div className="rule-view-field">
                <span className="rule-view-field-label">Porcentaje</span>
                <span className="rule-view-field-value percentage">{rule.percentage}%</span>
              </div>
            </div>
          </div>

          {/* Filtros de Identidad */}
          {hasIdentityFilters && (
            <div className="rule-view-section">
              <h3 className="rule-view-section-title">Aplicado a</h3>
              
              {/* Productos en formato LISTA */}
              {conditions.productIds?.length > 0 && (
                <div className="rule-view-subsection">
                  <span className="subsection-label">
                    Productos específicos ({conditions.productIds.length}):
                  </span>
                  <div className="rule-view-list">
                    {conditions.productIds.map(p => {
                      const product = typeof p === 'object' ? p : { _id: p, name: 'Producto' };
                      return (
                        <div key={product._id} className="rule-view-list-item product">
                          <div className="rule-view-list-item-main">
                            <span className="rule-view-list-item-name">{product.name}</span>
                            {product.sku && (
                              <span className="rule-view-list-item-sku">SKU: {product.sku}</span>
                            )}
                          </div>
                          <div className="rule-view-list-item-details">
                            {product.brand && (
                              <span className="rule-view-list-item-brand">{product.brand}</span>
                            )}
                            {product.price != null && (
                              <span className="rule-view-list-item-price">
                                ${product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Marcas como badges (texto corto) */}
              {conditions.brands?.length > 0 && (
                <div className="rule-view-subsection">
                  <span className="subsection-label">Marcas:</span>
                  <div className="rule-view-badges">
                    {conditions.brands.map(brand => (
                      <span key={brand} className="rule-view-badge brand">{brand}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* ✅ NUEVO: Proveedores en formato LISTA */}
              {conditions.supplierIds?.length > 0 && (
                <div className="rule-view-subsection">
                  <span className="subsection-label">
                    Proveedores ({conditions.supplierIds.length}):
                  </span>
                  <div className="rule-view-list">
                    {conditions.supplierIds.map(s => {
                      const supplier = typeof s === 'object' ? s : { _id: s, name: 'Proveedor' };
                      return (
                        <div key={supplier._id} className="rule-view-list-item supplier">
                          <div className="rule-view-list-item-main">
                            <span className="rule-view-list-item-name">
                              {supplier.business_name || supplier.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rangos etarios como badges */}
              {conditions.ageRanges?.length > 0 && (
                <div className="rule-view-subsection">
                  <span className="subsection-label">Rangos etarios:</span>
                  <div className="rule-view-badges">
                    {conditions.ageRanges.map(range => (
                      <span key={range} className="rule-view-badge age">
                        {AGE_RANGE_LABELS[range] || range}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filtros de Estado */}
          {hasStateFilters && (
            <div className="rule-view-section">
              <h3 className="rule-view-section-title">Condiciones de Estado</h3>
              <div className="rule-view-ranges">
                {(conditions.minMonthsWithoutSale != null || conditions.maxMonthsWithoutSale != null) && 
                  renderRange('Tiempo sin vender', conditions.minMonthsWithoutSale, conditions.maxMonthsWithoutSale, 'meses')}
                
                {(conditions.minStockQuantity != null || conditions.maxStockQuantity != null) && 
                  renderRange('Cantidad en stock', conditions.minStockQuantity, conditions.maxStockQuantity, 'uds')}
                
                {(conditions.minMonthsInStock != null || conditions.maxMonthsInStock != null) && 
                  renderRange('Tiempo en stock', conditions.minMonthsInStock, conditions.maxMonthsInStock, 'meses')}
              </div>
            </div>
          )}

          {/* Info de fechas */}
          <div className="rule-view-section">
            <div className="rule-view-dates">
              <span>Creada: {new Date(rule.createdAt).toLocaleDateString('es-AR')}</span>
              <span>Actualizada: {new Date(rule.updatedAt).toLocaleDateString('es-AR')}</span>
            </div>
          </div>
        </div>

        <div className="rule-view-footer">
          <button className="rule-view-btn secondary" onClick={onClose}>
            Cerrar
          </button>
          <Permission permission="edit_discount_rules">
            {onEdit && (
              <button className="rule-view-btn primary" onClick={() => onEdit(rule)}>
                ✏️ Editar Regla
              </button>
            )}
          </Permission>
        </div>
      </div>
    </div>
  );
}
