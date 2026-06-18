import React, { useState } from 'react';
import Modal from '../../components/Modal.jsx';
import { apiRequest } from '../../services/api.js';

const STATUS_OPTIONS = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'SUSPENDIDO', label: 'Suspendido' },
  { value: 'CANCELADO', label: 'Cancelado' }
];

const buildInitialForm = (supplier) => ({
  name: supplier?.name || '',
  contact_name: supplier?.contact_name || '',
  phone: supplier?.phone || '',
  email: supplier?.email || '',
  address: supplier?.address || '',
  status: supplier?.status || 'ACTIVO'
});

export default function SupplierFormModal({ supplier, onClose, onSaved }) {
  const isEditing = Boolean(supplier?._id || supplier?.id);
  const [form, setForm] = useState(() => buildInitialForm(supplier));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError('El nombre del proveedor es obligatorio.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        name: form.name.trim(),
        contact_name: form.contact_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim()
      };

      if (isEditing) {
        payload.status = form.status;
      }

      const id = supplier?._id || supplier?.id;
      await apiRequest(isEditing ? `/api/suppliers/${id}` : '/api/suppliers', {
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
    <Modal title={isEditing ? 'Editar proveedor' : 'Nuevo proveedor'} size="lg" onClose={onClose}>
      <form className="crud-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <label htmlFor="name">Nombre</label>
            <input id="name" name="name" type="text" value={form.name} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="contact_name">Nombre de contacto</label>
            <input
              id="contact_name"
              name="contact_name"
              type="text"
              value={form.contact_name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="phone">Teléfono</label>
            <input id="phone" name="phone" type="text" value={form.phone} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
          </div>

          <div className="field-span-2">
            <label htmlFor="address">Dirección</label>
            <input id="address" name="address" type="text" value={form.address} onChange={handleChange} />
          </div>

          {isEditing ? (
            <div>
              <label htmlFor="status">Estado</label>
              <select id="status" name="status" value={form.status} onChange={handleChange}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        <div className="form-actions modal-actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear proveedor'}
          </button>
          <button type="button" className="secondary-button" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
