import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/api.js';
import PersonFormModal from '../PersonsPage/PersonFormModal.jsx';
import './EmployeeForm.css';

export default function EmployeeForm({ employee, onClose, onSave }) {
  const isEditing = Boolean(employee);
  
  const [formData, setFormData] = useState({
    person_id: '',
    hire_date: new Date().toISOString().split('T')[0],
    shift_schedule: 'full_time',
    status: 'active',
    status_reason: '',
    status_comments: '',
    contract_status: 'active',
    termination_date: '',
    termination_reason: '',
    termination_comments: ''
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [newPersonData, setNewPersonData] = useState(null);

  const shiftOptions = [
    { value: 'morning', label: 'Mañana (6:00 - 14:00)' },
    { value: 'afternoon', label: 'Tarde (14:00 - 22:00)' },
    { value: 'night', label: 'Noche (22:00 - 6:00)' },
    { value: 'full_time', label: 'Turno Completo (9:00 - 17:00)' },
    { value: 'part_time', label: 'Medio Tiempo (4 horas)' }
  ];

  const statusReasonOptions = [
    { value: 'license', label: 'Licencia' },
    { value: 'suspension', label: 'Suspensión' },
    { value: 'medical_leave', label: 'Licencia Médica' },
    { value: 'maternity_leave', label: 'Licencia por Maternidad' },
    { value: 'other', label: 'Otro' }
  ];

  const terminationReasonOptions = [
    { value: 'resignation', label: 'Renuncia' },
    { value: 'dismissal', label: 'Despido' },
    { value: 'retirement', label: 'Jubilación' },
    { value: 'mutual_agreement', label: 'Acuerdo Mutuo' },
    { value: 'other', label: 'Otro' }
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
        shift_schedule: employee.shift_schedule || 'full_time',
        status: employee.status || 'active',
        status_reason: employee.status_reason || '',
        status_comments: employee.status_comments || '',
        contract_status: employee.contract_status || 'active',
        termination_date: employee.termination_date ? new Date(employee.termination_date).toISOString().split('T')[0] : '',
        termination_reason: employee.termination_reason || '',
        termination_comments: employee.termination_comments || ''
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario cambia el valor
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Si se cambia la persona seleccionada, resetear newPersonData
    if (name === 'person_id') {
      setNewPersonData(null);
    }
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario cambia el valor
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const clearFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    let hasErrors = false;
    const newFieldErrors = {};

    // Validaciones de empleado
    if (!formData.person_id) {
      newFieldErrors.person_id = 'Debe seleccionar una persona';
      hasErrors = true;
    }
    if (!formData.hire_date) {
      newFieldErrors.hire_date = 'La fecha de ingreso es obligatoria';
      hasErrors = true;
    }
    if (!formData.shift_schedule) {
      newFieldErrors.shift_schedule = 'Debe seleccionar un turno';
      hasErrors = true;
    }

    // Validaciones de estado del empleado (solo en edición y si el contrato NO está terminado)
    if (isEditing && formData.status === 'inactive' && formData.contract_status !== 'terminated') {
      if (!formData.status_reason) {
        newFieldErrors.status_reason = 'Debe seleccionar un motivo para el estado inactivo';
        hasErrors = true;
      }
    }

    // Validaciones de estado del contrato (solo en edición)
    if (isEditing && formData.contract_status === 'terminated') {
      if (!formData.termination_date) {
        newFieldErrors.termination_date = 'La fecha de terminación es obligatoria';
        hasErrors = true;
      }
      if (!formData.termination_reason) {
        newFieldErrors.termination_reason = 'Debe seleccionar un motivo de terminación';
        hasErrors = true;
      }
    }

    // Validaciones de usuario (solo en crear)
    if (!isEditing) {
      if (!userData.username.trim()) {
        newFieldErrors.username = 'El nombre de usuario es obligatorio';
        hasErrors = true;
      }
      
      // Verificar que haya email (ya sea del usuario o de la persona)
      const selectedPerson = persons.find(p => p._id === formData.person_id);
      if (!userData.email.trim() && !selectedPerson?.email) {
        newFieldErrors.email = 'El email es obligatorio';
        hasErrors = true;
      }
      
      if (!userData.password.trim()) {
        newFieldErrors.password = 'La contraseña es obligatoria';
        hasErrors = true;
      } else if (userData.password !== confirmPassword) {
        newFieldErrors.confirmPassword = 'Las contraseñas no coinciden';
        hasErrors = true;
      } else if (userData.password.length < 6) {
        newFieldErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        hasErrors = true;
      }
      
      if (!userData.role_id) {
        newFieldErrors.role_id = 'Debe seleccionar un rol para el usuario';
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setSaving(true);

    try {
      let payload;

      if (isEditing) {
        // Modo edición: datos del empleado incluyendo estados
        // Si el contrato está terminado, NO enviar status ni status_reason (el backend lo setea automáticamente)
        payload = {
          hire_date: formData.hire_date,
          shift_schedule: formData.shift_schedule,
          contract_status: formData.contract_status,
          termination_date: formData.contract_status === 'terminated' ? formData.termination_date : null,
          termination_reason: formData.contract_status === 'terminated' ? formData.termination_reason : null,
          termination_comments: formData.contract_status === 'terminated' ? formData.termination_comments : null
        };

        // Solo enviar status si el contrato NO está terminado
        if (formData.contract_status !== 'terminated') {
          payload.status = formData.status;
          payload.status_reason = formData.status === 'inactive' ? formData.status_reason : null;
          payload.status_comments = formData.status === 'inactive' ? formData.status_comments : null;
        }
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
                  {fieldErrors.person_id && <span className="employee-form-field-error">{fieldErrors.person_id}</span>}
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
                  {fieldErrors.hire_date && <span className="employee-form-field-error">{fieldErrors.hire_date}</span>}
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
                  {fieldErrors.shift_schedule && <span className="employee-form-field-error">{fieldErrors.shift_schedule}</span>}
                </div>
              </div>
            </div>

            {/* Sección: Estado del Empleado (solo en edición y si el contrato NO está terminado) */}
            {isEditing && formData.contract_status !== 'terminated' && (
              <div className="employee-form-section">
                <h3 className="employee-form-section-title">Estado del Empleado</h3>
                <div className="employee-form-grid">
                  <div className="employee-form-field field-span-2">
                    <label>Estado Laboral</label>
                    <div className="employee-status-toggle">
                      <button
                        type="button"
                        className={`status-toggle-btn ${formData.status === 'active' ? 'active' : ''}`}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, status: 'active', status_reason: '', status_comments: '' }));
                          clearFieldError('status_reason');
                        }}
                        disabled={saving}
                      >
                        Activo
                      </button>
                      <button
                        type="button"
                        className={`status-toggle-btn ${formData.status === 'inactive' ? 'active' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, status: 'inactive' }))}
                        disabled={saving}
                      >
                        Inactivo
                      </button>
                    </div>
                  </div>

                  {formData.status === 'inactive' && (
                    <>
                      <div className="employee-form-field">
                        <label>Motivo *</label>
                        <select
                          name="status_reason"
                          value={formData.status_reason}
                          onChange={handleChange}
                          disabled={saving}
                        >
                          <option value="">Seleccionar motivo</option>
                          {statusReasonOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {fieldErrors.status_reason && <span className="employee-form-field-error">{fieldErrors.status_reason}</span>}
                      </div>

                      <div className="employee-form-field field-span-2">
                        <label>Comentarios</label>
                        <textarea
                          name="status_comments"
                          value={formData.status_comments}
                          onChange={handleChange}
                          placeholder="Detalles adicionales sobre el estado..."
                          disabled={saving}
                          rows="3"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Sección: Estado del Contrato (solo en edición) */}
            {isEditing && (
              <div className="employee-form-section">
                <h3 className="employee-form-section-title">Estado del Contrato</h3>
                <div className="employee-form-grid">
                  <div className="employee-form-field field-span-2">
                    <label>Contrato</label>
                    <div className="employee-status-toggle">
                      <button
                        type="button"
                        className={`status-toggle-btn ${formData.contract_status === 'active' ? 'active' : ''}`}
                        onClick={() => {
                          setFormData(prev => ({ 
                            ...prev, 
                            contract_status: 'active',
                            termination_date: '',
                            termination_reason: '',
                            termination_comments: '',
                            status: 'active',
                            status_reason: '',
                            status_comments: ''
                          }));
                          clearFieldError('termination_date');
                          clearFieldError('termination_reason');
                        }}
                        disabled={saving}
                      >
                        Vigente
                      </button>
                      <button
                        type="button"
                        className={`status-toggle-btn ${formData.contract_status === 'terminated' ? 'active' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, contract_status: 'terminated' }))}
                        disabled={saving}
                      >
                        Terminado
                      </button>
                    </div>
                  </div>

                  {formData.contract_status === 'terminated' && (
                    <>
                      <div className="employee-form-field">
                        <label>Fecha de Terminación *</label>
                        <input
                          type="date"
                          name="termination_date"
                          value={formData.termination_date}
                          onChange={handleChange}
                          disabled={saving}
                        />
                        {fieldErrors.termination_date && <span className="employee-form-field-error">{fieldErrors.termination_date}</span>}
                      </div>

                      <div className="employee-form-field">
                        <label>Motivo *</label>
                        <select
                          name="termination_reason"
                          value={formData.termination_reason}
                          onChange={handleChange}
                          disabled={saving}
                        >
                          <option value="">Seleccionar motivo</option>
                          {terminationReasonOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {fieldErrors.termination_reason && <span className="employee-form-field-error">{fieldErrors.termination_reason}</span>}
                      </div>

                      <div className="employee-form-field field-span-2">
                        <label>Comentarios</label>
                        <textarea
                          name="termination_comments"
                          value={formData.termination_comments}
                          onChange={handleChange}
                          placeholder="Detalles adicionales sobre la terminación..."
                          disabled={saving}
                          rows="3"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

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
                    {fieldErrors.username && <span className="employee-form-field-error">{fieldErrors.username}</span>}
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
                    {fieldErrors.role_id && <span className="employee-form-field-error">{fieldErrors.role_id}</span>}
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
                    {fieldErrors.password && <span className="employee-form-field-error">{fieldErrors.password}</span>}
                  </div>

                  <div className="employee-form-field">
                    <label>Confirmar Contraseña *</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          clearFieldError('confirmPassword');
                        }}
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
                    {fieldErrors.confirmPassword && <span className="employee-form-field-error">{fieldErrors.confirmPassword}</span>}
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