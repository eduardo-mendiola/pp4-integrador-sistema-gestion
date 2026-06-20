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
    setShowDetails(false);
    setSelectedUser(null);
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
      const url = editingUser ? `/api/users/${editingUser._id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';

      // Separar datos de persona si existen
      const { personData, ...userPayload } = userData;

      console.log(`Enviando ${method} a ${url}:`, userPayload);

      // 1. Actualizar usuario
      const response = await apiRequest(url, {
        method,
        body: JSON.stringify(userPayload)
      });

      console.log('Respuesta del servidor (usuario):', response);

      // 2. Si hay datos de persona, actualizarlos también
      if (personData && editingUser?.person_id) {
        const personId = typeof editingUser.person_id === 'object' 
          ? editingUser.person_id._id 
          : editingUser.person_id;

        console.log('👤 Actualizando persona:', personId, personData);
        
        try {
          await apiRequest(`/api/persons/${personId}`, {
            method: 'PATCH',
            body: JSON.stringify(personData)
          });
          console.log('Persona actualizada correctamente');
        } catch (personErr) {
          console.error('Error actualizando persona:', personErr);
          throw new Error('Usuario actualizado pero error al actualizar datos personales: ' + personErr.message);
        }
      }

      await loadUsers();
      handleCloseForm();
      
      return { success: true };
    } catch (err) {
      console.error('Error guardando usuario:', err);
      throw err;
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