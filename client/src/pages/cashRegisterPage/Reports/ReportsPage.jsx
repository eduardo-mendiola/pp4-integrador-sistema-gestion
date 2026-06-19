import React from 'react';
import useReportsLogic from './useReportsLogic';
import ReportSelector from '../../../components/CashRegister/Reports/ReportSelector';
import MovementsReport from '../../../components/CashRegister/Reports/MovementsReport';
import CashClosingReport from '../../../components/CashRegister/Reports/CashClosingReport';
import SalesReport from '../../../components/CashRegister/Reports/SalesReport';
import './ReportsPage.css';

export default function ReportsPage() {
  const {
    selectedReport,
    reportData,
    loading,
    error,
    filters,
    setFilters,
    selectReport,
    clearSelection,
    generateReport
  } = useReportsLogic();

  const reportTitles = {
    'cash-closing': 'Cierre de Caja',
    'sales': 'Ventas por Período',
    'movements': 'Movimientos de Caja',
    'top-products': 'Productos Más Vendidos',
    'returns': 'Devoluciones y Cambios'
  };

  const renderReport = () => {
    if (!reportData) return null;

    switch (selectedReport) {
      case 'movements':
        return <MovementsReport data={reportData} />;
      case 'cash-closing':
        return <CashClosingReport data={reportData} />;
      case 'sales':
        return <SalesReport data={reportData} />;
      case 'top-products':
      case 'returns':
        return (
          <div className="report-results">
            <h3>Reporte: {reportTitles[selectedReport]}</h3>
            <p>Próximamente...</p>
            <pre>{JSON.stringify(reportData, null, 2)}</pre>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Reportes</h1>
        {selectedReport && (
          <button 
            className="back-btn" 
            onClick={clearSelection}
            title="Volver al selector"
          >
            ← Volver
          </button>
        )}
      </div>

      {error && <div className="reports-error">{error}</div>}

      {!selectedReport ? (
        <ReportSelector onSelect={selectReport} />
      ) : (
        <div className="report-workspace">
          <div className="report-config-panel">
            <h2>{reportTitles[selectedReport]}</h2>
            
            <div className="report-filters-grid">
              <div className="filter-group">
                <label>Fecha Desde</label>
                <input 
                  type="date" 
                  value={filters.dateFrom} 
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} 
                />
              </div>

              <div className="filter-group">
                <label>Fecha Hasta</label>
                <input 
                  type="date" 
                  value={filters.dateTo} 
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} 
                />
              </div>
            </div>

            <button 
              className="generate-report-btn"
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? 'Generando...' : '📄 Generar Reporte'}
            </button>
          </div>

          {loading && (
            <div className="report-loading">
              <div className="spinner"></div>
              <span>Generando reporte...</span>
            </div>
          )}

          {reportData && !loading && renderReport()}
        </div>
      )}
    </div>
  );
}