import React, { useState, useEffect } from 'react';
import './PromotionModal.css';

export default function PromotionModal({ isOpen, promotion, discountRules, saving, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    discountRuleIds: [],
    startDate: '',
    durationDays: 30,
    active: true
  });

  const [errors, setErrors] = useState({});
  const [calculatedEndDate, setCalculatedEndDate] = useState('');

  useEffect(() => {
    if (promotion) {
      const startStr = promotion.startDate ? new Date(promotion.startDate).toISOString().split('T')[0] : '';
      setFormData({
        name: promotion.name || '',
        discountRuleIds: Array.isArray(promotion.discountRuleIds) 
          ? promotion.discountRuleIds.map(r => r._id || r) 
          : [],
        startDate: startStr,
        durationDays: promotion.durationDays || 30,
        active: promotion.active !== undefined ? promotion.active : true
      });
    } else {
      setFormData({
        name: '',
        discountRuleIds: [],
        startDate: new Date().toISOString().split('T')[0],
        durationDays: 30,
        active: true
      });
    }
    setErrors({});
  }, [promotion, isOpen]);

  // Calcular fecha de fin automáticamente
  useEffect(() => {
    if (formData.startDate && formData.durationDays > 0) {
      const start = new Date(formData.startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + Number(formData.durationDays));
      setCalculatedEndDate(end.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    } else {
      setCalculatedEndDate('-');
    }
  }, [formData.startDate, formData.durationDays]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRuleToggle = (ruleId) => {
    setFormData(prev => {
      const isSelected = prev.discountRuleIds.includes(ruleId);
      const newRules = isSelected
        ? prev.discountRuleIds.filter(id => id !== ruleId)
        : [...prev.discountRuleIds, ruleId];
      
      return { ...prev, discountRuleIds: newRules };
    });
    
    if (errors.discountRuleIds) {
      setErrors(prev => ({ ...prev, discountRuleIds: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (formData.discountRuleIds.length === 0) {
      newErrors.discountRuleIds = 'Debes seleccionar al menos una regla de descuento';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es obligatoria';
    }
    
    if (!formData.durationDays || formData.durationDays < 1) {
      newErrors.durationDays = 'La duración debe ser de al menos 1 día';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    onSave({
      name: formData.name.trim(),
      discountRuleIds: formData.discountRuleIds,
      startDate: formData.startDate,
      durationDays: Number(formData.durationDays),
      active: formData.active
    });
  };

  if (!isOpen) return null;

  return (
    <div className="promotion-modal-overlay" onClick={onClose}>
      <div className="promotion-modal" onClick={(e) => e.stopPropagation()}>
        <div className="promotion-modal-header">
          <div>
            <h2>{promotion ? 'Editar Promoción' : 'Nueva Promoción'}</h2>
            {promotion && (
              <span className="promotion-modal-id">ID: {(promotion._id || '').slice(-8).toUpperCase()}</span>
            )}
          </div>
          <button className="promotion-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="promotion-modal-body">
            <div className="promotion-modal-section">
              <h3 className="promotion-modal-section-title">Información General</h3>
              
              <div className="promotion-form-group">
                <label htmlFor="name">Nombre de la Promoción *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Promo Día del Niño 2026"
                  className={errors.name ? 'error' : ''}
                  autoFocus
                />
                {errors.name && <span className="promotion-error-message">{errors.name}</span>}
              </div>
            </div>

            <div className="promotion-modal-section">
              <h3 className="promotion-modal-section-title">Reglas de Descuento Aplicables *</h3>
              <div className={`promotion-rules-list ${errors.discountRuleIds ? 'error-border' : ''}`}>
                {discountRules.length === 0 ? (
                  <p className="promotion-empty-rules">
                    No hay reglas de descuento creadas. <br/>
                    <small>Crea reglas primero en la sección "Reglas de descuento".</small>
                  </p>
                ) : (
                  discountRules.map(rule => (
                    <label key={rule._id} className="promotion-rule-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.discountRuleIds.includes(rule._id)}
                        onChange={() => handleRuleToggle(rule._id)}
                      />
                      <span className="rule-info">
                        <span className="rule-name">{rule.name}</span>
                        <span className="rule-detail">
                          {rule.percentage}% descuento
                        </span>
                      </span>
                    </label>
                  ))
                )}
              </div>
              {errors.discountRuleIds && (
                <span className="promotion-error-message">{errors.discountRuleIds}</span>
              )}
            </div>

            <div className="promotion-modal-section">
              <h3 className="promotion-modal-section-title">Vigencia</h3>
              <div className="promotion-form-grid">
                <div className="promotion-form-group">
                  <label htmlFor="startDate">Fecha de Inicio *</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={errors.startDate ? 'error' : ''}
                  />
                  {errors.startDate && <span className="promotion-error-message">{errors.startDate}</span>}
                </div>

                <div className="promotion-form-group">
                  <label htmlFor="durationDays">Duración (días) *</label>
                  <input
                    type="number"
                    id="durationDays"
                    name="durationDays"
                    value={formData.durationDays}
                    onChange={handleChange}
                    min="1"
                    className={errors.durationDays ? 'error' : ''}
                  />
                  {errors.durationDays && <span className="promotion-error-message">{errors.durationDays}</span>}
                </div>
              </div>

              <div className="promotion-form-group">
                <label>Fecha de Fin (Calculada)</label>
                <div className="promotion-readonly-field">
                  {calculatedEndDate}
                </div>
                <small className="promotion-form-hint">
                  Se calcula automáticamente sumando los días de duración a la fecha de inicio.
                </small>
              </div>

              <div className="promotion-form-group promotion-checkbox-group">
                <label className="promotion-checkbox-label">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                  />
                  <span>Promoción Activa</span>
                </label>
                <small className="promotion-form-hint">
                  Las promociones inactivas no se aplicarán, incluso si la fecha es válida.
                </small>
              </div>
            </div>
          </div>

          <div className="promotion-modal-footer">
            <button type="button" className="promotion-modal-btn secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="promotion-modal-btn primary" disabled={saving}>
              {saving ? 'Guardando...' : (promotion ? 'Actualizar Promoción' : 'Crear Promoción')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}