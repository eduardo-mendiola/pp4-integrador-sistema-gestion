import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../services/api.js';
import useSalesList from './useSalesList';
import SalesStatsCards from '../../../components/Sales/SalesList/SalesStatsCards';
import SalesFilters from '../../../components/Sales/SalesList/SalesFilters';
import SalesTable from '../../../components/Sales/SalesList/SalesTable';
import SaleDetailsModal from '../../../components/Sales/SalesList/SaleDetailsModal';
import CancelSaleConfirmModal from '../../../components/Sales/SalesList/CancelSaleConfirmModal';
import CancelSaleModal from '../../../components/Sales/SalesList/CancelSaleModal';
import './SalesListPage.css';

export default function SalesListPage() {
  const { sales, allSales, loading, error, filters, setFilters, loadSales } = useSalesList();
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleToCancel, setSaleToCancel] = useState(null);      // Modal de confirmación
  const [saleToConfirmCancel, setSaleToConfirmCancel] = useState(null); // Modal de motivo
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  const handleViewSale = (sale) => {
    setSelectedSale(sale);
  };

  const handleCloseModal = () => {
    setSelectedSale(null);
  };

  // Click en ❌ → abre modal de confirmación
  const handleCancelSale = (sale) => {
    setSaleToCancel(sale);
  };

  // Click en "Sí, continuar" → cierra confirmación y abre modal de motivo
  const handleConfirmCancelClick = () => {
    setSaleToConfirmCancel(saleToCancel);
    setSaleToCancel(null);
  };

  // Cerrar modal de confirmación
  const handleCloseConfirmModal = () => {
    setSaleToCancel(null);
  };

  // Cerrar modal de motivo
  const handleCloseCancelModal = () => {
    if (!cancelling) {
      setSaleToConfirmCancel(null);
    }
  };

  // Confirmar anulación con motivo → llamada al backend
  const handleConfirmCancel = async (sale, reason) => {
    setCancelling(true);
    try {
      const response = await apiRequest(`/api/sales/${sale._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CANCELLED',
          metadata: {
            cancel_reason: reason,
            cancelled_at: new Date().toISOString()
          }
        })
      });

      if (!response.success) {
        throw new Error(response.message || 'Error al anular la venta');
      }

      setSaleToConfirmCancel(null);
      loadSales();
    } catch (err) {
      console.error('Error al anular venta:', err);
      alert('Error al anular la venta: ' + err.message);
    } finally {
      setCancelling(false);
    }
  };

  const handleReprintSale = (sale) => {
    console.log('Reimprimir venta:', sale);
    alert('Función de reimpresión en desarrollo');
  };

  const filtersWithCount = { ...filters, _filteredCount: sales.length };

  return (
    <div className="sales-list-container">
      <div className="sales-list-header">
        <h1>Ventas</h1>
        <button 
          className="sales-list-refresh-btn"
          onClick={loadSales}
          disabled={loading}
        >
          🔄 Actualizar
        </button>
      </div>

      {error && (
        <div className="sales-list-error">
          Error al cargar las ventas: {error}
        </div>
      )}

      <SalesStatsCards sales={allSales} />

      <SalesFilters 
        filters={filtersWithCount}
        onFilterChange={setFilters}
      />

      <SalesTable 
        sales={sales} 
        loading={loading} 
        onViewSale={handleViewSale}
        onCancelSale={handleCancelSale}
        onReprintSale={handleReprintSale}
      />

      <SaleDetailsModal
        sale={selectedSale}
        onClose={handleCloseModal}
        onReprint={handleReprintSale}
      />

      {/* Modal 1: Confirmación inicial */}
      <CancelSaleConfirmModal
        sale={saleToCancel}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmCancelClick}
      />

      {/* Modal 2: Ingreso de motivo */}
      <CancelSaleModal
        sale={saleToConfirmCancel}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
        loading={cancelling}
      />
    </div>
  );
}