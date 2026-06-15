import React from 'react';
import useDiscountRulesLogic from './useDiscountRulesLogic';
import DiscountRulesTable from '../../components/DiscountRules/DiscountRulesTable';
import DiscountRuleModal from '../../components/DiscountRules/DiscountRuleModal';
import './DiscountRulesPage.css';

export default function DiscountRulesPage() {
  const {
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
  } = useDiscountRulesLogic();

  return (
    <div className="discount-rules-page">
      <div className="discount-rules-header">
        <h1>Reglas de Descuento</h1>
        <button className="btn-primary" onClick={openCreateModal}>
          + Nueva Regla
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

      <DiscountRulesTable
        rules={rules}
        loading={loading}
        onEdit={openEditModal}
        onDelete={requestDelete}
        onToggleActive={toggleActive}
      />

      <DiscountRuleModal
        isOpen={showModal}
        rule={editingRule}
        saving={saving}
        onClose={closeModal}
        onSave={saveRule}
      />

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && ruleToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Eliminación</h2>
              <button className="modal-close" onClick={cancelDelete}>✕</button>
            </div>
            <div className="modal-body">
              <p>
                ¿Estás seguro de que deseas eliminar la regla <strong>"{ruleToDelete.name}"</strong>?
              </p>
              {promotionsUsingRule > 0 && (
                <div className="warning-box">
                  <strong>⚠️ Atención:</strong> Esta regla está siendo utilizada por{' '}
                  <strong>{promotionsUsingRule} promoción(es)</strong>. 
                  Al eliminarla, se desasociará de dichas promociones.
                </div>
              )}
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