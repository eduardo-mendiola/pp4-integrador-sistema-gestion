import React, { useEffect, useState } from 'react';
import { apiRequest, unwrapList } from '../services/api.js';
import Modal from './Modal.jsx';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const emptyToString = (value) => (value === undefined || value === null ? '' : String(value));

export default function CrudModule({ config }) {
  const [items, setItems] = useState([]);
  const [lookups, setLookups] = useState({});
  const [form, setForm] = useState(config.initialValues);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = await apiRequest(config.endpoint);
      setItems(unwrapList(payload));

      const nextLookups = {};
      for (const lookup of config.lookups || []) {
        const lookupPayload = await apiRequest(lookup.endpoint);
        nextLookups[lookup.key] = unwrapList(lookupPayload);
      }

      setLookups(nextLookups);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm(config.initialValues);
    setEditingId('');
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const buildPayload = () => {
    if (config.transformPayload) {
      return config.transformPayload(form, lookups);
    }

    if (editingId && config.mapItemToPayload) {
      return config.mapItemToPayload(form, lookups);
    }

    return { ...form };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const targetEndpoint = editingId ? `${config.endpoint}/${editingId}` : config.endpoint;
      await apiRequest(targetEndpoint, {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(buildPayload())
      });

      await loadData();
      resetForm();
      setIsModalOpen(false);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    const itemId = item._id || item.id;
    setEditingId(itemId);

    if (config.mapItemToForm) {
      setForm(config.mapItemToForm(item));
    } else {
      const nextForm = {};
      Object.keys(config.initialValues).forEach((key) => {
        nextForm[key] = item[key];
      });
      setForm(nextForm);
    }
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('¿Eliminar este registro?');
    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(`${config.endpoint}/${id}`, { method: 'DELETE' });
      await loadData();
      if (editingId === id) {
        resetForm();
      }
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const renderField = (field) => {
    const value = field.type === 'checkbox' ? Boolean(form[field.name]) : emptyToString(form[field.name]);

    if (field.type === 'textarea') {
      return <textarea name={field.name} id={field.name} rows={field.rows || 4} onChange={handleChange} value={value} />;
    }

    if (field.type === 'select') {
      const options = field.options || lookups[field.lookup] || [];

      return (
        <select name={field.name} id={field.name} onChange={handleChange} value={value}>
          <option value="">Seleccionar</option>
          {options.map((option) => {
            const optionValue = option.value || option._id || option.id;
            const optionLabel = option.label || option.name || option.username || option.code || optionValue;

            return (
              <option key={optionValue} value={optionValue}>
                {optionLabel}
              </option>
            );
          })}
        </select>
      );
    }

    if (field.type === 'checkbox') {
      return (
        <label className="checkbox-field" htmlFor={field.name}>
          <input name={field.name} id={field.name} type="checkbox" checked={Boolean(form[field.name])} onChange={handleChange} />
          <span>{field.label}</span>
        </label>
      );
    }

    return <input name={field.name} id={field.name} type={field.type || 'text'} step={field.step} onChange={handleChange} value={value} />;
  };

  if (loading) {
    return <div className="state-box">Cargando {config.title.toLowerCase()}...</div>;
  }

  return (
    <section className="module-grid">
      <header className="section-header">
        <div>
          <p className="eyebrow">Módulo</p>
          <h2>{config.title}</h2>
          <p className="section-description">{config.description}</p>
        </div>
        <div>
          <button type="button" onClick={() => { resetForm(); setIsModalOpen(true); }}>
            + Agregar {config.title}
          </button>
        </div>
      </header>

      {isModalOpen && (
        <Modal
          title={editingId ? `Editar ${config.title}` : `Agregar ${config.title}`}
          onClose={handleClose}
        >
          <form className="crud-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              {config.fields.map((field) => (
                <div key={field.name} className={field.type === 'textarea' ? 'field-span-2' : ''}>
                  {field.type !== 'checkbox' ? <label htmlFor={field.name}>{field.label}</label> : null}
                  {renderField(field)}
                </div>
              ))}
            </div>

            <div className="form-actions" style={{ marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="secondary-button" onClick={handleClose}>
                Cancelar
              </button>
              <button type="submit" disabled={saving}>
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
          {error ? <div className="error-banner" style={{ marginTop: '1rem' }}>{error}</div> : null}
        </Modal>
      )}

      <div className="panel">
        <div className="table-header">
          <h3>Registros</h3>
          <button type="button" className="secondary-button" onClick={loadData}>
            Refrescar
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                {config.columns.map((column) => (
                  <th key={column.label}>{column.label}</th>
                ))}
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + 2}>No hay registros.</td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item._id || item.id || index}>
                    <td>{index + 1}</td>
                    {config.columns.map((column) => (
                      <td key={column.label}>{column.value ? column.value(item) : item[column.key] ?? '-'}</td>
                    ))}
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(item)}
                          title="Editar"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          type="button"
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(item._id || item.id)}
                          title="Eliminar"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}