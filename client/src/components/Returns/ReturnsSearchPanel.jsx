import React, { useState, useMemo } from 'react';
import { RETURN_PERIOD_DAYS } from '../../pages/returns/useReturnsLogic'; 
import './ReturnsSearchPanel.css';

export default function ReturnsSearchPanel({ 
  filters, setFilters, onSearch, onClear, results, isSearching, hasSearched, onSelect, error 
}) {
  const [columnFilters, setColumnFilters] = useState({
    invoiceNumber: '',
    clientName: '',
    total: ''
  });
  
  const [sortConfig, setSortConfig] = useState({ 
    key: 'date', 
    direction: 'desc' 
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleColumnFilterChange = (column, value) => {
    setColumnFilters(prev => ({ ...prev, [column]: value }));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return ' ⇅';
  };

  const getInvoiceNumber = (sale) => (sale._id || '').slice(-8).toUpperCase();
  
  const getClientInfo = (sale) => {
    return sale.customer_name || 
           sale.metadata?.customer_name || 
           sale.client_id?.business_name ||
           sale.client_id?.first_name ||
           sale.client_id?.document_number || 'Sin datos';
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('es-AR');

  const hasActiveFilters = filters.invoiceNumber || filters.clientName || filters.dateFrom || filters.dateTo;
  const searchButtonText = hasActiveFilters ? 'Buscar Factura' : 'Mostrar todas las facturas';

  // Filtrar y ordenar resultados
  const filteredAndSortedResults = useMemo(() => {
    let filtered = [...results];

    // Aplicar filtros de columna
    if (columnFilters.invoiceNumber) {
      filtered = filtered.filter(sale => 
        getInvoiceNumber(sale).includes(columnFilters.invoiceNumber.toUpperCase())
      );
    }
    if (columnFilters.clientName) {
      filtered = filtered.filter(sale => 
        getClientInfo(sale).toLowerCase().includes(columnFilters.clientName.toLowerCase())
      );
    }
    if (columnFilters.total) {
      const totalValue = parseFloat(columnFilters.total);
      if (!isNaN(totalValue)) {
        filtered = filtered.filter(sale => sale.total >= totalValue);
      }
    }

    // Aplicar ordenamiento
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortConfig.key) {
          case 'invoice':
            aValue = getInvoiceNumber(a);
            bValue = getInvoiceNumber(b);
            break;
          case 'date':
            aValue = new Date(a.createdAt || a.created_at).getTime();
            bValue = new Date(b.createdAt || b.created_at).getTime();
            break;
          case 'client':
            aValue = getClientInfo(a).toLowerCase();
            bValue = getClientInfo(b).toLowerCase();
            break;
          case 'total':
            aValue = a.total || 0;
            bValue = b.total || 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [results, columnFilters, sortConfig]);

  return (
    <div className="returns-search-panel">
      <div className="search-header">
        <div className="search-header-text">
          <h2>Buscar Factura para Devolución o Cambio</h2>
          <p>Complete al menos un campo o haga clic en "Mostrar todas" para ver el historial reciente.</p>
        </div>
        
        <button 
          className="clear-filters-btn" 
          onClick={onClear} 
          disabled={isSearching || !hasActiveFilters}
          title="Limpiar todos los filtros"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="search-filters-grid">
        <div className="filter-group">
          <label>N° de Factura</label>
          <input 
            name="invoiceNumber" 
            placeholder="Ej: 4F5936E" 
            value={filters.invoiceNumber} 
            onChange={handleChange} 
          />
        </div>
        <div className="filter-group">
          <label>Cliente (Nombre o DNI)</label>
          <input 
            name="clientName" 
            placeholder="Ej: Carlos o 30123456" 
            value={filters.clientName} 
            onChange={handleChange} 
          />
        </div>
        <div className="filter-group">
          <label>Fecha Desde</label>
          <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleChange} />
        </div>
        <div className="filter-group">
          <label>Fecha Hasta</label>
          <input type="date" name="dateTo" value={filters.dateTo} onChange={handleChange} />
        </div>
      </div>

      <button className="search-action-btn full-width" onClick={onSearch} disabled={isSearching}>
        {isSearching ? 'Buscando...' : searchButtonText}
      </button>

      {error && <div className="search-error">{error}</div>}

      {filteredAndSortedResults.length > 0 && (
        <div className="search-results-table">
          <table>
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('invoice')}>
                  N° Factura {getSortIcon('invoice')}
                </th>
                <th className="sortable" onClick={() => handleSort('date')}>
                  Fecha Compra {getSortIcon('date')}
                </th>
                <th>Válido hasta</th>
                <th className="sortable" onClick={() => handleSort('client')}>
                  Cliente {getSortIcon('client')}
                </th>
                <th className="sortable" onClick={() => handleSort('total')}>
                  Total {getSortIcon('total')}
                </th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
              <tr className="column-filters">
                <th>
                  <input 
                    type="text"
                    placeholder="Filtrar..."
                    value={columnFilters.invoiceNumber}
                    onChange={(e) => handleColumnFilterChange('invoiceNumber', e.target.value)}
                    className="column-filter-input"
                  />
                </th>
                <th></th>
                <th></th>
                <th>
                  <input 
                    type="text"
                    placeholder="Filtrar..."
                    value={columnFilters.clientName}
                    onChange={(e) => handleColumnFilterChange('clientName', e.target.value)}
                    className="column-filter-input"
                  />
                </th>
                <th>
                  <input 
                    type="number"
                    placeholder="Mínimo..."
                    value={columnFilters.total}
                    onChange={(e) => handleColumnFilterChange('total', e.target.value)}
                    className="column-filter-input"
                  />
                </th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedResults.map(sale => {
                const saleDate = new Date(sale.createdAt || sale.created_at);
                const today = new Date();
                const daysDiff = Math.floor((today - saleDate) / (1000 * 60 * 60 * 24));
                
                const isEligible = daysDiff <= RETURN_PERIOD_DAYS; 
                
                const deadlineDate = new Date(saleDate);
                deadlineDate.setDate(deadlineDate.getDate() + RETURN_PERIOD_DAYS);

                return (
                  <tr key={sale._id} className={!isEligible ? 'row-expired' : ''}>
                    <td className="font-mono">{getInvoiceNumber(sale)}</td>
                    <td>{formatDate(saleDate)}</td>
                    <td>{formatDate(deadlineDate)}</td>
                    <td>{getClientInfo(sale)}</td>
                    <td className="font-bold">${(sale.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                    <td>
                      {isEligible ? (
                        <span className="status-badge valid">Válida ({RETURN_PERIOD_DAYS - daysDiff} días)</span>
                      ) : (
                        <span className="status-badge expired">Vencida ({daysDiff} días)</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className={`select-btn ${!isEligible ? 'disabled' : ''}`} 
                        onClick={() => isEligible && onSelect(sale)}
                        disabled={!isEligible}
                        title={!isEligible ? `Fuera del período de ${RETURN_PERIOD_DAYS} días` : "Seleccionar para operar"}
                      >
                        {isEligible ? 'Seleccionar' : 'No apta'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {hasSearched && !isSearching && filteredAndSortedResults.length === 0 && (
        <div className="search-empty">
          No se encontraron facturas que coincidan con los criterios de búsqueda.
        </div>
      )}
    </div>
  );
}