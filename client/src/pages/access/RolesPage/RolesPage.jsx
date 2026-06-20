import React from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import useRolesLogic from './useRolesLogic';
import RolesTable from './RolesTable';
import RoleForm from './RoleForm';
import RoleDetailsModal from './RoleDetailsModal';
import DeleteRoleModal from './DeleteRoleModal';
import './RolesPage.css';

export default function RolesPage() {
  const { hasPermission } = useAuth();
  const {
    roles,
    loading,
    error,
    selectedRole,
    showForm,
    showDetails,
    showDelete,
    editingRole,
    handleCreate,
    handleEdit,
    handleView,
    handleDelete,
    handleCloseForm,
    handleCloseDetails,
    handleCloseDelete,
    handleSaveRole,
    handleConfirmDelete
  } = useRolesLogic();

  return (
    <div className="roles-container">
      <div className="roles-header">
        <h1>Roles</h1>
        {hasPermission('create_roles') && (
          <button className="create-btn" onClick={handleCreate}>
            Crear Rol
          </button>
        )}
      </div>

      {error && <div className="roles-error">{error}</div>}

      <RolesTable
        roles={roles}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={hasPermission('edit_roles')}
        canDelete={hasPermission('delete_roles')}
      />

      {showForm && (
        <RoleForm
          role={editingRole}
          onClose={handleCloseForm}
          onSave={handleSaveRole}
        />
      )}

      {showDetails && (
        <RoleDetailsModal
          role={selectedRole}
          onClose={handleCloseDetails}
          onEdit={handleEdit}
        />
      )}

      {showDelete && (
        <DeleteRoleModal
          role={selectedRole}
          onClose={handleCloseDelete}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}