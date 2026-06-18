import React, { useState, useMemo } from 'react';
import './DiscountRulesTable.css';

const AGE_RANGE_LABELS = {
  '0-2': '0-2 años',
  '3-5': '3-5 años',
  '6-8': '6-8 años',
  '9-12': '9-12 años',
  '13+': '13+ años'
};

export default function DiscountRulesTable({ rules, loading, onView, onEdit, onDelete, onToggleActive }) {
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

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

  const sortedRules = useMemo(() => {
    let sortableItems = [...rules];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;
        switch (sortConfig.key) {
          case 'name':
            aValue = a.name?.toLowerCase() || '';
            bValue = b.name?.toLowerCase() || '';
            break;
          case 'percentage':
            aValue = a.percentage || 0;
            bValue = b.percentage || 0;
            break;
          case 'active':
            aValue = a.active ? 1 : 0;
            bValue = b.active ? 1 : 0;
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
  }, [rules, sortConfig]);

  if (loading) {
    return (
      <div className="rules-table-loading">
        <div className="rules-table-spinner"></div>
        <span>Cargando reglas...</span>
      </div>
    );
  }

  if (sortedRules.length === 0) {
    return (
      <div className="rules-table-empty">
        <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>No hay reglas de descuento registradas</p>
      </div>
    );
  }

  return (
    <div className="rules-table-container">
      <table className="rules-table">
        <thead>
          <tr>
            <th style={{ width: '50px' }}>#</th>
            <th className="sortable" onClick={() => handleSort('name')}>
              Nombre {getSortIcon('name')}
            </th>
            <th style={{ width: '350px' }}>Condiciones</th>
            <th className="sortable text-center" onClick={() => handleSort('percentage')} style={{ width: '160px' }}>
              Descuento % {getSortIcon('percentage')}
            </th>
            <th className="sortable text-center" onClick={() => handleSort('active')} style={{ width: '120px' }}>
              Estado {getSortIcon('active')}
            </th>
            <th className="text-center" style={{ width: '180px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedRules.map((rule, index) => {
            const c = rule.conditions || {};
            return (
              <tr key={rule._id}>
                <td>{index + 1}</td>
                <td>
                  <span className="rule-name">{rule.name}</span>
                </td>
                <td>
                  <div className="rule-conditions-badges">
                    {/* Filtros de identidad */}
                    {c.productIds?.length > 0 && (
                      <span className="condition-badge identity">
                        📦 {c.productIds.length} productos
                      </span>
                    )}
                    {c.brands?.length > 0 && (
                      <span className="condition-badge brand">
                        🏷️ {c.brands.join(', ')}
                      </span>
                    )}
                    {c.supplierIds?.length > 0 && (
                      <span className="condition-badge supplier">
                        🚚 {c.supplierIds.length} proveedores
                      </span>
                    )}
                    {c.ageRanges?.length > 0 && (
                      <span className="condition-badge age">
                        👶 {c.ageRanges.map(r => AGE_RANGE_LABELS[r] || r).join(', ')}
                      </span>
                    )}
                    
                    {/* Filtros de estado */}
                    {(c.minMonthsWithoutSale != null || c.maxMonthsWithoutSale != null) && (
                      <span className="condition-badge state">
                        ⏱️ {c.minMonthsWithoutSale ?? 0}-{c.maxMonthsWithoutSale ?? '∞'} meses sin venta
                      </span>
                    )}
                    {(c.minStockQuantity != null || c.maxStockQuantity != null) && (
                      <span className="condition-badge state">
                        📊 {c.minStockQuantity ?? 0}-{c.maxStockQuantity ?? '∞'} uds
                      </span>
                    )}
                    {(c.minMonthsInStock != null || c.maxMonthsInStock != null) && (
                      <span className="condition-badge state">
                        📅 {c.minMonthsInStock ?? 0}-{c.maxMonthsInStock ?? '∞'} meses en stock
                      </span>
                    )}
                  </div>
                </td>
                <td className="text-center">
                  <span className="rule-percentage">{rule.percentage}%</span>
                </td>
                <td className="text-center">
                  <button
                    className={`status-toggle ${rule.active ? 'active' : 'inactive'}`}
                    onClick={() => onToggleActive(rule)}
                    title={rule.active ? 'Click para desactivar' : 'Click para activar'}
                  >
                    {rule.active ? 'Activa' : 'Inactiva'}
                  </button>
                </td>
                <td className="text-center">
                  <div className="rules-table-actions">
                    <button
                      className="rules-action-btn view"
                      onClick={() => onView(rule)}
                      title="Ver detalle"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button
                      className="rules-action-btn edit"
                      onClick={() => onEdit(rule)}
                      title="Editar regla"
                    >
                      ✏️
                    </button>
                    <button
                      className="rules-action-btn delete"
                      onClick={() => onDelete(rule)}
                      title="Eliminar regla"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}