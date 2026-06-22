import React from 'react';
import useCashRegisterLogic from './useCashRegisterLogic';
import CashRegisterStatsCards from '../../../components/CashRegister/Status/CashRegisterStatsCards';
import CashRegisterStatus from '../../../components/CashRegister/Status/CashRegisterStatus';
import CashFlowTable from '../../../components/CashRegister/Status/CashFlowTable';
import OpenCashModal from '../../../components/CashRegister/Status/OpenCashModal';
import CloseCashModal from '../../../components/CashRegister/Status/CloseCashModal';
import './CashRegisterPage.css';

export default function CashRegisterPage() {
  const {
    cashRegister,
    dailySummary,
    lastClosedSummary, 
    cashFlows,
    loading,
    error,
    success,
    showOpenModal,
    showCloseModal,
    saving,
    filters,
    setShowOpenModal,
    setShowCloseModal,
    openCashRegister,
    closeCashRegister,
    handleFilterChange,
    loadCashRegisterStatus,
    loadDailySummary,
    loadCashFlows
  } = useCashRegisterLogic();

  const isOpen = cashRegister?.status === 'OPEN';

  // Función para refrescar datos manualmente
  const handleRefresh = async () => {
    await loadCashRegisterStatus();
    if (cashRegister?.status === 'OPEN') {
      await loadDailySummary();
      await loadCashFlows();
    }
  };

    return (
    <div className="cash-register-page">
      <div className="cash-register-header">
        <h1>Estado de Caja</h1>
        <div className="cash-register-header-actions">
          <button 
            className="btn-secondary" 
            onClick={handleRefresh}
            title="Refrescar datos"
          >
            🔄 Refrescar
          </button>
          {!isOpen ? (
            <button 
              className="btn-primary" 
              onClick={() => setShowOpenModal(true)}
            >
              🔓 Abrir Caja
            </button>
          ) : (
            <button 
              className="btn-danger" 
              onClick={() => setShowCloseModal(true)}
            >
              🔒 Cerrar Caja
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <div className="cash-register-loading">
          <div className="spinner"></div>
          <span>Cargando estado de caja...</span>
        </div>
      ) : (
        <>
          {/* Cards de estadísticas */}
          <CashRegisterStatsCards 
            cashRegister={cashRegister}
            dailySummary={dailySummary}
            lastClosedSummary={lastClosedSummary} 
          />

          {/* Panel de estado actual */}
          <CashRegisterStatus 
            cashRegister={cashRegister}
            dailySummary={dailySummary}
          />

          {/* Tabla de movimientos (solo si está abierta) */}
          {isOpen && (
            <CashFlowTable 
              cashFlows={cashFlows}
              cashRegister={cashRegister}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          )}
        </>
      )}

      {/* Modal de apertura */}
      <OpenCashModal
        isOpen={showOpenModal}
        onClose={() => setShowOpenModal(false)}
        onConfirm={openCashRegister}
        loading={saving}
      />

      {/* Modal de cierre */}
      <CloseCashModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={closeCashRegister}
        cashRegister={cashRegister}
        dailySummary={dailySummary}
        loading={saving}
      />
    </div>
  );
}