import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../services/api.js';
import { printSaleReceipt } from '../../../utils/printSaleReceipt.js';
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
  const [saleToCancel, setSaleToCancel] = useState(null);
  const [saleToConfirmCancel, setSaleToConfirmCancel] = useState(null);
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

  const handleCancelSale = (sale) => {
    setSaleToCancel(sale);
  };

  const handleConfirmCancelClick = () => {
    setSaleToConfirmCancel(saleToCancel);
    setSaleToCancel(null);
  };

  const handleCloseConfirmModal = () => {
    setSaleToCancel(null);
  };

  const handleCloseCancelModal = () => {
    if (!cancelling) {
      setSaleToConfirmCancel(null);
    }
  };

  // Función para confirmar anulación de venta
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
      
      // Notificar al Header que debe recargar productos
      window.dispatchEvent(new CustomEvent('productsUpdated'));
    } catch (err) {
      console.error('Error al anular venta:', err);
      alert('Error al anular la venta: ' + err.message);
    } finally {
      setCancelling(false);
    }
  };

  // ✅ NUEVO: Función de reimprimir usando el utilitario
  const handleReprintSale = (sale) => {
    printSaleReceipt(sale);
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

      <CancelSaleConfirmModal
        sale={saleToCancel}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmCancelClick}
      />

      <CancelSaleModal
        sale={saleToConfirmCancel}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
        loading={cancelling}
      />
    </div>
  );
}