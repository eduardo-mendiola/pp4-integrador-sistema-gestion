import React, { useState } from 'react';
import Modal from '../../components/Modal.jsx';
import { apiRequest } from '../../services/api.js';

const DOCUMENT_TYPES = ['DNI', 'CUIT', 'CUIL', 'PASAPORTE', 'CDI', 'LC'];

const CLIENT_TYPES = [
  { value: 'CONSUMIDOR_FINAL', label: 'Consumidor final' },
  { value: 'RESPONSABLE_INSCRIPTO', label: 'Responsable inscripto' },
  { value: 'MONOTRIBUTISTA', label: 'Monotributista' },
  { value: 'EXENTO', label: 'Exento' }
];

const EMPTY_FORM = {
  document_type: 'DNI',
  document_number: '',
  client_type: 'CONSUMIDOR_FINAL',
  business_name: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  active: true,
  address: {
    street: '',
    number: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Argentina'
  }
};

// Construye el estado inicial del formulario a partir del cliente existente (si se proporciona) o con valores vacíos para un nuevo cliente.
const buildInitialForm = (client) => {
  if (!client) {
    return { ...EMPTY_FORM, address: { ...EMPTY_FORM.address } };
  }

  return {
    document_type: client.document_type || 'DNI',
    document_number: client.document_number || '',
    client_type: client.client_type || 'CONSUMIDOR_FINAL',
    business_name: client.business_name || '',
    first_name: client.first_name || '',
    last_name: client.last_name || '',
    email: client.email || '',
    phone: client.phone || '',
    active: client.active !== false,
    address: {
      street: client.address?.street || '',
      number: client.address?.number || '',
      city: client.address?.city || '',
      state: client.address?.state || '',
      postal_code: client.address?.postal_code || '',
      country: client.address?.country || 'Argentina'
    }
  };
};

export default function ClientFormModal({ client, onClose, onSaved }) {
  const isEditing = Boolean(client?._id || client?.id);
  const [form, setForm] = useState(() => buildInitialForm(client));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, address: { ...current.address, [name]: value } }));
  };

  const handleStatusChange = (event) => {
    setForm((current) => ({ ...current, active: event.target.value === 'true' }));
  };

  const validate = () => {
    if (!isEditing && !form.document_number.trim()) {
      return 'El número de documento es obligatorio.';
    }

    const hasName =
      form.business_name.trim() || (form.first_name.trim() && form.last_name.trim());
    if (!hasName) {
      return 'Indicá una razón social o un nombre y apellido.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        client_type: form.client_type,
        business_name: form.business_name.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: { ...form.address }
      };

      if (isEditing) {
        payload.active = form.active;
      } else {
        payload.document_type = form.document_type;
        payload.document_number = form.document_number.trim();
      }

      const id = client?._id || client?.id;
      await apiRequest(isEditing ? `/api/clients/${id}` : '/api/clients', {
        method: isEditing ? 'PATCH' : 'POST',
        body: JSON.stringify(payload)
      });

      onSaved();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEditing ? 'Editar cliente' : 'Nuevo cliente'} size="lg" onClose={onClose}>
      <form className="crud-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <label htmlFor="document_type">Tipo de documento</label>
            <select
              id="document_type"
              name="document_type"
              value={form.document_type}
              onChange={handleChange}
              disabled={isEditing}
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="document_number">Número de documento</label>
            <input
              id="document_number"
              name="document_number"
              type="text"
              value={form.document_number}
              onChange={handleChange}
              disabled={isEditing}
            />
          </div>

          <div>
            <label htmlFor="client_type">Tipo de cliente</label>
            <select id="client_type" name="client_type" value={form.client_type} onChange={handleChange}>
              {CLIENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="business_name">Razón social</label>
            <input
              id="business_name"
              name="business_name"
              type="text"
              value={form.business_name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="first_name">Nombre</label>
            <input id="first_name" name="first_name" type="text" value={form.first_name} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="last_name">Apellido</label>
            <input id="last_name" name="last_name" type="text" value={form.last_name} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="phone">Teléfono</label>
            <input id="phone" name="phone" type="text" value={form.phone} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="street">Calle</label>
            <input id="street" name="street" type="text" value={form.address.street} onChange={handleAddressChange} />
          </div>

          <div>
            <label htmlFor="number">Número</label>
            <input id="number" name="number" type="text" value={form.address.number} onChange={handleAddressChange} />
          </div>

          <div>
            <label htmlFor="city">Ciudad</label>
            <input id="city" name="city" type="text" value={form.address.city} onChange={handleAddressChange} />
          </div>

          <div>
            <label htmlFor="state">Provincia</label>
            <input id="state" name="state" type="text" value={form.address.state} onChange={handleAddressChange} />
          </div>

          <div>
            <label htmlFor="postal_code">Código postal</label>
            <input
              id="postal_code"
              name="postal_code"
              type="text"
              value={form.address.postal_code}
              onChange={handleAddressChange}
            />
          </div>

          <div>
            <label htmlFor="country">País</label>
            <input id="country" name="country" type="text" value={form.address.country} onChange={handleAddressChange} />
          </div>

          {isEditing ? (
            <div>
              <label htmlFor="active">Estado</label>
              <select id="active" name="active" value={String(form.active)} onChange={handleStatusChange}>
                <option value="true">Activo</option>
                <option value="false">Cancelado</option>
              </select>
            </div>
          ) : null}
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        <div className="form-actions modal-actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear cliente'}
          </button>
          <button type="button" className="secondary-button" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
