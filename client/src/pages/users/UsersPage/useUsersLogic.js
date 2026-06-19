import { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/api.js';

export default function useUsersLogic() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiRequest('/api/users');
      setUsers(response.data || response);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setError('Error al cargar los usuarios: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDelete(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedUser(null);
  };

  const handleCloseDelete = () => {
    setShowDelete(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async (userData) => {
    try {
      if (editingUser) {
        await apiRequest(`/api/users/${editingUser._id}`, {
          method: 'PATCH',
          body: JSON.stringify(userData)
        });
      } else {
        await apiRequest('/api/users', {
          method: 'POST',
          body: JSON.stringify(userData)
        });
      }
      
      await loadUsers();
      handleCloseForm();
      return { success: true };
    } catch (err) {
      console.error('Error guardando usuario:', err);
      return { success: false, message: err.message };
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return { success: false };
    
    try {
      await apiRequest(`/api/users/${selectedUser._id}`, {
        method: 'DELETE'
      });
      
      await loadUsers();
      handleCloseDelete();
      return { success: true };
    } catch (err) {
      console.error('Error eliminando usuario:', err);
      return { success: false, message: err.message };
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
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
  };
}