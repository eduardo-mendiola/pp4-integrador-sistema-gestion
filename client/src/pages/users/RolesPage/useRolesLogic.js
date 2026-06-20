import { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/api.js';

export default function useRolesLogic() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedRole, setSelectedRole] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const loadRoles = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiRequest('/api/roles');
      setRoles(response.data || response);
    } catch (err) {
      console.error('Error loading roles:', err);
      setError('Error al cargar los roles: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    setShowForm(true);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setShowForm(true);
    setShowDetails(false);
    setSelectedRole(null);
  };

  const handleView = (role) => {
    setSelectedRole(role);
    setShowDetails(true);
  };

  const handleDelete = (role) => {
    setSelectedRole(role);
    setShowDelete(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRole(null);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedRole(null);
  };

  const handleCloseDelete = () => {
    setShowDelete(false);
    setSelectedRole(null);
  };

  const handleSaveRole = async (roleData) => {
    try {
      if (editingRole) {
        await apiRequest(`/api/roles/${editingRole._id}`, {
          method: 'PATCH',
          body: JSON.stringify(roleData)
        });
      } else {
        await apiRequest('/api/roles', {
          method: 'POST',
          body: JSON.stringify(roleData)
        });
      }
      
      await loadRoles();
      handleCloseForm();
      return { success: true };
    } catch (err) {
      console.error('Error saving role:', err);
      return { success: false, message: err.message };
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRole) return { success: false };
    
    try {
      await apiRequest(`/api/roles/${selectedRole._id}`, {
        method: 'DELETE'
      });
      
      await loadRoles();
      handleCloseDelete();
      return { success: true };
    } catch (err) {
      console.error('Error deleting role:', err);
      return { success: false, message: err.message };
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  return {
    roles,
    loading,
    error,
    selectedRole,
    showForm,
    showDetails,
    showDelete,
    editingRole,
    loadRoles,
    handleCreate,
    handleEdit,
    handleView,
    handleDelete,
    handleCloseForm,
    handleCloseDetails,
    handleCloseDelete,
    handleSaveRole,
    handleConfirmDelete
  };
}