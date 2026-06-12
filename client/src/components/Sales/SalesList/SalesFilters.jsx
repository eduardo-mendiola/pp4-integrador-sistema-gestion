import React, { useState } from 'react';
import './SalesFilters.css';

export default function SalesFilters({ filters, onFilterChange }) {
  const [showCustomDate, setShowCustomDate] = useState(false);

  const handleDateRangeChange = (range) => {
    if (range === 'custom') {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
      onFilterChange({ 
        ...filters, 
        dateRange: range, 
        customDateFrom: '', 
        customDateTo: '' 
      });
    }
  };

  const handleCustomDateChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({
      dateRange: 'all',
      customDateFrom: '',
      customDateTo: '',
      status: '',
      paymentMethod: '',
      clientSearch: '',
      saleNumber: ''
    });
    setShowCustomDate(false);
  };

  const hasActiveFilters = 
    filters.status || 
    filters.paymentMethod || 
    filters.clientSearch || 
    filters.saleNumber || 
    filters.dateRange !== 'all';

  return (
    <div className="sales-filters-container">
      <div className="sales-filters-grid">
        {/* Rango de fechas */}
        <div className="sales-filter-group">
          <label className="sales-filter-label">Período</label>
          <select
            className="sales-filter-select"
            value={filters.dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
          >
            <option value="all">Todo</option>
            <option value="today">Hoy</option>
            <option value="yesterday">Ayer</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        {/* Fechas personalizadas */}
        {showCustomDate && (
          <>
            <div className="sales-filter-group">
              <label className="sales-filter-label">Desde</label>
              <input
                type="date"
                className="sales-filter-input"
                value={filters.customDateFrom}
                onChange={(e) => handleCustomDateChange('customDateFrom', e.target.value)}
              />
            </div>
            <div className="sales-filter-group">
              <label className="sales-filter-label">Hasta</label>
              <input
                type="date"
                className="sales-filter-input"
                value={filters.customDateTo}
                onChange={(e) => handleCustomDateChange('customDateTo', e.target.value)}
              />
            </div>
          </>
        )}

        {/* Estado */}
        <div className="sales-filter-group">
          <label className="sales-filter-label">Estado</label>
          <select
            className="sales-filter-select"
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="PAID">Pagada</option>
            <option value="PENDING">Pendiente</option>
            <option value="CANCELLED">Anulada</option>
          </select>
        </div>

        {/* Método de pago */}
        <div className="sales-filter-group">
          <label className="sales-filter-label">Método de Pago</label>
          <select
            className="sales-filter-select"
            value={filters.paymentMethod}
            onChange={(e) => onFilterChange({ ...filters, paymentMethod: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="cash">Efectivo</option>
            <option value="credit_card">Tarjeta de Crédito</option>
            <option value="debit_card">Tarjeta de Débito</option>
            <option value="transfer">Transferencia</option>
          </select>
        </div>

        {/* Búsqueda de cliente */}
        <div className="sales-filter-group">
          <label className="sales-filter-label">Cliente</label>
          <input
            type="text"
            className="sales-filter-input"
            placeholder="Buscar por nombre..."
            value={filters.clientSearch}
            onChange={(e) => onFilterChange({ ...filters, clientSearch: e.target.value })}
          />
        </div>

        {/* Número de venta */}
        <div className="sales-filter-group">
          <label className="sales-filter-label">N° Venta</label>
          <input
            type="text"
            className="sales-filter-input"
            placeholder="Buscar por ID..."
            value={filters.saleNumber}
            onChange={(e) => onFilterChange({ ...filters, saleNumber: e.target.value })}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="sales-filters-actions">
          <button className="sales-filters-clear-btn" onClick={clearFilters}>
            ️ Limpiar filtros
          </button>
          <span className="sales-filters-count">
            {filters._filteredCount !== undefined && `${filters._filteredCount} resultados`}
          </span>
        </div>
      )}
    </div>
  );
}