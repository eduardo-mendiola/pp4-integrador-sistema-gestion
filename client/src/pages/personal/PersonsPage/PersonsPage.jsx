import React from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import usePersonsLogic from './usePersonsLogic';
import PersonsTable from './PersonsTable';
import './PersonsPage.css';

export default function PersonsPage() {
  const { hasPermission } = useAuth();
  const {
    persons,
    loading,
    error,
    showForm,
    handleCreate,
    handleEdit,
    handleView,
    handleDelete
  } = usePersonsLogic();

  return (
    <div className="persons-container">
      <div className="persons-header">
        <h1>Datos Personales</h1>
        {hasPermission('create_personal_data') && (
          <button className="create-btn" onClick={handleCreate}>
            Crear Persona
          </button>
        )}
      </div>

      {error && <div className="persons-error">{error}</div>}

      <PersonsTable
        persons={persons}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={hasPermission('edit_personal_data')}
        canDelete={hasPermission('delete_personal_data')}
      />
    </div>
  );
}