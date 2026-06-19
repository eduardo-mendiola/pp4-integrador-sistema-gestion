import React from 'react';
import useStatisticsLogic from './useStatisticsLogic';
import KPICards from '../../components/Statistics/KPICards/KPICards';
import EvolutionChart from '../../components/Statistics/EvolutionChart/EvolutionChart';
import PaymentMethodChart from '../../components/Statistics/PaymentMethodChart/PaymentMethodChart';
import TopProductsChart from '../../components/Statistics/TopProductsChart/TopProductsChart';
import SalesByHourChart from '../../components/Statistics/SalesByHourChart/SalesByHourChart';
import SalesByStatusChart from '../../components/Statistics/SalesByStatusChart/SalesByStatusChart';
import SalesByCategoryChart from '../../components/Statistics/SalesByCategoryChart/SalesByCategoryChart';
import './StatisticsPage.css';

export default function StatisticsPage() {
  const {
    statisticsData,
    loading,
    error,
    period,
    customDates,
    loadStatistics,
    handlePeriodChange,
    handleCustomDateChange
  } = useStatisticsLogic();

  const periodLabels = {
    'today': 'Hoy',
    'week': 'Esta Semana',
    'month': 'Este Mes',
    'year': 'Este Año',
    'custom': 'Personalizado'
  };

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h1>Estadísticas</h1>
      </div>

      {error && <div className="statistics-error">{error}</div>}

      {/* Panel de configuración */}
      <div className="statistics-config-panel">
        <h2>Panel de Control</h2>
        
        <div className="period-selector">
          <label>Período:</label>
          <div className="period-buttons">
            {Object.entries(periodLabels).map(([key, label]) => (
              <button
                key={key}
                className={`period-btn ${period === key ? 'active' : ''}`}
                onClick={() => handlePeriodChange(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {period === 'custom' && (
          <div className="custom-dates-grid">
            <div className="filter-group">
              <label>Fecha Desde</label>
              <input 
                type="date" 
                value={customDates.from} 
                onChange={(e) => handleCustomDateChange('from', e.target.value)} 
              />
            </div>
            <div className="filter-group">
              <label>Fecha Hasta</label>
              <input 
                type="date" 
                value={customDates.to} 
                onChange={(e) => handleCustomDateChange('to', e.target.value)} 
              />
            </div>
            <button 
              className="apply-dates-btn"
              onClick={loadStatistics}
            >
              Aplicar
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="statistics-loading">
          <div className="spinner"></div>
          <span>Cargando estadísticas...</span>
        </div>
      )}

      {/* Contenido de estadísticas */}
      {statisticsData && !loading && (
        <div className="statistics-content">
          {/* KPIs */}
          <KPICards kpis={statisticsData.kpis} />
          
          {/* Gráficos principales */}
          <div className="charts-grid">
            <EvolutionChart data={statisticsData.evolution} />
            <PaymentMethodChart data={statisticsData.byPaymentMethod} />
          </div>
          
          {/* Top productos */}
          <TopProductsChart data={statisticsData.topProducts} />
          
          {/* Gráficos secundarios */}
          <div className="charts-grid-secondary">
            <SalesByHourChart data={statisticsData.byHour} />
            <SalesByStatusChart data={statisticsData.byStatus} />
          </div>
          
          {/* Ventas por categoría */}
          <SalesByCategoryChart data={statisticsData.byCategory} />
        </div>
      )}
    </div>
  );
}