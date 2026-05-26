import React, { useEffect, useState } from 'react';
import { apiRequest, unwrapList } from '../services/api.js';

const emptyToString = (value) => (value === undefined || value === null ? '' : String(value));

export default function CrudModule({ config }) {
  const [items, setItems] = useState([]);
  const [lookups, setLookups] = useState({});
  const [form, setForm] = useState(config.initialValues);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

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

  const openModal = () => {
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setError('');
    resetForm();
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

      if (config.useModal) {
        setModalOpen(false);
      }
      resetForm();
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

    if (config.useModal) {
      openModal();
    }
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

  const renderFormContent = () => (
    <form className="crud-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        {config.fields.map((field) => (
          <div key={field.name} className={field.type === 'textarea' ? 'field-span-2' : ''}>
            {field.type !== 'checkbox' ? <label htmlFor={field.name}>{field.label}</label> : null}
            {renderField(field)}
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
        </button>
        {config.useModal ? (
          <button type="button" className="secondary-button" onClick={closeModal}>
            Cancelar
          </button>
        ) : (
          editingId ? (
            <button type="button" className="secondary-button" onClick={resetForm}>
              Cancelar edición
            </button>
          ) : null
        )}
      </div>
    </form>
  );

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
        {config.useModal ? (
          <button
            type="button"
            className="btn-add"
            onClick={() => { resetForm(); openModal(); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo {config.singleTitle || config.title}
          </button>
        ) : null}
      </header>

      {/* Formulario inline — sólo si NO usa modal */}
      {!config.useModal ? (
        <div className="panel">
          {renderFormContent()}
          {error ? <div className="error-banner">{error}</div> : null}
        </div>
      ) : null}

      {/* Tabla de registros */}
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
                <th>Opciones</th>
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
                          className="action-btn action-btn--edit"
                          title="Editar"
                          onClick={() => handleEdit(item)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="action-btn action-btn--delete"
                          title="Eliminar"
                          onClick={() => handleDelete(item._id || item.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
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

      {/* Modal — sólo si config.useModal está activo */}
      {config.useModal && modalOpen ? (
        <div className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingId ? 'Editar' : 'Nuevo'} {config.singleTitle || config.title}
              </h3>
              <button type="button" className="modal-close" title="Cerrar" onClick={closeModal}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {renderFormContent()}
              {error ? <div className="error-banner">{error}</div> : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}