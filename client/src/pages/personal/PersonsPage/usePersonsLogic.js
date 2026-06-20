import { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/api.js';

export default function usePersonsLogic() {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);

  const loadPersons = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiRequest('/api/persons');
      setPersons(response.data || response);
    } catch (err) {
      console.error('Error loading persons:', err);
      setError('Error al cargar las personas: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPerson(null);
    setShowForm(true);
  };

  const handleEdit = (person) => {
    setEditingPerson(person);
    setShowForm(true);
    setShowDetails(false);
    setSelectedPerson(null);
  };

  const handleView = (person) => {
    setSelectedPerson(person);
    setShowDetails(true);
  };

  const handleDelete = (person) => {
    setSelectedPerson(person);
    setShowDelete(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPerson(null);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedPerson(null);
  };

  const handleCloseDelete = () => {
    setShowDelete(false);
    setSelectedPerson(null);
  };

  const handleSavePerson = async (personData) => {
    try {
      if (editingPerson) {
        await apiRequest(`/api/persons/${editingPerson._id}`, {
          method: 'PATCH',
          body: JSON.stringify(personData)
        });
      } else {
        await apiRequest('/api/persons', {
          method: 'POST',
          body: JSON.stringify(personData)
        });
      }
      
      await loadPersons();
      handleCloseForm();
      return { success: true };
    } catch (err) {
      console.error('Error saving person:', err);
      return { success: false, message: err.message };
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPerson) return { success: false };
    
    try {
      await apiRequest(`/api/persons/${selectedPerson._id}`, {
        method: 'DELETE'
      });
      
      await loadPersons();
      handleCloseDelete();
      return { success: true };
    } catch (err) {
      console.error('Error deleting person:', err);
      return { success: false, message: err.message };
    }
  };

  useEffect(() => {
    loadPersons();
  }, []);

  return {
    persons,
    loading,
    error,
    selectedPerson,
    showForm,
    showDetails,
    showDelete,
    editingPerson,
    loadPersons,
    handleCreate,
    handleEdit,
    handleView,
    handleDelete,
    handleCloseForm,
    handleCloseDetails,
    handleCloseDelete,
    handleSavePerson,
    handleConfirmDelete
  };
}