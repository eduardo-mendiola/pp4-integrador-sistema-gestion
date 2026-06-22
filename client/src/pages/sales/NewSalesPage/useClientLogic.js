import { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/api.js';

export default function useClientLogic() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('search'); // 'search' | 'create' | 'edit' | 'view'
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cargar clientes al abrir el modal (solo la primera vez)
  useEffect(() => {
    if (isModalOpen && clients.length === 0) {
      loadClients();
    }
  }, [isModalOpen]);

  const loadClients = async () => {
    setLoadingClients(true);
    try {
      const response = await apiRequest('/api/clients');
      const data = response.data || response;
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  // Funciones para manejar el modal y la selección de clientes
  const openModal = (mode = 'search') => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const selectClient = (client) => {
    setSelectedClient(client);
    closeModal();
  };

  const clearClient = () => {
    setSelectedClient(null);
  };

  const changeClient = () => {
    setSelectedClient(null);
    openModal('search');
  };

  const editClient = () => {
    if (selectedClient) {
      setModalMode('edit');
      setIsModalOpen(true);
    }
  };

  const viewClient = () => {
    if (selectedClient) {
      setModalMode('view');
      setIsModalOpen(true);
    }
  };

  const createClient = async (clientData) => {
    setSaving(true);
    try {
      const response = await apiRequest('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });

      const newClient = response.data || response;
      setClients(prev => [...prev, newClient]);
      setSelectedClient(newClient);
      closeModal();
      return { success: true, client: newClient };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  const updateClient = async (clientId, clientData) => {
    setSaving(true);
    try {
      const response = await apiRequest(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });

      const updatedClient = response.data || response;
      
      // Actualizar en la lista
      setClients(prev => prev.map(c => c._id === clientId ? updatedClient : c));
      
      // Actualizar el cliente seleccionado
      setSelectedClient(updatedClient);
      closeModal();
      return { success: true, client: updatedClient };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  return {
    selectedClient,
    isModalOpen,
    modalMode,
    clients,
    loadingClients,
    saving,
    openModal,
    closeModal,
    selectClient,
    clearClient,
    changeClient,
    editClient,
    viewClient,
    createClient,
    updateClient,
    setModalMode
  };
}