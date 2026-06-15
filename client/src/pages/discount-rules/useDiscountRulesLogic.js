import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api.js';

export default function useDiscountRulesLogic() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para modal
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [saving, setSaving] = useState(false);

  // Estados para confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [promotionsUsingRule, setPromotionsUsingRule] = useState(0);

  // Cargar reglas al montar
  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiRequest('/api/discount-rules');
      setRules(response.data || []);
    } catch (err) {
      setError('Error al cargar las reglas de descuento');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingRule(null);
    setShowModal(true);
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRule(null);
  };

  const saveRule = async (ruleData) => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (editingRule) {
        // Actualizar
        await apiRequest(`/api/discount-rules/${editingRule._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ruleData)
        });
        setSuccess('Regla actualizada exitosamente');
      } else {
        // Crear
        await apiRequest('/api/discount-rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ruleData)
        });
        setSuccess('Regla creada exitosamente');
      }

      closeModal();
      await loadRules();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al guardar la regla');
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = async (rule) => {
    setRuleToDelete(rule);
    
    // Verificar cuántas promociones usan esta regla
    try {
      const response = await apiRequest(`/api/discount-rules/${rule._id}/promotions-count`);
      setPromotionsUsingRule(response.data?.count || 0);
    } catch (err) {
      setPromotionsUsingRule(0);
    }
    
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!ruleToDelete) return;

    setSaving(true);
    setError('');

    try {
      await apiRequest(`/api/discount-rules/${ruleToDelete._id}`, {
        method: 'DELETE'
      });
      
      setSuccess('Regla eliminada exitosamente');
      setShowDeleteConfirm(false);
      setRuleToDelete(null);
      await loadRules();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al eliminar la regla');
    } finally {
      setSaving(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setRuleToDelete(null);
    setPromotionsUsingRule(0);
  };

  const toggleActive = async (rule) => {
    try {
      await apiRequest(`/api/discount-rules/${rule._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !rule.active })
      });
      
      setSuccess(`Regla ${rule.active ? 'desactivada' : 'activada'} exitosamente`);
      await loadRules();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al cambiar el estado de la regla');
    }
  };

  return {
    rules,
    loading,
    error,
    success,
    showModal,
    editingRule,
    saving,
    showDeleteConfirm,
    ruleToDelete,
    promotionsUsingRule,
    openCreateModal,
    openEditModal,
    closeModal,
    saveRule,
    requestDelete,
    confirmDelete,
    cancelDelete,
    toggleActive
  };
}