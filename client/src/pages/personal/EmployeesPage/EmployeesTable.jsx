import React, { useState, useMemo } from 'react';
import './EmployeesTable.css';

export default function EmployeesTable({ employees, loading, onView, onEdit, onDelete, canEdit, canDelete }) {
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return ' ⇅';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getPersonName = (employee) => {
    if (!employee.person_id) return '-';
    if (typeof employee.person_id === 'object') {
      return `${employee.person_id.first_name || ''} ${employee.person_id.last_name || ''}`.trim() || '-';
    }
    return '-';
  };

  const getPersonDni = (employee) => {
    if (!employee.person_id) return '-';
    if (typeof employee.person_id === 'object') {
      return employee.person_id.dni || '-';
    }
    return '-';
  };

  const getStatus = (employee) => {
    return employee.status || 'active';
  };

  const getContractStatus = (employee) => {
    return employee.contract_status || 'active';
  };

  const formatStatusReason = (reason) => {
    if (!reason) return '';
    const translations = {
      'license': 'Licencia',
      'suspension': 'Suspensión',
      'medical_leave': 'Licencia Médica',
      'maternity_leave': 'Licencia Maternidad',
      'other': 'Otro'
    };
    return translations[reason] || reason;
  };

  const formatTerminationReason = (reason) => {
    if (!reason) return '';
    const translations = {
      'resignation': 'Renuncia',
      'dismissal': 'Despido',
      'retirement': 'Jubilación',
      'contract_end': 'Fin de Contrato',
      'mutual_agreement': 'Acuerdo Mutuo',
      'other': 'Otro'
    };
    return translations[reason] || reason;
  };

  const sortedEmployees = useMemo(() => {
    let sortableItems = [...employees];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortConfig.key) {
          case 'code':
            aValue = a.employee_code || '';
            bValue = b.employee_code || '';
            break;
          case 'person':
            aValue = getPersonName(a).toLowerCase();
            bValue = getPersonName(b).toLowerCase();
            break;
          case 'dni':
            aValue = getPersonDni(a);
            bValue = getPersonDni(b);
            break;
          case 'hire_date':
            aValue = a.hire_date ? new Date(a.hire_date).getTime() : 0;
            bValue = b.hire_date ? new Date(b.hire_date).getTime() : 0;
            break;
          case 'shift':
            aValue = (a.shift_schedule || '').toLowerCase();
            bValue = (b.shift_schedule || '').toLowerCase();
            break;
          case 'status':
            aValue = getStatus(a);
            bValue = getStatus(b);
            break;
          case 'contract_status':
            aValue = getContractStatus(a);
            bValue = getContractStatus(b);
            break;
          case 'created_at':
            aValue = new Date(a.created_at || a.createdAt).getTime();
            bValue = new Date(b.created_at || b.createdAt).getTime();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [employees, sortConfig]);

  if (loading) {
    return (
      <div className="employees-table-loading">
        <div className="employees-table-spinner"></div>
        <span>Cargando empleados...</span>
      </div>
    );
  }

  if (sortedEmployees.length === 0) {
    return (
      <div className="employees-table-empty">
        <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
        <p>No hay empleados registrados</p>
      </div>
    );
  }

  const formatShiftSchedule = (shift) => {
    if (!shift) return '-';
    const translations = {
      'morning': 'Mañana',
      'afternoon': 'Tarde',
      'night': 'Noche',
      'full_time': 'Turno Completo',
      'part_time': 'Medio Tiempo'
    };
    return translations[shift] || shift.charAt(0).toUpperCase() + shift.slice(1);
  };

  
  return (
    <div className="employees-table-container">
      <table className="employees-table">
        <thead>
          <tr>
            <th style={{ width: '50px' }}>#</th>
            <th className="sortable" onClick={() => handleSort('code')} style={{ width: '150px' }}>
              Código {getSortIcon('code')}
            </th>
            <th className="sortable" onClick={() => handleSort('person')}>
              Nombre {getSortIcon('person')}
            </th>
            <th className="sortable" onClick={() => handleSort('dni')} style={{ width: '110px' }}>
              DNI {getSortIcon('dni')}
            </th>
            <th className="sortable" onClick={() => handleSort('hire_date')} style={{ width: '120px' }}>
              Fecha Ingreso {getSortIcon('hire_date')}
            </th>
            <th className="sortable" onClick={() => handleSort('shift')} style={{ width: '130px' }}>
              Turno {getSortIcon('shift')}
            </th>
            <th className="sortable" onClick={() => handleSort('status')} style={{ textAlign: 'center', width: '110px' }}>
              Estado {getSortIcon('status')}
            </th>
            <th className="sortable" onClick={() => handleSort('contract_status')} style={{ textAlign: 'center', width: '120px' }}>
              Contrato {getSortIcon('contract_status')}
            </th>
            <th className="text-center" style={{ width: '120px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedEmployees.map((employee, index) => (
            <tr key={employee._id || index}>
              <td>{index + 1}</td>
              <td>
                <span className="employees-code">{employee.employee_code || '-'}</span>
              </td>
              <td>{getPersonName(employee)}</td>
              <td>{getPersonDni(employee)}</td>
              <td>{formatDate(employee.hire_date)}</td>
              <td>{formatShiftSchedule(employee.shift_schedule)}</td>
              <td style={{ textAlign: 'center' }}>
                <span 
                  className={`employees-status-badge ${getStatus(employee)}`}
                  title={getStatus(employee) === 'inactive' ? formatStatusReason(employee.status_reason) : ''}
                >
                  {getStatus(employee) === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td style={{ textAlign: 'center' }}>
                <span 
                  className={`employees-contract-badge ${getContractStatus(employee)}`}
                  title={getContractStatus(employee) === 'terminated' ? formatTerminationReason(employee.termination_reason) : ''}
                >
                  {getContractStatus(employee) === 'active' ? 'Vigente' : 'Terminado'}
                </span>
              </td>
              <td className="text-center">
                <div className="employees-table-actions">
                  <button 
                    className="employees-action-btn view"
                    onClick={() => onView(employee)}
                    title="Ver detalles"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  {canEdit && (
                    <button 
                      className="employees-action-btn edit"
                      onClick={() => onEdit(employee)}
                      title="Editar empleado"
                    >
                      ✏️
                    </button>
                  )}
                  {canDelete && (
                    <button 
                      className="employees-action-btn delete"
                      onClick={() => onDelete(employee)}
                      title="Eliminar empleado"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}