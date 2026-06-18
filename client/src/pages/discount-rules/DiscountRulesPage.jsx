import React from 'react';
import { useNavigate } from 'react-router-dom';
import useDiscountRulesLogic from './useDiscountRulesLogic';
import DiscountRulesTable from '../../components/DiscountRules/DiscountRulesTable';
import DiscountRuleViewModal from '../../components/DiscountRules/DiscountRuleViewModal';
import DiscountRuleDeleteModal from '../../components/DiscountRules/DiscountRuleDeleteModal';
import './DiscountRulesPage.css';

export default function DiscountRulesPage() {
  const navigate = useNavigate();
  const {
    rules,
    loading,
    error,
    success,
    viewingRule,
    saving,
    showDeleteConfirm,
    ruleToDelete,
    promotionsUsingRule,
    viewRule,
    closeViewModal,
    requestDelete,
    confirmDelete,
    cancelDelete,
    toggleActive
  } = useDiscountRulesLogic();

  const handleCreate = () => {
    navigate('/promociones/descuentos/nuevo');
  };

  const handleEdit = (rule) => {
    navigate(`/promociones/descuentos/${rule._id}/editar`);
  };

  const handleViewEdit = (rule) => {
    closeViewModal();
    navigate(`/promociones/descuentos/${rule._id}/editar`);
  };

  return (
    <div className="discount-rules-page">
      <div className="discount-rules-header">
        <h1>Reglas de Descuento</h1>
        <button className="btn-primary" onClick={handleCreate}>
          + Nueva Regla
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <DiscountRulesTable
        rules={rules}
        loading={loading}
        onView={viewRule}
        onEdit={handleEdit}
        onDelete={requestDelete}
        onToggleActive={toggleActive}
      />

      <DiscountRuleViewModal
        isOpen={Boolean(viewingRule)}
        rule={viewingRule}
        onClose={closeViewModal}
        onEdit={handleViewEdit}
      />

       <DiscountRuleDeleteModal
        isOpen={showDeleteConfirm}
        rule={ruleToDelete}
        promotionsCount={promotionsUsingRule}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        saving={saving}
      />
    </div>
  );
}