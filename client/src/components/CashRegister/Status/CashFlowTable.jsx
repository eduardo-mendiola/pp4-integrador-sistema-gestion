import React, { useState, useMemo } from 'react';
import './CashFlowTable.css';

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

export default function CashFlowTable({ cashFlows, cashRegister, filters, onFilterChange }) {
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

  const getOperatorName = (flow) => {
    const op = flow.operatorId;
    if (!op) return '-';
    return op.first_name && op.last_name 
      ? `${op.first_name} ${op.last_name}`
      : op.username || '-';
  };

  // Filtrar movimientos
  const filteredFlows = useMemo(() => {
    let result = [...cashFlows];
    
    // ✅ NUEVO: Filtrar por período (desde apertura o todo el día)
    if (filters.period === 'since_opening' && cashRegister?.openingDate) {
      const openingDate = new Date(cashRegister.openingDate).getTime();
      result = result.filter(f => new Date(f.date).getTime() >= openingDate);
    }
    
    if (filters.type) {
      result = result.filter(f => f.type === filters.type);
    }
    if (filters.paymentMethod) {
      result = result.filter(f => f.paymentMethod === filters.paymentMethod);
    }
    
    return result;
  }, [cashFlows, filters, cashRegister]);

  // Ordenar
  const sortedFlows = useMemo(() => {
    let sortableItems = [...filteredFlows];
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
          case 'amount':
            aValue = a.amount || 0;
            bValue = b.amount || 0;
            break;
          case 'method':
            aValue = a.paymentMethod;
            bValue = b.paymentMethod;
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
  }, [filteredFlows, sortConfig]);

  const clearFilters = () => {
    onFilterChange({ period: 'all', type: '', paymentMethod: '' });
  };

  const hasActiveFilters = filters.period || filters.type || filters.paymentMethod;

  return (
    <div className="cash-flow-container">
      <div className="cash-flow-header">
        <h2>Movimientos Totales del Día</h2>
        <span className="cash-flow-count">
          {sortedFlows.length} {sortedFlows.length === 1 ? 'movimiento' : 'movimientos'}
        </span>
      </div>

      {/* Filtros */}
      <div className="cash-flow-filters">
        <div className="cash-flow-filter-group">
          <label>Período</label>
          <select
            value={filters.period || 'all'}
            onChange={(e) => onFilterChange({ ...filters, period: e.target.value })}
          >
            <option value="all">Todo el día</option>
            <option value="since_opening">Desde apertura de caja</option>
          </select>
        </div>

        <div className="cash-flow-filter-group">
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

        <div className="cash-flow-filter-group">
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

        {hasActiveFilters && (
          <button className="cash-flow-clear-filters" onClick={clearFilters}>
            ✕ Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla */}
      {sortedFlows.length === 0 ? (
        <div className="cash-flow-empty">
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
          <p>No hay movimientos registrados</p>
        </div>
      ) : (
        <div className="cash-flow-table-wrapper">
          <table className="cash-flow-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('date')} style={{ width: '160px' }}>
                  Fecha/Hora {getSortIcon('date')}
                </th>
                <th className="sortable" onClick={() => handleSort('type')} style={{ width: '100px' }}>
                  Tipo {getSortIcon('type')}
                </th>
                <th className="sortable" onClick={() => handleSort('concept')}>
                  Concepto {getSortIcon('concept')}
                </th>
                <th className="sortable" onClick={() => handleSort('method')} style={{ width: '130px' }}>
                  Método {getSortIcon('method')}
                </th>
                <th className="sortable" onClick={() => handleSort('amount')} style={{ textAlign: 'right', width: '140px' }}>
                  Monto {getSortIcon('amount')}
                </th>
                <th className="sortable" onClick={() => handleSort('operator')} style={{ width: '160px' }}>
                  Operador {getSortIcon('operator')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedFlows.map((flow) => (
                <tr key={flow._id} className={`flow-row-${flow.type.toLowerCase()}`}>
                  <td>{formatDate(flow.date)}</td>
                  <td>
                    <span className={`flow-type-badge ${flow.type.toLowerCase()}`}>
                      {typeLabels[flow.type]}
                    </span>
                  </td>
                  <td>
                    <div className="flow-concept">
                      <span className="flow-concept-main">{flow.concept}</span>
                      <span className="flow-concept-source">
                        {sourceTypeLabels[flow.sourceType] || flow.sourceType}
                      </span>
                    </div>
                  </td>
                  <td>{paymentMethodLabels[flow.paymentMethod] || flow.paymentMethod}</td>
                  <td className={`flow-amount ${flow.type.toLowerCase()}`}>
                    {flow.type === 'INCOME' ? '+' : '-'}${formatCurrency(flow.amount)}
                  </td>
                  <td>{getOperatorName(flow)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
