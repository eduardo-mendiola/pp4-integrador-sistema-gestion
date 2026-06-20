import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/api.js';
import PersonFormModal from '../PersonsPage/PersonFormModal';
import './UserForm.css';

export default function UserForm({ user, onClose, onSave }) {
  const isEditing = Boolean(user);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role_id: '',
    person_id: '',
    is_active: true
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [expandPersonData, setExpandPersonData] = useState(false);
  
  // Datos de la persona (solo para edición)
  const [personData, setPersonData] = useState({
    first_name: '',
    last_name: '',
    dni: '',
    email: '',
    phone: '',
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: ''
    }
  });
  
  const [roles, setRoles] = useState([]);
  const [persons, setPersons] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPersonForm, setShowPersonForm] = useState(false);

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

      // Cargar datos de la persona asociada
      if (user.person_id && typeof user.person_id === 'object') {
        setPersonData({
          first_name: user.person_id.first_name || '',
          last_name: user.person_id.last_name || '',
          dni: user.person_id.dni || '',
          email: user.person_id.email || '',
          phone: user.person_id.phone || '',
          address: {
            street: user.person_id.address?.street || '',
            number: user.person_id.address?.number || '',
            neighborhood: user.person_id.address?.neighborhood || '',
            city: user.person_id.address?.city || ''
          }
        });
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePersonDataChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setPersonData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setPersonData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones básicas
    if (!formData.username.trim()) {
      setError('El nombre de usuario es obligatorio');
      return;
    }
    if (!formData.email.trim()) {
      setError('El email es obligatorio');
      return;
    }
    if (!formData.role_id) {
      setError('Debe seleccionar un rol');
      return;
    }

    // Validaciones específicas según modo
    if (!isEditing) {
      // Crear nuevo usuario
      if (!formData.password.trim()) {
        setError('La contraseña es obligatoria para nuevos usuarios');
        return;
      }
      if (!formData.person_id) {
        setError('Debe seleccionar una persona');
        return;
      }
    }

    // Validar confirmación de contraseña si se está cambiando
    if (formData.password.trim()) {
      if (formData.password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    // Validaciones de datos personales si están expandidos
    if (isEditing && expandPersonData) {
      if (!personData.first_name.trim()) {
        setError('El nombre es obligatorio');
        return;
      }
      if (!personData.last_name.trim()) {
        setError('El apellido es obligatorio');
        return;
      }
    }

    setSaving(true);

    try {
      const payload = { ...formData };
      
      // Si es edición y la contraseña está vacía, no enviarla
      if (isEditing && !payload.password) {
        delete payload.password;
      }

      // Eliminar confirmPassword del payload
      // (no se envía al backend)

      // Si es edición y hay cambios en datos personales, incluirlos
      if (isEditing && expandPersonData) {
        payload.personData = { ...personData };
        // Limpiar address vacío
        const hasAddress = Object.values(payload.personData.address).some(v => v.trim() !== '');
        if (!hasAddress) {
          payload.personData.address = null;
        }
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
    setPersons(prev => [...prev, newPerson]);
    setFormData(prev => ({ ...prev, person_id: newPerson._id }));
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
            <button className="user-form-close" onClick={onClose}>✕</button>
          </div>

          <form className="user-form-body" onSubmit={handleSubmit}>
            {error && <div className="user-form-error">{error}</div>}

            {/* Sección: Datos de la cuenta */}
            <div className="user-form-section">
              <h3 className="user-form-section-title">Datos de la Cuenta</h3>
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
                  <label>Contraseña {!isEditing && '*'} {isEditing && '(dejar vacío para mantener)'}</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={isEditing ? 'Nueva contraseña' : 'Mínimo 6 caracteres'}
                      disabled={saving}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      title={showPassword ? 'Ocultar' : 'Mostrar'}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="user-form-field">
                  <label>Confirmar Contraseña</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repetir contraseña"
                      disabled={saving}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                      title={showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                    >
                      {showConfirmPassword  ? (
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
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
            </div>

            {/* Sección: Persona (solo en CREAR) */}
            {!isEditing && (
              <div className="user-form-section">
                <h3 className="user-form-section-title">Persona Asociada</h3>
                <div className="user-form-grid">
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
                </div>
              </div>
            )}

            {/* Sección: Datos Personales (solo en EDITAR) */}
            {isEditing && (
              <div className="user-form-section">
                <button
                  type="button"
                  className="user-form-expand-btn"
                  onClick={() => setExpandPersonData(!expandPersonData)}
                >
                  <span className="expand-icon">{expandPersonData ? '▼' : '▶'}</span>
                  Cambiar datos personales
                </button>

                {expandPersonData && (
                  <div className="user-form-expandable-content">
                    <div className="user-form-grid">
                      <div className="user-form-field">
                        <label>DNI (no modificable)</label>
                        <input
                          type="text"
                          value={personData.dni}
                          disabled
                          className="disabled-field"
                        />
                      </div>

                      <div className="user-form-field">
                        <label>Nombre *</label>
                        <input
                          type="text"
                          name="first_name"
                          value={personData.first_name}
                          onChange={handlePersonDataChange}
                          placeholder="ej. Juan"
                          disabled={saving}
                        />
                      </div>

                      <div className="user-form-field">
                        <label>Apellido *</label>
                        <input
                          type="text"
                          name="last_name"
                          value={personData.last_name}
                          onChange={handlePersonDataChange}
                          placeholder="ej. Pérez"
                          disabled={saving}
                        />
                      </div>

                      <div className="user-form-field">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={personData.email}
                          onChange={handlePersonDataChange}
                          placeholder="ej. juan@email.com"
                          disabled={saving}
                        />
                      </div>

                      <div className="user-form-field">
                        <label>Teléfono</label>
                        <input
                          type="tel"
                          name="phone"
                          value={personData.phone}
                          onChange={handlePersonDataChange}
                          placeholder="ej. 1123456789"
                          disabled={saving}
                        />
                      </div>

                      <div className="user-form-field field-span-2">
                        <label className="address-section-label">Dirección (opcional)</label>
                      </div>

                      <div className="user-form-field field-span-2">
                        <label>Calle</label>
                        <input
                          type="text"
                          name="address.street"
                          value={personData.address.street}
                          onChange={handlePersonDataChange}
                          placeholder="ej. Av. Siempre Viva"
                          disabled={saving}
                        />
                      </div>

                      <div className="user-form-field">
                        <label>Número</label>
                        <input
                          type="text"
                          name="address.number"
                          value={personData.address.number}
                          onChange={handlePersonDataChange}
                          placeholder="ej. 123"
                          disabled={saving}
                        />
                      </div>

                      <div className="user-form-field">
                        <label>Barrio</label>
                        <input
                          type="text"
                          name="address.neighborhood"
                          value={personData.address.neighborhood}
                          onChange={handlePersonDataChange}
                          placeholder="ej. Centro"
                          disabled={saving}
                        />
                      </div>

                      <div className="user-form-field">
                        <label>Ciudad</label>
                        <input
                          type="text"
                          name="address.city"
                          value={personData.address.city}
                          onChange={handlePersonDataChange}
                          placeholder="ej. Buenos Aires"
                          disabled={saving}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

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