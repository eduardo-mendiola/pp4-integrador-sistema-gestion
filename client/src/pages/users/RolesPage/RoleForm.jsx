import React, { useState, useEffect } from 'react';
import PermissionsSelector from './PermissionsSelector';
import './RoleForm.css';

export default function RoleForm({ role, onClose, onSave }) {
  const isEditing = Boolean(role);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
    is_active: true
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissions: role.permissions || [],
        is_active: role.is_active !== undefined ? role.is_active : true
      });
    }
  }, [role]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePermissionsChange = (permissions) => {
    setFormData(prev => ({ ...prev, permissions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('El nombre del rol es obligatorio');
      return;
    }

    if (formData.permissions.length === 0) {
      setError('Debe seleccionar al menos un permiso');
      return;
    }

    setSaving(true);

    try {
      await onSave(formData);
    } catch (err) {
      setError(err.message || 'Error al guardar el rol');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="role-form-overlay" onClick={onClose}>
      <div className="role-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="role-form-header">
          <h2>{isEditing ? 'Editar Rol' : 'Crear Rol'}</h2>
          <button className="role-form-close" onClick={onClose}>✕</button>
        </div>

        <form className="role-form-body" onSubmit={handleSubmit}>
          {error && <div className="role-form-error">{error}</div>}

          {/* Sección: Datos básicos */}
          <div className="role-form-section">
            <h3 className="role-form-section-title">Datos del Rol</h3>
            <div className="role-form-grid">
              <div className="role-form-field">
                <label>Nombre *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="ej. Administrador"
                  disabled={saving}
                />
              </div>

              <div className="role-form-field">
                <label>Descripción</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="ej. Acceso completo al sistema"
                  disabled={saving}
                />
              </div>

              <div className="role-form-field">
                <label>Estado</label>
                <button
                  type="button"
                  className={`role-status-toggle ${formData.is_active ? 'active' : 'inactive'}`}
                  onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                  disabled={saving}
                >
                  {formData.is_active ? 'Activado' : 'Desactivado'}
                </button>
                <span>Haga clic para cambiar el estado</span> 
              </div>
            </div>
          </div>

          {/* Sección: Permisos */}
          <div className="role-form-section">
            <h3 className="role-form-section-title">Permisos</h3>
            <PermissionsSelector
              selectedPermissions={formData.permissions}
              onChange={handlePermissionsChange}
            />
          </div>

          <div className="role-form-footer">
            <button 
              type="button" 
              className="role-form-btn secondary" 
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="role-form-btn primary"
              disabled={saving}
            >
              {saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}