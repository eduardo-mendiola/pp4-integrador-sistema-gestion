import { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/api.js';

export default function useEmployeesLogic() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const loadEmployees = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiRequest('/api/employees');
      setEmployees(response.data || response);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Error al cargar los empleados: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
    setShowDetails(false);
    setSelectedEmployee(null);
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowDetails(true);
  };

  const handleDelete = (employee) => {
    setSelectedEmployee(employee);
    setShowDelete(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedEmployee(null);
  };

  const handleCloseDelete = () => {
    setShowDelete(false);
    setSelectedEmployee(null);
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      if (editingEmployee) {
        // Modo edición: solo actualizar datos del empleado
        await apiRequest(`/api/employees/${editingEmployee._id}`, {
          method: 'PATCH',
          body: JSON.stringify(employeeData)
        });
      } else {
        // Modo creación: usar endpoint register que crea persona + usuario + empleado
        await apiRequest('/api/employees/register', {
          method: 'POST',
          body: JSON.stringify(employeeData)
        });
      }
      
      await loadEmployees();
      handleCloseForm();
      return { success: true };
    } catch (err) {
      console.error('Error saving employee:', err);
      return { success: false, message: err.message };
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedEmployee) return { success: false };
    
    try {
      await apiRequest(`/api/employees/${selectedEmployee._id}`, {
        method: 'DELETE'
      });
      
      await loadEmployees();
      handleCloseDelete();
      return { success: true };
    } catch (err) {
      console.error('Error deleting employee:', err);
      return { success: false, message: err.message };
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    selectedEmployee,
    showForm,
    showDetails,
    showDelete,
    editingEmployee,
    loadEmployees,
    handleCreate,
    handleEdit,
    handleView,
    handleDelete,
    handleCloseForm,
    handleCloseDetails,
    handleCloseDelete,
    handleSaveEmployee,
    handleConfirmDelete
  };
}