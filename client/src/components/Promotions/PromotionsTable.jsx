import React, { useState, useMemo } from 'react';
import './PromotionsTable.css';

export default function PromotionsTable({ promotions, loading, onEdit, onDelete, onToggleActive }) {
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatus = (promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);
    
    if (!promotion.active) return { label: 'Inactiva', class: 'inactive' };
    if (now < start) return { label: 'Programada', class: 'scheduled' };
    if (now > end) return { label: 'Vencida', class: 'expired' };
    return { label: 'Activa', class: 'active' };
  };

  const sortedPromotions = useMemo(() => {
    let sortableItems = [...promotions];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortConfig.key) {
          case 'name':
            aValue = a.name?.toLowerCase() || '';
            bValue = b.name?.toLowerCase() || '';
            break;
          case 'product':
            aValue = a.productId?.name?.toLowerCase() || '';
            bValue = b.productId?.name?.toLowerCase() || '';
            break;
          case 'startDate':
            aValue = new Date(a.startDate).getTime();
            bValue = new Date(b.startDate).getTime();
            break;
          case 'endDate':
            aValue = new Date(a.endDate).getTime();
            bValue = new Date(b.endDate).getTime();
            break;
          case 'rules':
            aValue = a.discountRuleIds?.length || 0;
            bValue = b.discountRuleIds?.length || 0;
            break;
          case 'status':
            aValue = getStatus(a).label;
            bValue = getStatus(b).label;
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
  }, [promotions, sortConfig]);

  if (loading) {
    return (
      <div className="promotions-table-loading">
        <div className="promotions-table-spinner"></div>
        <span>Cargando promociones...</span>
      </div>
    );
  }

  if (sortedPromotions.length === 0) {
    return (
      <div className="promotions-table-empty">
        <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>No hay promociones registradas</p>
      </div>
    );
  }

  return (
    <div className="promotions-table-container">
      <table className="promotions-table">
        <thead>
          <tr>
            <th style={{ width: '50px' }}>#</th>
            <th className="sortable" onClick={() => handleSort('name')}>
              Nombre {getSortIcon('name')}
            </th>
            <th className="sortable" onClick={() => handleSort('product')}>
              Producto {getSortIcon('product')}
            </th>
            <th className="sortable" onClick={() => handleSort('startDate')} style={{ width: '140px' }}>
              Fecha Inicio {getSortIcon('startDate')}
            </th>
            <th className="sortable" onClick={() => handleSort('endDate')} style={{ width: '140px' }}>
              Fecha Fin {getSortIcon('endDate')}
            </th>
            <th className="sortable text-center" onClick={() => handleSort('rules')} style={{ width: '120px' }}>
              Reglas {getSortIcon('rules')}
            </th>
            <th className="sortable text-center" onClick={() => handleSort('status')} style={{ width: '130px' }}>
              Estado {getSortIcon('status')}
            </th>
            <th className="text-center" style={{ width: '150px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedPromotions.map((promo, index) => {
            const status = getStatus(promo);
            return (
              <tr key={promo._id}>
                <td>{index + 1}</td>
                <td>
                  <span className="promo-name">{promo.name}</span>
                </td>
                <td>
                  <span className="promo-product">{promo.productId?.name || '-'}</span>
                </td>
                <td>{formatDate(promo.startDate)}</td>
                <td>{formatDate(promo.endDate)}</td>
                <td className="text-center">
                  <span className="promo-rules-count">
                    {promo.discountRuleIds?.length || 0}
                  </span>
                </td>
                <td className="text-center">
                  <button
                    className={`status-toggle ${status.class}`}
                    onClick={() => onToggleActive(promo)}
                    title={promo.active ? 'Click para desactivar' : 'Click para activar'}
                  >
                    {status.label}
                  </button>
                </td>
                <td className="text-center">
                  <div className="promotions-table-actions">
                    <button
                      className="promotions-action-btn edit"
                      onClick={() => onEdit(promo)}
                      title="Editar promoción"
                    >
                      ✏️
                    </button>
                    <button
                      className="promotions-action-btn delete"
                      onClick={() => onDelete(promo)}
                      title="Eliminar promoción"
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