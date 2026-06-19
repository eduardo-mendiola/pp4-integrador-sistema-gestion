import React, { useRef } from 'react';
import { exportToCSV } from '../../../utils/exportToCSV';
import { exportToExcel } from '../../../utils/exportToExcel';
import { exportReportToPDF } from '../../../utils/exportReportToPDF';
import './SalesReport.css';

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

const paymentMethodLabels = {
  cash: 'Efectivo',
  debit_card: 'Débito',
  credit_card: 'Crédito',
  transfer: 'Transferencia'
};

export default function SalesReport({ data }) {
  const reportRef = useRef(null);

  if (!data) return null;

  const { sales, totals, period } = data;

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

  const getClientName = (sale) => {
    return sale.customer_name || 
           sale.metadata?.customer_name || 
           sale.client_id?.business_name ||
           (sale.client_id?.first_name ? `${sale.client_id.first_name} ${sale.client_id.last_name || ''}`.trim() : null) ||
           '-';
  };

  const getPaymentMethodLabel = (sale) => {
    if (sale.payments && sale.payments.length > 0) {
      const method = sale.payments[0].method;
      if (typeof method === 'string') {
        return paymentMethodLabels[method.toLowerCase()] || method;
      }
      if (method?.name) {
        return method.name;
      }
    }
    return '-';
  };

  const getInvoiceNumber = (sale) => {
    return (sale._id || '').slice(-8).toUpperCase();
  };

  const handleExportPDF = async () => {
    await exportReportToPDF(reportRef.current, 'reporte_ventas');
  };

  const handleExportExcel = () => {
    const columns = [
      { key: 'invoice', label: 'N° Factura' },
      { key: 'date', label: 'Fecha' },
      { key: 'client', label: 'Cliente' },
      { key: 'items', label: 'Items' },
      { key: 'subtotal', label: 'Subtotal' },
      { key: 'discount', label: 'Descuento' },
      { key: 'tax', label: 'IVA' },
      { key: 'total', label: 'Total' },
      { key: 'paymentMethod', label: 'Método Pago' },
      { key: 'status', label: 'Estado' }
    ];

    const exportData = sales.map(s => ({
      invoice: getInvoiceNumber(s),
      date: formatDate(s.createdAt || s.created_at),
      client: getClientName(s),
      items: s.items?.length || 0,
      subtotal: s.subtotal || 0,
      discount: s.discount || 0,
      tax: s.tax || 0,
      total: s.total || 0,
      paymentMethod: getPaymentMethodLabel(s),
      status: statusLabels[s.status] || s.status
    }));

    exportToExcel(exportData, 'reporte_ventas', 'Ventas', columns);
  };

  const handleExportCSV = () => {
    const columns = [
      { key: 'invoice', label: 'N° Factura' },
      { key: 'date', label: 'Fecha' },
      { key: 'client', label: 'Cliente' },
      { key: 'items', label: 'Items' },
      { key: 'subtotal', label: 'Subtotal' },
      { key: 'discount', label: 'Descuento' },
      { key: 'tax', label: 'IVA' },
      { key: 'total', label: 'Total' },
      { key: 'paymentMethod', label: 'Método Pago' },
      { key: 'status', label: 'Estado' }
    ];

    const exportData = sales.map(s => ({
      invoice: getInvoiceNumber(s),
      date: formatDate(s.createdAt || s.created_at),
      client: getClientName(s),
      items: s.items?.length || 0,
      subtotal: s.subtotal || 0,
      discount: s.discount || 0,
      tax: s.tax || 0,
      total: s.total || 0,
      paymentMethod: getPaymentMethodLabel(s),
      status: statusLabels[s.status] || s.status
    }));

    exportToCSV(exportData, 'reporte_ventas', columns);
  };

  return (
    <div className="sales-report">
      {/* Botones de exportación */}
      <div className="report-actions">
        <button className="report-action-btn pdf" onClick={handleExportPDF}>
          📄 Descargar PDF
        </button>
        <button className="report-action-btn excel" onClick={handleExportExcel}>
          📊 Descargar Excel
        </button>
        <button className="report-action-btn csv" onClick={handleExportCSV}>
          📋 Descargar CSV
        </button>
      </div>

      {/* Contenido del reporte */}
      <div className="report-content" ref={reportRef}>
        {/* Encabezado */}
        <div className="report-header-section">
          <h1 className="report-title">PLANETA JUGUETES</h1>
          <h2 className="report-subtitle">Reporte de Ventas por Período</h2>
          <div className="report-period">
            <span>Período: {formatDate(period.from)} al {formatDate(period.to)}</span>
            <span>Generado: {new Date().toLocaleString('es-AR')}</span>
          </div>
        </div>

        {/* Resumen */}
        <div className="report-summary">
          <div className="summary-card">
            <div className="summary-label">Total Ventas</div>
            <div className="summary-value">{totals.count}</div>
          </div>
          <div className="summary-card income">
            <div className="summary-label">Total Facturado</div>
            <div className="summary-value">${formatCurrency(totals.totalAmount)}</div>
          </div>
          <div className="summary-card expense">
            <div className="summary-label">Total Descuentos</div>
            <div className="summary-value">${formatCurrency(totals.totalDiscount)}</div>
          </div>
          <div className="summary-card balance">
            <div className="summary-label">Total IVA</div>
            <div className="summary-value">${formatCurrency(totals.totalTax)}</div>
          </div>
        </div>

        {/* Desglose por método de pago */}
        {Object.keys(totals.byPaymentMethod).length > 0 && (
          <div className="report-breakdown">
            <h3>Desglose por Método de Pago</h3>
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th>Método</th>
                  <th className="text-right">Cantidad</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(totals.byPaymentMethod).map(([method, data]) => {
                  const percentage = totals.totalAmount > 0 
                    ? ((data.total / totals.totalAmount) * 100).toFixed(1)
                    : 0;
                  return (
                    <tr key={method}>
                      <td>{paymentMethodLabels[method] || method}</td>
                      <td className="text-right">{data.count}</td>
                      <td className="text-right">${formatCurrency(data.total)}</td>
                      <td className="text-right">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Desglose por estado */}
        {Object.keys(totals.byStatus).length > 0 && (
          <div className="report-breakdown">
            <h3>Desglose por Estado</h3>
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th className="text-right">Cantidad</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(totals.byStatus).map(([status, data]) => (
                  <tr key={status}>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ 
                          backgroundColor: statusColors[status] || '#6c757d',
                          color: status === 'PENDING' ? '#333' : 'white'
                        }}
                      >
                        {statusLabels[status] || status}
                      </span>
                    </td>
                    <td className="text-right">{data.count}</td>
                    <td className="text-right">${formatCurrency(data.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tabla de ventas */}
        <div className="report-table-section">
          <h3>Detalle de Ventas</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>N° Factura</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th className="text-center">Items</th>
                <th className="text-right">Subtotal</th>
                <th className="text-right">Desc.</th>
                <th className="text-right">IVA</th>
                <th className="text-right">Total</th>
                <th>Método</th>
                <th className="text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, index) => (
                <tr key={sale._id || index}>
                  <td>
                    <span className="invoice-number">
                      {getInvoiceNumber(sale)}
                    </span>
                  </td>
                  <td>{formatDate(sale.createdAt || sale.created_at)}</td>
                  <td>{getClientName(sale)}</td>
                  <td className="text-center">{sale.items?.length || 0}</td>
                  <td className="text-right">${formatCurrency(sale.subtotal)}</td>
                  <td className="text-right discount">
                    {sale.discount > 0 ? `-${formatCurrency(sale.discount)}` : '-'}
                  </td>
                  <td className="text-right">${formatCurrency(sale.tax)}</td>
                  <td className="text-right total">${formatCurrency(sale.total)}</td>
                  <td>{getPaymentMethodLabel(sale)}</td>
                  <td className="text-center">
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: statusColors[sale.status] || '#6c757d',
                        color: sale.status === 'PENDING' ? '#333' : 'white'
                      }}
                    >
                      {statusLabels[sale.status] || sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}