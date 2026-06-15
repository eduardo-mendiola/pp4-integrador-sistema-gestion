import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api.js';

export default function usePromotionsLogic() {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [discountRules, setDiscountRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [saving, setSaving] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState(null);

  useEffect(() => {
    loadPromotions();
    loadProducts();
    loadDiscountRules();
  }, []);

  const loadPromotions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiRequest('/api/promotions');
      setPromotions(response.data || []);
    } catch (err) {
      setError('Error al cargar las promociones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await apiRequest('/api/products?limit=1000');
      setProducts(response.data || []);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    }
  };

  const loadDiscountRules = async () => {
    try {
      const response = await apiRequest('/api/discount-rules');
      setDiscountRules(response.data || []);
    } catch (err) {
      console.error('Error al cargar reglas:', err);
    }
  };

  const openCreateModal = () => {
    setEditingPromotion(null);
    setShowModal(true);
  };

  const openEditModal = (promotion) => {
    setEditingPromotion(promotion);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPromotion(null);
  };

  const savePromotion = async (promotionData) => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (editingPromotion) {
        await apiRequest(`/api/promotions/${editingPromotion._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(promotionData)
        });
        setSuccess('Promoción actualizada exitosamente');
      } else {
        await apiRequest('/api/promotions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(promotionData)
        });
        setSuccess('Promoción creada exitosamente');
      }

      closeModal();
      await loadPromotions();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al guardar la promoción');
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (promotion) => {
    setPromotionToDelete(promotion);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!promotionToDelete) return;

    setSaving(true);
    setError('');

    try {
      await apiRequest(`/api/promotions/${promotionToDelete._id}`, {
        method: 'DELETE'
      });
      
      setSuccess('Promoción eliminada exitosamente');
      setShowDeleteConfirm(false);
      setPromotionToDelete(null);
      await loadPromotions();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al eliminar la promoción');
    } finally {
      setSaving(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPromotionToDelete(null);
  };

  const toggleActive = async (promotion) => {
    try {
      await apiRequest(`/api/promotions/${promotion._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !promotion.active })
      });
      
      setSuccess(`Promoción ${promotion.active ? 'desactivada' : 'activada'} exitosamente`);
      await loadPromotions();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al cambiar el estado de la promoción');
    }
  };

  return {
    promotions,
    products,
    discountRules,
    loading,
    error,
    success,
    showModal,
    editingPromotion,
    saving,
    showDeleteConfirm,
    promotionToDelete,
    openCreateModal,
    openEditModal,
    closeModal,
    savePromotion,
    requestDelete,
    confirmDelete,
    cancelDelete,
    toggleActive
  };
}