import React from 'react';
import usePromotionsLogic from './usePromotionsLogic';
import PromotionsTable from '../../components/Promotions/PromotionsTable';
import PromotionModal from '../../components/Promotions/PromotionModal';
import PromotionViewModal from '../../components/Promotions/PromotionViewModal';
import PromotionDeleteModal from '../../components/Promotions/PromotionDeleteModal';
import { Permission } from '../../components/Permission';
import './PromotionsPage.css';

export default function PromotionsPage() {
  const {
    promotions,
    discountRules,
    loading,
    error,
    success,
    showModal,
    editingPromotion,
    viewingPromotion,
    saving,
    showDeleteConfirm,
    promotionToDelete,
    openCreateModal,
    openEditModal,
    closeModal,
    savePromotion,
    viewPromotion,
    closeViewModal,
    requestDelete,
    confirmDelete,
    cancelDelete,
    toggleActive
  } = usePromotionsLogic();

  const handleEdit = (promotion) => {
    closeViewModal();
    openEditModal(promotion);
  };

  return (
    <div className="promotions-page">
      <div className="promotions-header">
        <h1>Promociones</h1>
        
        {/* Botón solo visible si tiene permiso de crear */}
        <Permission permission="create_promotions">
          <button className="btn-primary" onClick={openCreateModal}>
            + Nueva Promoción
          </button>
        </Permission>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <PromotionsTable
        promotions={promotions}
        loading={loading}
        onView={viewPromotion}
        onEdit={handleEdit}
        onDelete={requestDelete}
        onToggleActive={toggleActive}
      />

      {/* Modal de Crear/Editar */}
      <PromotionModal
        isOpen={showModal}
        promotion={editingPromotion}
        discountRules={discountRules}
        saving={saving}
        onClose={closeModal}
        onSave={savePromotion}
      />

      {/* Modal de Vista */}
      <PromotionViewModal
        isOpen={Boolean(viewingPromotion)}
        promotion={viewingPromotion}
        onClose={closeViewModal}
        onEdit={handleEdit}
      />

      {/* Modal de Confirmación de Eliminación */}
      <PromotionDeleteModal
        isOpen={showDeleteConfirm}
        promotion={promotionToDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        saving={saving}
      />
    </div>
  );
}