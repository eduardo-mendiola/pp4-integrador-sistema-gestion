import React, { useState, useEffect } from 'react';
import './DiscountRuleModal.css';

export default function DiscountRuleModal({ isOpen, rule, saving, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    timeWithoutSaleMonths: 0,
    percentage: 0,
    active: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name || '',
        timeWithoutSaleMonths: rule.timeWithoutSaleMonths || 0,
        percentage: rule.percentage || 0,
        active: rule.active !== undefined ? rule.active : true
      });
    } else {
      setFormData({
        name: '',
        timeWithoutSaleMonths: 0,
        percentage: 0,
        active: true
      });
    }
    setErrors({});
  }, [rule, isOpen]);

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

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (formData.timeWithoutSaleMonths < 0) {
      newErrors.timeWithoutSaleMonths = 'Los meses deben ser mayor o igual a 0';
    }
    
    if (formData.percentage < 0 || formData.percentage > 100) {
      newErrors.percentage = 'El porcentaje debe estar entre 0 y 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    onSave({
      name: formData.name.trim(),
      timeWithoutSaleMonths: Number(formData.timeWithoutSaleMonths),
      percentage: Number(formData.percentage),
      active: formData.active
    });
  };

  if (!isOpen) return null;

  return (
    <div className="rule-modal-overlay" onClick={onClose}>
      <div className="rule-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rule-modal-header">
          <div>
            <h2>{rule ? 'Editar Regla' : 'Nueva Regla de Descuento'}</h2>
            {rule && (
              <span className="rule-modal-id">ID: {(rule._id || '').slice(-8).toUpperCase()}</span>
            )}
          </div>
          <button className="rule-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rule-modal-body">
            <div className="rule-modal-section">
              <h3 className="rule-modal-section-title">Información de la Regla</h3>
              
              <div className="rule-form-group">
                <label htmlFor="name">Nombre de la Regla *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Descuento por inactividad 3 meses"
                  className={errors.name ? 'error' : ''}
                  autoFocus
                />
                {errors.name && <span className="rule-error-message">{errors.name}</span>}
              </div>

              <div className="rule-form-grid">
                <div className="rule-form-group">
                  <label htmlFor="timeWithoutSaleMonths">Meses sin Venta *</label>
                  <input
                    type="number"
                    id="timeWithoutSaleMonths"
                    name="timeWithoutSaleMonths"
                    value={formData.timeWithoutSaleMonths}
                    onChange={handleChange}
                    min="0"
                    className={errors.timeWithoutSaleMonths ? 'error' : ''}
                  />
                  <small className="rule-form-hint">
                    Cantidad de meses que el producto debe llevar sin venderse
                  </small>
                  {errors.timeWithoutSaleMonths && (
                    <span className="rule-error-message">{errors.timeWithoutSaleMonths}</span>
                  )}
                </div>

                <div className="rule-form-group">
                  <label htmlFor="percentage">Porcentaje de Descuento *</label>
                  <div className="rule-input-with-suffix">
                    <input
                      type="number"
                      id="percentage"
                      name="percentage"
                      value={formData.percentage}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className={errors.percentage ? 'error' : ''}
                    />
                    <span className="rule-input-suffix">%</span>
                  </div>
                  {errors.percentage && (
                    <span className="rule-error-message">{errors.percentage}</span>
                  )}
                </div>
              </div>

              <div className="rule-form-group rule-checkbox-group">
                <label className="rule-checkbox-label">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                  />
                  <span>Regla Activa</span>
                </label>
                <small className="rule-form-hint">
                  Las reglas inactivas no se aplicarán automáticamente a los productos
                </small>
              </div>
            </div>
          </div>

          <div className="rule-modal-footer">
            <button type="button" className="rule-modal-btn secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="rule-modal-btn primary" disabled={saving}>
              {saving ? 'Guardando...' : (rule ? 'Actualizar Regla' : 'Crear Regla')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}