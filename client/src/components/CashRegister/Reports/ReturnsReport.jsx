import React, { useRef } from 'react';
import { exportToCSV } from '../../../utils/exportToCSV';
import { exportToExcel } from '../../../utils/exportToExcel';
import { exportReportToPDF } from '../../../utils/exportReportToPDF';
import './ReturnsReport.css';

const typeLabels = {
  RETURN: 'Devolución',
  EXCHANGE_SAME: 'Cambio Mismo Producto',
  EXCHANGE_OTHER: 'Cambio Otro Producto'
};

const typeColors = {
  RETURN: '#dc4655',
  EXCHANGE_SAME: '#fcc92e',
  EXCHANGE_OTHER: '#17a2b8'
};

const reasonLabels = {
  defectuoso: 'Producto Defectuoso',
  no_gusta: 'No le gusta',
  talle_incorrecto: 'Talle Incorrecto',
  otro: 'Otro',
  arrepentimiento: 'Arrepentimiento'
};

export default function ReturnsReport({ data }) {
  const reportRef = useRef(null);

  if (!data) return null;

  const { returns, totals, period } = data;

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

  const getReasonLabel = (reason) => {
    return reasonLabels[reason] || reason || 'Sin motivo';
  };

  const handleExportPDF = async () => {
    await exportReportToPDF(reportRef.current, 'reporte_devoluciones');
  };

  const handleExportExcel = () => {
    const columns = [
      { key: 'date', label: 'Fecha' },
      { key: 'type', label: 'Tipo' },
      { key: 'reason', label: 'Motivo' },
      { key: 'items', label: 'Items' },
      { key: 'difference', label: 'Diferencia' },
      { key: 'originalSale', label: 'Venta Original' }
    ];

    const exportData = returns.map(r => ({
      date: formatDate(r.createdAt),
      type: typeLabels[r.type] || r.type,
      reason: getReasonLabel(r.reason),
      items: r.items?.length || 0,
      difference: r.difference ? Math.abs(r.difference) : 0,
      originalSale: r.original_sale_id?._id 
        ? (r.original_sale_id._id || '').slice(-8).toUpperCase()
        : '-'
    }));

    exportToExcel(exportData, 'reporte_devoluciones', 'Devoluciones', columns);
  };

  const handleExportCSV = () => {
    const columns = [
      { key: 'date', label: 'Fecha' },
      { key: 'type', label: 'Tipo' },
      { key: 'reason', label: 'Motivo' },
      { key: 'items', label: 'Items' },
      { key: 'difference', label: 'Diferencia' },
      { key: 'originalSale', label: 'Venta Original' }
    ];

    const exportData = returns.map(r => ({
      date: formatDate(r.createdAt),
      type: typeLabels[r.type] || r.type,
      reason: getReasonLabel(r.reason),
      items: r.items?.length || 0,
      difference: r.difference ? Math.abs(r.difference) : 0,
      originalSale: r.original_sale_id?._id 
        ? (r.original_sale_id._id || '').slice(-8).toUpperCase()
        : '-'
    }));

    exportToCSV(exportData, 'reporte_devoluciones', columns);
  };

  return (
    <div className="returns-report">
      {/* Botones de exportación */}
      <div className="report-actions">
        <button className="report-action-btn pdf" onClick={handleExportPDF}>
          Descargar PDF
        </button>
        <button className="report-action-btn excel" onClick={handleExportExcel}>
          Descargar Excel
        </button>
        <button className="report-action-btn csv" onClick={handleExportCSV}>
          Descargar CSV
        </button>
      </div>

      {/* Contenido del reporte */}
      <div className="report-content" ref={reportRef}>
        {/* Encabezado */}
        <div className="report-header-section">
          <h1 className="report-title">PLANETA JUGUETES</h1>
          <h2 className="report-subtitle">Reporte de Devoluciones y Cambios</h2>
          <div className="report-period">
            <span>Período: {formatDate(period.from)} al {formatDate(period.to)}</span>
            <span>Generado: {new Date().toLocaleString('es-AR')}</span>
          </div>
        </div>

        {/* Resumen */}
        <div className="report-summary">
          <div className="summary-card">
            <div className="summary-label">Total Operaciones</div>
            <div className="summary-value">{totals.count}</div>
          </div>
          <div className="summary-card expense">
            <div className="summary-label">Total Reembolsos</div>
            <div className="summary-value">${formatCurrency(totals.totalRefund)}</div>
          </div>
        </div>

        {/* Desglose por tipo */}
        {Object.keys(totals.byType).length > 0 && (
          <div className="report-breakdown">
            <h3>Desglose por Tipo</h3>
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th className="text-right">Cantidad</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(totals.byType).map(([type, data]) => {
                  const percentage = totals.count > 0 
                    ? ((data.count / totals.count) * 100).toFixed(1)
                    : 0;
                  return (
                    <tr key={type}>
                      <td>
                        <span 
                          className="type-badge"
                          style={{ 
                            backgroundColor: typeColors[type] || '#6c757d',
                            color: type === 'EXCHANGE_SAME' ? '#333' : 'white'
                          }}
                        >
                          {typeLabels[type] || type}
                        </span>
                      </td>
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

        {/* Desglose por motivo */}
        {Object.keys(totals.byReason).length > 0 && (
          <div className="report-breakdown">
            <h3>Desglose por Motivo</h3>
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th>Motivo</th>
                  <th className="text-right">Cantidad</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(totals.byReason).map(([reason, data]) => (
                  <tr key={reason}>
                    <td>{getReasonLabel(reason)}</td>
                    <td className="text-right">{data.count}</td>
                    <td className="text-right">${formatCurrency(data.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tabla de devoluciones */}
        <div className="report-table-section">
          <h3>Detalle de Devoluciones</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Motivo</th>
                <th className="text-center">Items</th>
                <th className="text-right">Diferencia</th>
                <th>Venta Original</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((returnItem, index) => (
                <tr key={returnItem._id || index}>
                  <td>{formatDate(returnItem.createdAt)}</td>
                  <td>
                    <span 
                      className="type-badge"
                      style={{ 
                        backgroundColor: typeColors[returnItem.type] || '#6c757d',
                        color: returnItem.type === 'EXCHANGE_SAME' ? '#333' : 'white'
                      }}
                    >
                      {typeLabels[returnItem.type] || returnItem.type}
                    </span>
                  </td>
                  <td>{getReasonLabel(returnItem.reason)}</td>
                  <td className="text-center">{returnItem.items?.length || 0}</td>
                  <td className="text-right amount">
                    ${formatCurrency(returnItem.difference ? Math.abs(returnItem.difference) : 0)}
                  </td>
                  <td>
                    <span className="invoice-number">
                      {returnItem.original_sale_id?._id 
                        ? (returnItem.original_sale_id._id || '').slice(-8).toUpperCase()
                        : '-'}
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