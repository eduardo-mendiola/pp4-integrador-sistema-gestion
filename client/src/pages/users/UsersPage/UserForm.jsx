import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/api.js';
import PersonFormModal from './PersonFormModal';
import './UserForm.css';

export default function UserForm({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role_id: '',
    person_id: '',
    is_active: true
  });
  
  const [roles, setRoles] = useState([]);
  const [persons, setPersons] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPersonForm, setShowPersonForm] = useState(false);

  const isEditing = Boolean(user);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [rolesRes, personsRes] = await Promise.all([
          apiRequest('/api/roles'),
          apiRequest('/api/persons')
        ]);
        setRoles(rolesRes.data || rolesRes);
        setPersons(personsRes.data || personsRes);
      } catch (err) {
        console.error('Error cargando lookups:', err);
        setError('Error al cargar roles o personas');
      } finally {
        setLoadingLookups(false);
      }
    };

    fetchLookups();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '',
        role_id: user.role_id?._id || user.role_id || '',
        person_id: user.person_id?._id || user.person_id || '',
        is_active: user.is_active !== undefined ? user.is_active : true
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username.trim()) {
      setError('El nombre de usuario es obligatorio');
      return;
    }
    if (!formData.email.trim()) {
      setError('El email es obligatorio');
      return;
    }
    if (!isEditing && !formData.password.trim()) {
      setError('La contraseña es obligatoria para nuevos usuarios');
      return;
    }
    if (!formData.role_id) {
      setError('Debe seleccionar un rol');
      return;
    }
    if (!formData.person_id) {
      setError('Debe seleccionar una persona');
      return;
    }

    setSaving(true);

    try {
      const payload = { ...formData };
      
      if (isEditing && !payload.password) {
        delete payload.password;
      }

      await onSave(payload);
    } catch (err) {
      setError(err.message || 'Error al guardar el usuario');
    } finally {
      setSaving(false);
    }
  };

  const getPersonName = (person) => {
    if (!person) return '';
    return `${person.first_name || ''} ${person.last_name || ''}`.trim() || person.email || person._id;
  };

  const handlePersonCreated = async (newPerson) => {
    // Actualizar la lista de personas
    setPersons(prev => [...prev, newPerson]);
    
    // Seleccionar automáticamente la nueva persona
    setFormData(prev => ({ ...prev, person_id: newPerson._id }));
    
    // Cerrar el modal de persona
    setShowPersonForm(false);
  };

  if (loadingLookups) {
    return (
      <div className="user-form-overlay">
        <div className="user-form-modal">
          <div className="user-form-loading">
            <div className="user-form-spinner"></div>
            <span>Cargando datos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="user-form-overlay" onClick={onClose}>
        <div className="user-form-modal" onClick={(e) => e.stopPropagation()}>
          <div className="user-form-header">
            <h2>{isEditing ? 'Editar Usuario' : 'Crear Usuario'}</h2>
            <button className="user-form-close" onClick={onClose}></button>
          </div>

          <form className="user-form-body" onSubmit={handleSubmit}>
            {error && <div className="user-form-error">{error}</div>}

            <div className="user-form-grid">
              <div className="user-form-field">
                <label>Nombre de Usuario *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="ej. juan.perez"
                  disabled={saving}
                />
              </div>

              <div className="user-form-field">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ej. juan@empresa.com"
                  disabled={saving}
                />
              </div>

              <div className="user-form-field">
                <label>Contraseña {!isEditing && '*'}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isEditing ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
                  disabled={saving}
                />
              </div>

              <div className="user-form-field">
                <label>Rol *</label>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="user-form-field field-span-2">
                <div className="person-select-header">
                  <label>Persona *</label>
                  <button
                    type="button"
                    className="person-add-btn"
                    onClick={() => setShowPersonForm(true)}
                    disabled={saving}
                  >
                    + Crear nueva persona
                  </button>
                </div>
                <select
                  name="person_id"
                  value={formData.person_id}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="">Seleccionar persona</option>
                  {persons.map(person => (
                    <option key={person._id} value={person._id}>
                      {getPersonName(person)} ({person.dni || 'Sin DNI'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="user-form-field user-form-checkbox-field">
                <label className="user-form-checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    disabled={saving}
                  />
                  <span>Usuario Activo</span>
                </label>
              </div>
            </div>

            <div className="user-form-footer">
              <button 
                type="button" 
                className="user-form-btn secondary" 
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="user-form-btn primary"
                disabled={saving}
              >
                {saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showPersonForm && (
        <PersonFormModal
          onClose={() => setShowPersonForm(false)}
          onPersonCreated={handlePersonCreated}
        />
      )}
    </>
  );
}