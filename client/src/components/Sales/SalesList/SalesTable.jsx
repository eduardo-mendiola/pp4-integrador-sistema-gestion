import React, { useState, useMemo } from 'react';
import './SalesTable.css';

const statusLabels = {
  PAID: 'Pagada',
  PENDING: 'Pendiente',
  CANCELLED: 'Anulada'
};

const statusColors = {
  PAID: '#43a258',
  PENDING: '#fcc92e',
  CANCELLED: '#dc4655'
};

// Función auxiliar fuera del componente para que sea estable
const getPaymentMethodLabel = (sale) => {
  // 1. Formato nuevo: array payments
  if (sale.payments && sale.payments.length > 0) {
    const method = sale.payments[0].method;
    if (typeof method === 'string') {
      const map = { 'cash': 'Efectivo', 'transfer': 'Transferencia', 'card': 'Tarjeta' };
      return map[method.toLowerCase()] || method;
    }
    if (method?.name) {
      const name = method.name.toLowerCase();
      if (name.includes('cash') || name.includes('efectivo')) return 'Efectivo';
      if (name.includes('crédito') || name.includes('credito')) return 'Tarjeta de Crédito';
      if (name.includes('débito') || name.includes('debito')) return 'Tarjeta de Débito';
      if (name.includes('transfer') || name.includes('transferencia')) return 'Transferencia';
      return method.name;
    }
  }
  
  // 2. Formato viejo: campo payment_method directo
  if (sale.payment_method) {
    const pm = sale.payment_method.toLowerCase();
    if (pm === 'cash' || pm === 'efectivo') return 'Efectivo';
    if (pm === 'card' || pm.includes('credito') || pm.includes('crédito')) return 'Tarjeta';
    if (pm === 'transfer' || pm === 'transferencia') return 'Transferencia';
    return sale.payment_method;
  }

  return '-';
};

export default function SalesTable({ sales, loading, onViewSale, onCancelSale, onReprintSale }) {
  const [sortConfig, setSortConfig] = useState({ key: 'fecha', direction: 'desc' });

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

  const getInvoiceNumber = (sale) => {
    return (sale._id || '').slice(-8).toUpperCase();
  };

  const canCancel = (sale) => sale.status === 'PAID' || sale.status === 'PENDING';

  // Lógica de ordenamiento
  const sortedSales = useMemo(() => {
    let sortableItems = [...sales];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortConfig.key) {
          case 'factura':
            aValue = getInvoiceNumber(a);
            bValue = getInvoiceNumber(b);
            break;
          case 'fecha':
            aValue = new Date(a.createdAt || a.created_at).getTime();
            bValue = new Date(b.createdAt || b.created_at).getTime();
            break;
          case 'cliente':
            aValue = getClientName(a).toLowerCase();
            bValue = getClientName(b).toLowerCase();
            break;
          case 'items':
            aValue = a.items?.length || 0;
            bValue = b.items?.length || 0;
            break;
          case 'total':
            aValue = a.total || 0;
            bValue = b.total || 0;
            break;
          case 'metodo':
            aValue = getPaymentMethodLabel(a).toLowerCase();
            bValue = getPaymentMethodLabel(b).toLowerCase();
            break;
          case 'estado':
            aValue = a.status || '';
            bValue = b.status || '';
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
  }, [sales, sortConfig]);

  if (loading) {
    return (
      <div className="sales-table-loading">
        <div className="sales-table-spinner"></div>
        <span>Cargando ventas...</span>
      </div>
    );
  }

  if (sortedSales.length === 0) {
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
            <th style={{ width: '50px' }}>#</th>
            <th className="sortable" onClick={() => handleSort('factura')} style={{ width: '160px' }}>
              N° Factura {getSortIcon('factura')}
            </th>
            <th className="sortable" onClick={() => handleSort('fecha')}>
              Fecha {getSortIcon('fecha')}
            </th>
            <th className="sortable" onClick={() => handleSort('cliente')}>
              Cliente {getSortIcon('cliente')}
            </th>
            <th className="sortable" onClick={() => handleSort('items')} style={{ textAlign: 'center', width: '105px' }}>
              Items {getSortIcon('items')}
            </th>
            <th className="sortable" onClick={() => handleSort('total')} style={{ textAlign: 'right' }}>
              Total {getSortIcon('total')}
            </th>
            <th className="sortable" onClick={() => handleSort('metodo')}>
              Método de Pago {getSortIcon('metodo')}
            </th>
            <th className="sortable" onClick={() => handleSort('estado')} style={{ textAlign: 'center', width: '120px' }}>
              Estado {getSortIcon('estado')}
            </th>
            <th className="text-center" style={{ width: '120px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedSales.map((sale, index) => (
            <tr key={sale._id || index}>
              <td>{index + 1}</td>
              <td>
                <span className="sales-invoice-number">
                  {getInvoiceNumber(sale)}
                </span>
              </td>
              <td>{formatDate(sale.createdAt || sale.created_at)}</td>
              <td>{getClientName(sale)}</td>
              <td style={{ textAlign: 'center' }}>{sale.items?.length || 0}</td>
              <td className="sales-table-total" style={{ textAlign: 'right' }}>
                ${(sale.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </td>
              <td>{getPaymentMethodLabel(sale)}</td>
              <td style={{ textAlign: 'center' }}>
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
                <div className="sales-table-actions">
                  <button 
                    className="sales-action-btn view"
                    onClick={() => onViewSale(sale)}
                    title="Ver detalles"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  {onReprintSale && (
                    <button 
                      className="sales-action-btn reprint"
                      onClick={() => onReprintSale(sale)}
                      title="Reimprimir comprobante"
                    >
                      🖨️
                    </button>
                  )}
                  {canCancel(sale) && onCancelSale && (
                    <button 
                      className="sales-action-btn cancel"
                      onClick={() => onCancelSale(sale)}
                      title="Anular venta"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}