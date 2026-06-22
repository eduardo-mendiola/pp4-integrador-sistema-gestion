import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api.js';

export default function useDiscountRulesLogic() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Solo para el modal de VER detalle (lectura)
  const [viewingRule, setViewingRule] = useState(null);

  // Estados para confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [promotionsUsingRule, setPromotionsUsingRule] = useState(0);
  const [saving, setSaving] = useState(false);

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

  // Modal de solo lectura (ver detalle)
  const viewRule = (rule) => {
    setViewingRule(rule);
  };

  const closeViewModal = () => {
    setViewingRule(null);
  };

  // Eliminación
  const requestDelete = async (rule) => {
    setRuleToDelete(rule);
    
    try {
      const response = await apiRequest(`/api/discount-rules/${rule._id}/promotions-count`);
      setPromotionsUsingRule(response.data?.count || 0);
    } catch (err) {
      setPromotionsUsingRule(0);
    }
    
    setShowDeleteConfirm(true);
  };

  // Confirmar eliminación
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

  // Toggle activo/inactivo
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
    saving,
    viewingRule,
    viewRule,
    closeViewModal,
    showDeleteConfirm,
    ruleToDelete,
    promotionsUsingRule,
    requestDelete,
    confirmDelete,
    cancelDelete,
    toggleActive
  };
}