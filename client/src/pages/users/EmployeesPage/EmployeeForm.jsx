import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/api.js';
import PersonFormModal from '../PersonsPage/PersonFormModal.jsx';
import './EmployeeForm.css';

export default function EmployeeForm({ employee, onClose, onSave }) {
  const isEditing = Boolean(employee);
  
  const [formData, setFormData] = useState({
    person_id: '',
    hire_date: new Date().toISOString().split('T')[0],
    shift_schedule: 'full_time'
  });
  
   const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    role_id: ''
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [persons, setPersons] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [newPersonData, setNewPersonData] = useState(null);

  const shiftOptions = [
    { value: 'morning', label: 'Mañana (6:00 - 14:00)' },
    { value: 'afternoon', label: 'Tarde (14:00 - 22:00)' },
    { value: 'night', label: 'Noche (22:00 - 6:00)' },
    { value: 'full_time', label: 'Turno Completo (9:00 - 17:00)' },
    { value: 'part_time', label: 'Medio Tiempo (4 horas)' }
  ];

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [personsRes, rolesRes] = await Promise.all([
          apiRequest('/api/persons'),
          apiRequest('/api/roles')
        ]);
        setPersons(personsRes.data || personsRes);
        setRoles(rolesRes.data || rolesRes);
      } catch (err) {
        console.error('Error loading lookups:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoadingLookups(false);
      }
    };

    fetchLookups();
  }, []);

  useEffect(() => {
    if (employee) {
      setFormData({
        person_id: employee.person_id?._id || employee.person_id || '',
        hire_date: employee.hire_date ? new Date(employee.hire_date).toISOString().split('T')[0] : '',
        shift_schedule: employee.shift_schedule || 'full_time'
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Si se cambia la persona seleccionada, resetear newPersonData
    if (name === 'person_id') {
      setNewPersonData(null);
    }
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones de empleado
    if (!formData.person_id) {
      setError('Debe seleccionar una persona');
      return;
    }
    if (!formData.hire_date) {
      setError('La fecha de ingreso es obligatoria');
      return;
    }
    if (!formData.shift_schedule) {
      setError('Debe seleccionar un turno');
      return;
    }

    // Validaciones de usuario (solo en crear)
    if (!isEditing) {
      if (!userData.username.trim()) {
        setError('El nombre de usuario es obligatorio');
        return;
      }
      
      // Verificar que haya email (ya sea del usuario o de la persona)
      const selectedPerson = persons.find(p => p._id === formData.person_id);
      if (!userData.email.trim() && !selectedPerson?.email) {
        setError('El email es obligatorio');
        return;
      }
      
      if (!userData.password.trim()) {
        setError('La contraseña es obligatoria');
        return;
      }
      if (userData.password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      if (userData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      if (!userData.role_id) {
        setError('Debe seleccionar un rol para el usuario');
        return;
      }
    }

    setSaving(true);

    try {
      let payload;

      if (isEditing) {
        // Modo edición: solo datos del empleado
        payload = {
          hire_date: formData.hire_date,
          shift_schedule: formData.shift_schedule
        };
      } else {
        // Buscar la persona seleccionada para obtener su email si hace falta
        const selectedPerson = persons.find(p => p._id === formData.person_id);
        const finalEmail = userData.email.trim() || selectedPerson?.email;

        if (!finalEmail) {
          setError('El email es obligatorio (ingreselo o seleccione una persona que tenga email)');
          setSaving(false);
          return;
        }

        payload = {
          person_id: formData.person_id,
          user: {
            username: userData.username,
            email: finalEmail,
            password_hash: userData.password, // EL BACKEND ESPERA password_hash
            role_id: userData.role_id
          },
          employee: {
            hire_date: formData.hire_date,
            shift_schedule: formData.shift_schedule
          }
        };
      }

      await onSave(payload);
    } catch (err) {
      setError(err.message || 'Error al guardar el empleado');
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
    setNewPersonData({
      dni: newPerson.dni,
      first_name: newPerson.first_name,
      last_name: newPerson.last_name,
      email: newPerson.email || '',
      phone: newPerson.phone || '',
      address: newPerson.address || null
    });
    setShowPersonForm(false);
  };

  if (loadingLookups) {
    return (
      <div className="employee-form-overlay">
        <div className="employee-form-modal">
          <div className="employee-form-loading">
            <div className="employee-form-spinner"></div>
            <span>Cargando datos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="employee-form-overlay" onClick={onClose}>
        <div className="employee-form-modal" onClick={(e) => e.stopPropagation()}>
          <div className="employee-form-header">
            <h2>{isEditing ? 'Editar Empleado' : 'Registrar Empleado'}</h2>
            <button className="employee-form-close" onClick={onClose}>✕</button>
          </div>

          <form className="employee-form-body" onSubmit={handleSubmit}>
            {error && <div className="employee-form-error">{error}</div>}

            {/* Sección: Datos del Empleado */}
            <div className="employee-form-section">
              <h3 className="employee-form-section-title">Datos del Empleado</h3>
              <div className="employee-form-grid">
                <div className="employee-form-field field-span-2">
                  <div className="person-select-header">
                    <label>Persona *</label>
                    {!isEditing && (
                      <button
                        type="button"
                        className="person-add-btn"
                        onClick={() => setShowPersonForm(true)}
                        disabled={saving}
                      >
                        + Crear nueva persona
                      </button>
                    )}
                  </div>
                  <select
                    name="person_id"
                    value={formData.person_id}
                    onChange={handleChange}
                    disabled={saving || isEditing}
                  >
                    <option value="">Seleccionar persona</option>
                    {persons.map(person => (
                      <option key={person._id} value={person._id}>
                        {getPersonName(person)} ({person.dni || 'Sin DNI'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="employee-form-field">
                  <label>Fecha de Ingreso *</label>
                  <input
                    type="date"
                    name="hire_date"
                    value={formData.hire_date}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="employee-form-field">
                  <label>Turno *</label>
                  <select
                    name="shift_schedule"
                    value={formData.shift_schedule}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    {shiftOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sección: Datos de Usuario (solo en CREAR) */}
            {!isEditing && (
              <div className="employee-form-section">
                <h3 className="employee-form-section-title">Credenciales de Acceso</h3>
                <div className="employee-form-grid">
                  <div className="employee-form-field">
                    <label>Nombre de Usuario *</label>
                    <input
                      type="text"
                      name="username"
                      value={userData.username}
                      onChange={handleUserChange}
                      placeholder="ej. juan.perez"
                      disabled={saving}
                    />
                  </div>

                  <div className="employee-form-field">
                    <label>Rol *</label>
                    <select
                      name="role_id"
                      value={userData.role_id}
                      onChange={handleUserChange}
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

                  <div className="employee-form-field">
                    <label>Contraseña *</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={userData.password}
                        onChange={handleUserChange}
                        placeholder="Mínimo 6 caracteres"
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

                  <div className="employee-form-field">
                    <label>Confirmar Contraseña *</label>
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
                        {showConfirmPassword ? (
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
                </div>
              </div>
            )}

            <div className="employee-form-footer">
              <button 
                type="button" 
                className="employee-form-btn secondary" 
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="employee-form-btn primary"
                disabled={saving}
              >
                {saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Registrar')}
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