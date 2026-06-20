import React from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import useEmployeesLogic from './useEmployeesLogic';
import EmployeesTable from './EmployeesTable';
import EmployeeForm from './EmployeeForm';
import './EmployeesPage.css';

export default function EmployeesPage() {
  const { hasPermission } = useAuth();
  const {
    employees,
    loading,
    error,
    editingEmployee,
    showForm,
    showDetails,
    showDelete,
    handleCreate,
    handleEdit,
    handleView,
    handleDelete,
    handleCloseForm,
    handleCloseDetails,
    handleCloseDelete,
    handleSaveEmployee,
    handleConfirmDelete
  } = useEmployeesLogic();

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Empleados</h1>
        {hasPermission('create_employees') && (
          <button className="create-btn" onClick={handleCreate}>
            Crear Empleado
          </button>
        )}
      </div>

      {error && <div className="employees-error">{error}</div>}

      <EmployeesTable
        employees={employees}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={hasPermission('edit_employees')}
        canDelete={hasPermission('delete_employees')}
      />

      {showForm && (
        <EmployeeForm
          employee={editingEmployee}
          onClose={handleCloseForm}
          onSave={handleSaveEmployee}
        />
      )}
    </div>
  );
}