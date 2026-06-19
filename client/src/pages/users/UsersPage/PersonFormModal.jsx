import React, { useState } from 'react';
import { apiRequest } from '../../../services/api.js';
import './PersonFormModal.css';

export default function PersonFormModal({ onClose, onPersonCreated }) {
  const [formData, setFormData] = useState({
    dni: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: ''
    }
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si es un campo de dirección
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.dni.trim()) {
      setError('El DNI es obligatorio');
      return;
    }
    if (!formData.first_name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!formData.last_name.trim()) {
      setError('El apellido es obligatorio');
      return;
    }

    setSaving(true);

    try {
      // Limpiar campos vacíos del address
      const payload = { ...formData };
      const hasAddress = Object.values(payload.address).some(v => v.trim() !== '');
      if (!hasAddress) {
        delete payload.address;
      }

      const response = await apiRequest('/api/persons', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const newPerson = response.data || response;
      onPersonCreated(newPerson);
    } catch (err) {
      console.error('Error creando persona:', err);
      setError(err.message || 'Error al crear la persona');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="person-form-overlay" onClick={onClose}>
      <div className="person-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="person-form-header">
          <h2>Crear Nueva Persona</h2>
          <button className="person-form-close" onClick={onClose}></button>
        </div>

        <form className="person-form-body" onSubmit={handleSubmit}>
          {error && <div className="person-form-error">{error}</div>}

          <div className="person-form-section">
            <h3 className="person-form-section-title">Datos Personales</h3>
            <div className="person-form-grid">
              <div className="person-form-field">
                <label>DNI *</label>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  placeholder="ej. 12345678"
                  disabled={saving}
                />
              </div>

              <div className="person-form-field">
                <label>Nombre *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="ej. Juan"
                  disabled={saving}
                />
              </div>

              <div className="person-form-field">
                <label>Apellido *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="ej. Pérez"
                  disabled={saving}
                />
              </div>

              <div className="person-form-field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ej. juan@email.com"
                  disabled={saving}
                />
              </div>

              <div className="person-form-field">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="ej. 1123456789"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <div className="person-form-section">
            <h3 className="person-form-section-title">Dirección (opcional)</h3>
            <div className="person-form-grid">
              <div className="person-form-field field-span-2">
                <label>Calle</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  placeholder="ej. Av. Siempre Viva"
                  disabled={saving}
                />
              </div>

              <div className="person-form-field">
                <label>Número</label>
                <input
                  type="text"
                  name="address.number"
                  value={formData.address.number}
                  onChange={handleChange}
                  placeholder="ej. 123"
                  disabled={saving}
                />
              </div>

              <div className="person-form-field">
                <label>Barrio</label>
                <input
                  type="text"
                  name="address.neighborhood"
                  value={formData.address.neighborhood}
                  onChange={handleChange}
                  placeholder="ej. Centro"
                  disabled={saving}
                />
              </div>

              <div className="person-form-field">
                <label>Ciudad</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  placeholder="ej. Buenos Aires"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <div className="person-form-footer">
            <button 
              type="button" 
              className="person-form-btn secondary" 
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="person-form-btn primary"
              disabled={saving}
            >
              {saving ? 'Creando...' : 'Crear Persona'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}