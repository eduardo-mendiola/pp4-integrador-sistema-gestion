import React from 'react';
import './SalesTable.css';

const statusLabels = {
  PAID: 'Pagada',
  PENDING: 'Pendiente',
  CANCELLED: 'Anulada'
};

const statusColors = {
  PAID: '#28a745',
  PENDING: '#ffc107',
  CANCELLED: '#dc3545'
};

export default function SalesTable({ sales, loading, onViewSale }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getClientName = (sale) => {
    return sale.customer_name || 
           sale.metadata?.customer_name || 
           sale.client_id?.business_name ||
           sale.client_id?.first_name ||
           '-';
  };

  const getPaymentMethodLabel = (sale) => {
    if (!sale.payments || sale.payments.length === 0) return '-';
    
    const method = sale.payments[0].method;
    if (typeof method === 'string') return method;
    if (method?.name) return method.name;
    return '-';
  };

  if (loading) {
    return (
      <div className="sales-table-loading">
        <div className="sales-table-spinner"></div>
        <span>Cargando ventas...</span>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="sales-table-empty">
        <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>No hay ventas registradas</p>
      </div>
    );
  }

  return (
    <div className="sales-table-container">
      <table className="sales-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Items</th>
            <th>Total</th>
            <th>Método de Pago</th>
            <th>Estado</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale, index) => (
            <tr key={sale._id || index}>
              <td>{index + 1}</td>
              <td>{formatDate(sale.createdAt || sale.created_at)}</td>
              <td>{getClientName(sale)}</td>
              <td>{sale.items?.length || 0}</td>
              <td className="sales-table-total">
                ${(sale.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </td>
              <td>{getPaymentMethodLabel(sale)}</td>
              <td>
                <span 
                  className="sales-table-status"
                  style={{ 
                    backgroundColor: statusColors[sale.status] || '#6c757d',
                    color: sale.status === 'PENDING' ? '#333' : 'white'
                  }}
                >
                  {statusLabels[sale.status] || sale.status}
                </span>
              </td>
              <td className="text-center">
                <button 
                  className="sales-table-view-btn"
                  onClick={() => onViewSale(sale)}
                  title="Ver detalles"
                >
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}