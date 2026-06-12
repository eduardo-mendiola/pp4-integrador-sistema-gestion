import React, { useEffect, useState } from 'react';
import useSalesList from './useSalesList';
import SalesStatsCards from '../../../components/Sales/SalesList/SalesStatsCards';
import SalesFilters from '../../../components/Sales/SalesList/SalesFilters';
import SalesTable from '../../../components/Sales/SalesList/SalesTable';
import SaleDetailsModal from '../../../components/Sales/SalesList/SaleDetailsModal';
import './SalesListPage.css';

export default function SalesListPage() {
  const { sales, allSales, loading, error, filters, setFilters, loadSales } = useSalesList();
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    loadSales();
  }, []);

  const handleViewSale = (sale) => {
    setSelectedSale(sale);
  };

  const handleCloseModal = () => {
    setSelectedSale(null);
  };

  const handleReprint = (sale) => {
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

      {/* Las estadísticas usan allSales (todas las ventas sin filtrar) */}
      <SalesStatsCards sales={allSales} />

      <SalesFilters 
        filters={filtersWithCount}
        onFilterChange={setFilters}
      />

      <SalesTable 
        sales={sales} 
        loading={loading} 
        onViewSale={handleViewSale}
      />

      <SaleDetailsModal
        sale={selectedSale}
        onClose={handleCloseModal}
        onReprint={handleReprint}
      />
    </div>
  );
}