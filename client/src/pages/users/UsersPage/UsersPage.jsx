import React from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import useUsersLogic from './useUsersLogic';
import UsersTable from './UsersTable';
import UserForm from './UserForm';
// import UserDetailsModal from './UserDetailsModal';
// import DeleteUserModal from './DeleteUserModal';
import './UsersPage.css';

export default function UsersPage() {
  const { hasPermission } = useAuth();
  const {
    users,
    loading,
    error,
    selectedUser,
    showForm,
    showDetails,
    showDelete,
    editingUser,
    loadUsers,
    handleCreate,
    handleEdit,
    handleView,
    handleDelete,
    handleCloseForm,
    handleCloseDetails,
    handleCloseDelete,
    handleSaveUser,
    handleConfirmDelete
  } = useUsersLogic();

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>Usuarios</h1>
        {hasPermission('create_users') && (
          <button className="create-btn" onClick={handleCreate}>
            Crear Usuario
          </button>
        )}
      </div>

      {error && <div className="users-error">{error}</div>}

      <UsersTable
        users={users}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={hasPermission('edit_users')}
        canDelete={hasPermission('delete_users')}
      />

      {showForm && (
        <UserForm
          user={editingUser}
          onClose={handleCloseForm}
          onSave={handleSaveUser}
        />
      )}

      {showDetails && (
        <UserDetailsModal
          user={selectedUser}
          onClose={handleCloseDetails}
        />
      )}

      {showDelete && (
        <DeleteUserModal
          user={selectedUser}
          onClose={handleCloseDelete}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}