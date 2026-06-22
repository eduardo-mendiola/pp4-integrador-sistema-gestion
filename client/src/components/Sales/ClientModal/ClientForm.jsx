import React, { useState, useEffect } from 'react';
import './ClientForm.css';

const INITIAL_FORM = {
  document_type: 'DNI',
  document_number: '',
  client_type: 'CONSUMIDOR_FINAL',
  first_name: '',
  last_name: '',
  business_name: '',
  email: '',
  phone: '',
  address: {
    street: '',
    number: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Argentina'
  }
};

export default function ClientForm({ client, saving, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client) {
      setFormData({
        document_type: client.document_type || 'DNI',
        document_number: client.document_number || '',
        client_type: client.client_type || 'CONSUMIDOR_FINAL',
        first_name: client.first_name || '',
        last_name: client.last_name || '',
        business_name: client.business_name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: {
          street: client.address?.street || '',
          number: client.address?.number || '',
          city: client.address?.city || '',
          state: client.address?.state || '',
          postal_code: client.address?.postal_code || '',
          country: client.address?.country || 'Argentina'
        }
      });
    } else {
      setFormData(INITIAL_FORM);
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Campo anidado (ej: address.street)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.document_number.trim()) {
      newErrors.document_number = 'El documento es obligatorio';
    }
    
    if (formData.client_type === 'CONSUMIDOR_FINAL') {
      if (!formData.first_name.trim() && !formData.business_name.trim()) {
        newErrors.name = 'Ingrese nombre o razón social';
      }
    } else {
      if (!formData.business_name.trim()) {
        newErrors.business_name = 'La razón social es obligatoria';
      }
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const result = await onSubmit(formData);
    
    if (!result.success) {
      setErrors({ submit: result.error });
    }
  };

  const isCompany = formData.client_type !== 'CONSUMIDOR_FINAL';

  return (
    <form className="client-form" onSubmit={handleSubmit}>
      {errors.submit && (
        <div className="client-form-error">
          {errors.submit}
        </div>
      )}

      <div className="client-form-section">
        <h3>Información Fiscal</h3>
        <div className="client-form-grid">
          <div className="client-form-field">
            <label>Tipo de Documento *</label>
            <select
              name="document_type"
              value={formData.document_type}
              onChange={handleChange}
              disabled={!!client}
            >
              <option value="DNI">DNI</option>
              <option value="CUIT">CUIT</option>
              <option value="CUIL">CUIL</option>
              <option value="PASAPORTE">Pasaporte</option>
              <option value="CDI">CDI</option>
              <option value="LC">LC</option>
            </select>
          </div>

          <div className="client-form-field">
            <label>Número de Documento *</label>
            <input
              type="text"
              name="document_number"
              value={formData.document_number}
              onChange={handleChange}
              placeholder="Ej: 12345678"
              disabled={!!client}
            />
            {errors.document_number && (
              <span className="client-form-field-error">{errors.document_number}</span>
            )}
          </div>

          <div className="client-form-field full-width">
            <label>Condición ante IVA *</label>
            <select
              name="client_type"
              value={formData.client_type}
              onChange={handleChange}
            >
              <option value="CONSUMIDOR_FINAL">Consumidor Final</option>
              <option value="RESPONSABLE_INSCRIPTO">Responsable Inscripto</option>
              <option value="MONOTRIBUTISTA">Monotributista</option>
              <option value="EXENTO">Exento</option>
            </select>
          </div>
        </div>
      </div>

      <div className="client-form-section">
        <h3>{isCompany ? 'Datos de la Empresa' : 'Datos Personales'}</h3>
        <div className="client-form-grid">
          {isCompany ? (
            <div className="client-form-field full-width">
              <label>Razón Social *</label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                placeholder="Nombre de la empresa"
              />
              {errors.business_name && (
                <span className="client-form-field-error">{errors.business_name}</span>
              )}
            </div>
          ) : (
            <>
              <div className="client-form-field">
                <label>Nombre</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Nombre"
                />
              </div>

              <div className="client-form-field">
                <label>Apellido</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Apellido"
                />
              </div>

              {errors.name && (
                <div className="client-form-field full-width">
                  <span className="client-form-field-error">{errors.name}</span>
                </div>
              )}
            </>
          )}

          <div className="client-form-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@ejemplo.com"
            />
            {errors.email && (
              <span className="client-form-field-error">{errors.email}</span>
            )}
          </div>

          <div className="client-form-field">
            <label>Teléfono</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+54 11 1234-5678"
            />
          </div>
        </div>
      </div>

      <div className="client-form-section">
        <h3>Dirección</h3>
        <div className="client-form-grid">
          <div className="client-form-field" style={{ flex: 2 }}>
            <label>Calle</label>
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              placeholder="Nombre de la calle"
            />
          </div>

          <div className="client-form-field">
            <label>Número</label>
            <input
              type="text"
              name="address.number"
              value={formData.address.number}
              onChange={handleChange}
              placeholder="123"
            />
          </div>

          <div className="client-form-field">
            <label>Ciudad</label>
            <input
              type="text"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              placeholder="Ciudad"
            />
          </div>

          <div className="client-form-field">
            <label>Provincia</label>
            <input
              type="text"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              placeholder="Provincia"
            />
          </div>

          <div className="client-form-field">
            <label>Código Postal</label>
            <input
              type="text"
              name="address.postal_code"
              value={formData.address.postal_code}
              onChange={handleChange}
              placeholder="1234"
            />
          </div>

          <div className="client-form-field">
            <label>País</label>
            <input
              type="text"
              name="address.country"
              value={formData.address.country}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="client-form-actions">
        <button 
          type="button" 
          className="client-form-btn cancel"
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="client-form-btn submit"
          disabled={saving}
        >
          {saving ? 'Guardando...' : (client ? 'Actualizar Cliente' : 'Crear Cliente')}
        </button>
      </div>
    </form>
  );
}
