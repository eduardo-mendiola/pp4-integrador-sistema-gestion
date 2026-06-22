import React from 'react';
import './PromotionViewModal.css';
import { Permission } from '../Permission';

export default function PromotionViewModal({ isOpen, promotion, onClose, onEdit }) {
  if (!isOpen || !promotion) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatus = (promo) => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    
    if (!promo.active) return { label: 'Inactiva', class: 'inactive' };
    if (now < start) return { label: 'Programada', class: 'scheduled' };
    if (now > end) return { label: 'Vencida', class: 'expired' };
    return { label: 'Activa', class: 'active' };
  };

  const getActiveDays = (promo) => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    
    if (!promo.active) return 0;
    if (now < start) return 0;
    if (now > end) return promo.durationDays;
    
    const diffTime = now - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(diffDays, promo.durationDays);
  };

  const status = getStatus(promotion);
  const activeDays = getActiveDays(promotion);

  return (
    <div className="promo-view-overlay" onClick={onClose}>
      <div className="promo-view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="promo-view-header">
          <div>
            <h2>Detalle de Promoción</h2>
            <span className="promo-view-id">ID: {(promotion._id || '').slice(-8).toUpperCase()}</span>
          </div>
          <div className="promo-view-header-actions">
            <span className={`promo-view-status ${status.class}`}>
              {status.label}
            </span>
            <button className="promo-view-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="promo-view-body">
          <div className="promo-view-section">
            <h3 className="promo-view-section-title">Información General</h3>
            <div className="promo-view-grid">
              <div className="promo-view-field">
                <span className="promo-view-field-label">Nombre</span>
                <span className="promo-view-field-value">{promotion.name}</span>
              </div>
              <div className="promo-view-field">
                <span className="promo-view-field-label">Duración Total</span>
                <span className="promo-view-field-value">{promotion.durationDays} días</span>
              </div>
            </div>
          </div>

          <div className="promo-view-section">
            <h3 className="promo-view-section-title">Vigencia</h3>
            <div className="promo-view-grid">
              <div className="promo-view-field">
                <span className="promo-view-field-label">Fecha de Inicio</span>
                <span className="promo-view-field-value">{formatDate(promotion.startDate)}</span>
              </div>
              <div className="promo-view-field">
                <span className="promo-view-field-label">Fecha de Fin</span>
                <span className="promo-view-field-value">{formatDate(promotion.endDate)}</span>
              </div>
            </div>
            <div className="promo-view-active-days">
              <span className="promo-view-active-days-label">Días activos:</span>
              <span className="promo-view-active-days-value">{activeDays} / {promotion.durationDays}</span>
            </div>
          </div>

          <div className="promo-view-section">
            <h3 className="promo-view-section-title">Reglas de Descuento Aplicables</h3>
            {promotion.discountRuleIds?.length > 0 ? (
              <div className="promo-view-rules-list">
                {promotion.discountRuleIds.map(rule => {
                  const ruleName = typeof rule === 'object' ? rule.name : 'Regla';
                  const percentage = typeof rule === 'object' ? rule.percentage : '';
                  return (
                    <div key={rule._id || rule} className="promo-view-rule-item">
                      <span className="promo-view-rule-name">{ruleName}</span>
                      <span className="promo-view-rule-percentage">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="promo-view-no-rules">No hay reglas asignadas</p>
            )}
          </div>

          <div className="promo-view-section">
            <div className="promo-view-dates">
              <span>Creada: {formatDate(promotion.createdAt)}</span>
              <span>Actualizada: {formatDate(promotion.updatedAt)}</span>
            </div>
          </div>
        </div>

        <div className="promo-view-footer">
          <button className="promo-view-btn secondary" onClick={onClose}>
            Cerrar
          </button>
          
          {/* Solo mostrar si tiene permiso de editar */}
          <Permission permission="edit_promotions">
            {onEdit && (
              <button className="promo-view-btn primary" onClick={() => onEdit(promotion)}>
                ✏️ Editar Promoción
              </button>
            )}
          </Permission>
        </div>
      </div>
    </div>
  );
}
