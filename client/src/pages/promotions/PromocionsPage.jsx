import React from 'react';
import usePromotionsLogic from './usePromotionsLogic';
import PromotionsTable from '../../components/Promotions/PromotionsTable';
import PromotionModal from '../../components/Promotions/PromotionModal';
import './PromotionsPage.css';

export default function PromotionsPage() {
  const {
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
  } = usePromotionsLogic();

  return (
    <div className="promotions-page">
      <div className="promotions-header">
        <h1>Promociones</h1>
        <button className="btn-primary" onClick={openCreateModal}>
          + Nueva Promoción
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <PromotionsTable
        promotions={promotions}
        loading={loading}
        onEdit={openEditModal}
        onDelete={requestDelete}
        onToggleActive={toggleActive}
      />

      <PromotionModal
        isOpen={showModal}
        promotion={editingPromotion}
        products={products}
        discountRules={discountRules}
        saving={saving}
        onClose={closeModal}
        onSave={savePromotion}
      />

      {showDeleteConfirm && promotionToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Eliminación</h2>
              <button className="modal-close" onClick={cancelDelete}>✕</button>
            </div>
            <div className="modal-body">
              <p>
                ¿Estás seguro de que deseas eliminar la promoción <strong>"{promotionToDelete.name}"</strong>?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={cancelDelete} disabled={saving}>
                Cancelar
              </button>
              <button className="btn-danger" onClick={confirmDelete} disabled={saving}>
                {saving ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}