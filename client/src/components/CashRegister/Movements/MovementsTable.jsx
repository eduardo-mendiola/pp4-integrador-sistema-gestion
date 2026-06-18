import React, { useState, useMemo } from 'react';
import './MovementsTable.css';

const typeLabels = {
  INCOME: 'Ingreso',
  EXPENSE: 'Egreso'
};

const paymentMethodLabels = {
  cash: 'Efectivo',
  debit_card: 'Débito',
  credit_card: 'Crédito',
  transfer: 'Transferencia'
};

const sourceTypeLabels = {
  SALE: 'Venta',
  RETURN: 'Devolución',
  VOUCHER: 'Comprobante',
  MANUAL: 'Manual',
  OPENING: 'Apertura',
  CLOSING: 'Cierre'
};

export default function MovementsTable({ movements, loading, filters, onFilterChange, onViewDetail, onPrintMovement, onDownloadMovement  }) {
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value) => {
    return (value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
  };

  const getOperatorName = (movement) => {
    const op = movement.operatorId;
    if (!op) return '-';
    return op.first_name && op.last_name 
      ? `${op.first_name} ${op.last_name}`
      : op.username || '-';
  };

  const clearAllFilters = () => {
    onFilterChange({
      type: '',
      paymentMethod: '',
      sourceType: '',
      operator: '',
      minAmount: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const hasActiveFilters = filters.type || filters.paymentMethod || filters.sourceType || 
                           filters.operator || filters.minAmount ||
                           filters.dateFrom || filters.dateTo;

  // Filtrar movimientos según los filtros externos
  const filteredMovements = useMemo(() => {
    let result = [...movements];

    if (filters.type) {
      result = result.filter(m => m.type === filters.type);
    }
    if (filters.paymentMethod) {
      result = result.filter(m => m.paymentMethod === filters.paymentMethod);
    }
    if (filters.sourceType) {
      result = result.filter(m => m.sourceType === filters.sourceType);
    }
    if (filters.operator) {
      result = result.filter(m => 
        getOperatorName(m).toLowerCase().includes(filters.operator.toLowerCase())
      );
    }
    if (filters.minAmount) {
      const minValue = parseFloat(filters.minAmount);
      if (!isNaN(minValue)) {
        result = result.filter(m => m.amount >= minValue);
      }
    }
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      result = result.filter(m => new Date(m.date) >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(m => new Date(m.date) <= toDate);
    }

    return result;
  }, [movements, filters]);

  // Ordenar
  const sortedMovements = useMemo(() => {
    let sortableItems = [...filteredMovements];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortConfig.key) {
          case 'date':
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
            break;
          case 'type':
            aValue = a.type;
            bValue = b.type;
            break;
          case 'concept':
            aValue = (a.concept || '').toLowerCase();
            bValue = (b.concept || '').toLowerCase();
            break;
          case 'method':
            aValue = a.paymentMethod;
            bValue = b.paymentMethod;
            break;
          case 'amount':
            aValue = a.amount || 0;
            bValue = b.amount || 0;
            break;
          case 'operator':
            aValue = getOperatorName(a).toLowerCase();
            bValue = getOperatorName(b).toLowerCase();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredMovements, sortConfig]);

  if (loading) {
    return (
      <div className="movements-table-loading">
        <div className="movements-table-spinner"></div>
        <span>Cargando movimientos...</span>
      </div>
    );
  }

  return (
    <div className="movements-panel">
      <div className="movements-panel-header">
        <div>
          <h2>Listado de Movimientos</h2>
          <p className="movements-count">
            {sortedMovements.length} {sortedMovements.length === 1 ? 'movimiento' : 'movimientos'}
            {hasActiveFilters && ' (filtrado)'}
          </p>
        </div>
        {hasActiveFilters && (
          <button 
            className="clear-filters-btn" 
            onClick={clearAllFilters}
            title="Limpiar todos los filtros"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Filtros fuera de la tabla */}
      <div className="movements-filters-grid">
        <div className="filter-group">
          <label>Tipo</label>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="INCOME">Ingresos</option>
            <option value="EXPENSE">Egresos</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Método de Pago</label>
          <select
            value={filters.paymentMethod}
            onChange={(e) => onFilterChange({ ...filters, paymentMethod: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="cash">Efectivo</option>
            <option value="debit_card">Débito</option>
            <option value="credit_card">Crédito</option>
            <option value="transfer">Transferencia</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Origen</label>
          <select
            value={filters.sourceType}
            onChange={(e) => onFilterChange({ ...filters, sourceType: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="SALE">Venta</option>
            <option value="RETURN">Devolución</option>
            <option value="VOUCHER">Comprobante</option>
            <option value="MANUAL">Manual</option>
            <option value="OPENING">Apertura</option>
            <option value="CLOSING">Cierre</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Operador</label>
          <input 
            type="text"
            placeholder="Nombre del operador..."
            value={filters.operator}
            onChange={(e) => onFilterChange({ ...filters, operator: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>Monto Mínimo</label>
          <input 
            type="number"
            placeholder="$ 0.00"
            value={filters.minAmount}
            onChange={(e) => onFilterChange({ ...filters, minAmount: e.target.value })}
            min="0"
            step="0.01"
          />
        </div>

        <div className="filter-group">
          <label>Fecha Desde</label>
          <input 
            type="date" 
            value={filters.dateFrom} 
            onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })} 
          />
        </div>

        <div className="filter-group">
          <label>Fecha Hasta</label>
          <input 
            type="date" 
            value={filters.dateTo} 
            onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })} 
          />
        </div>
      </div>

      {sortedMovements.length === 0 ? (
        <div className="movements-table-empty">
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No hay movimientos registrados</p>
        </div>
      ) : (
        <div className="movements-table-container">
          <table className="movements-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th className="sortable" onClick={() => handleSort('date')} style={{ width: '170px' }}>
                  Fecha/Hora {getSortIcon('date')}
                </th>
                <th className="sortable" onClick={() => handleSort('type')} style={{ width: '110px' }}>
                  Tipo {getSortIcon('type')}
                </th>
                <th className="sortable" onClick={() => handleSort('concept')}>
                  Concepto {getSortIcon('concept')}
                </th>
                <th className="sortable" onClick={() => handleSort('method')} style={{ width: '140px' }}>
                  Método {getSortIcon('method')}
                </th>
                <th className="sortable" onClick={() => handleSort('amount')} style={{ textAlign: 'right', width: '150px' }}>
                  Monto {getSortIcon('amount')}
                </th>
                <th className="sortable" onClick={() => handleSort('operator')} style={{ width: '180px' }}>
                  Operador {getSortIcon('operator')}
                </th>
                <th className="text-center" style={{ width: '120px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedMovements.map((movement, index) => (
                <tr key={movement._id}>
                  <td>{index + 1}</td>
                  <td>{formatDate(movement.date)}</td>
                  <td>
                    <span className={`movements-type-badge ${movement.type.toLowerCase()}`}>
                      {typeLabels[movement.type]}
                    </span>
                  </td>
                  <td>
                    <div className="movements-concept">
                      <span className="movements-concept-main">{movement.concept}</span>
                      <span className="movements-concept-source">
                        {sourceTypeLabels[movement.sourceType] || movement.sourceType}
                      </span>
                    </div>
                  </td>
                  <td>{paymentMethodLabels[movement.paymentMethod] || movement.paymentMethod}</td>
                  <td className={`movements-amount ${movement.type.toLowerCase()}`} style={{ textAlign: 'right' }}>
                    {movement.type === 'INCOME' ? '+' : '-'}${formatCurrency(movement.amount)}
                  </td>
                  <td>{getOperatorName(movement)}</td>
                                    <td className="text-center">
                    <div className="movements-actions">
                      <button 
                        className="movements-action-btn view"
                        onClick={() => onViewDetail(movement)}
                        title="Ver detalles"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      {onPrintMovement && (
                        <button 
                          className="movements-action-btn reprint"
                          onClick={() => onPrintMovement(movement)}
                          title="Imprimir comprobante"
                        >
                          🖨️
                        </button>
                      )}
                      {onDownloadMovement && (
                        <button 
                          className="movements-action-btn download"
                          onClick={() => onDownloadMovement(movement)}
                          title="Descargar PDF"
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}