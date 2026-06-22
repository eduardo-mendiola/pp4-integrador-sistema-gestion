import React, { useRef } from 'react';
import { exportToCSV } from '../../../utils/exportToCSV';
import { exportToExcel } from '../../../utils/exportToExcel';
import { exportReportToPDF } from '../../../utils/exportReportToPDF';
import './TopProductsReport.css';

export default function TopProductsReport({ data }) {
  const reportRef = useRef(null);

  if (!data) return null;

  const { products, totals, period } = data;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-AR');
  };

  const formatCurrency = (value) => {
    return (value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
  };

  const handleExportPDF = async () => {
    await exportReportToPDF(reportRef.current, 'reporte_productos_vendidos');
  };

  const handleExportExcel = () => {
    const columns = [
      { key: 'rank', label: 'Ranking' },
      { key: 'sku', label: 'SKU' },
      { key: 'name', label: 'Producto' },
      { key: 'totalQuantity', label: 'Cantidad Vendida' },
      { key: 'totalRevenue', label: 'Ingresos' },
      { key: 'appearances', label: 'Apariciones' }
    ];

    const exportData = products.map(p => ({
      rank: p.rank,
      sku: p.sku || '-',
      name: p.name,
      totalQuantity: p.totalQuantity,
      totalRevenue: p.totalRevenue,
      appearances: p.appearances
    }));

    exportToExcel(exportData, 'reporte_productos_vendidos', 'Productos', columns);
  };

  const handleExportCSV = () => {
    const columns = [
      { key: 'rank', label: 'Ranking' },
      { key: 'sku', label: 'SKU' },
      { key: 'name', label: 'Producto' },
      { key: 'totalQuantity', label: 'Cantidad Vendida' },
      { key: 'totalRevenue', label: 'Ingresos' },
      { key: 'appearances', label: 'Apariciones' }
    ];

    const exportData = products.map(p => ({
      rank: p.rank,
      sku: p.sku || '-',
      name: p.name,
      totalQuantity: p.totalQuantity,
      totalRevenue: p.totalRevenue,
      appearances: p.appearances
    }));

    exportToCSV(exportData, 'reporte_productos_vendidos', columns);
  };

  const getRankMedal = (rank) => {
    return `#${rank}`;
  };

  return (
    <div className="top-products-report">
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
          <h2 className="report-subtitle">Reporte de Productos Más Vendidos</h2>
          <div className="report-period">
            <span>Período: {formatDate(period.from)} al {formatDate(period.to)}</span>
            <span>Generado: {new Date().toLocaleString('es-AR')}</span>
          </div>
        </div>

        {/* Resumen */}
        <div className="report-summary">
          <div className="summary-card">
            <div className="summary-label">Productos Únicos</div>
            <div className="summary-value">{totals.uniqueProducts}</div>
          </div>
          <div className="summary-card income">
            <div className="summary-label">Unidades Vendidas</div>
            <div className="summary-value">{totals.totalQuantity}</div>
          </div>
          <div className="summary-card balance">
            <div className="summary-label">Ingresos Totales</div>
            <div className="summary-value">${formatCurrency(totals.totalRevenue)}</div>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="report-table-section">
          <h3>Ranking de Productos</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th className="text-center" style={{ width: '80px' }}>Ranking</th>
                <th style={{ width: '120px' }}>SKU</th>
                <th>Producto</th>
                <th className="text-center" style={{ width: '120px' }}>Cantidad</th>
                <th className="text-right" style={{ width: '150px' }}>Ingresos</th>
                <th className="text-center" style={{ width: '100px' }}>Apariciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.productId} className={product.rank <= 3 ? 'top-3' : ''}>
                  <td className="text-center">
                    <span className="rank-badge">
                      {getRankMedal(product.rank)}
                    </span>
                  </td>
                  <td>
                    <span className="product-sku">{product.sku || '-'}</span>
                  </td>
                  <td className="product-name">{product.name}</td>
                  <td className="text-center">
                    <span className="quantity-badge">{product.totalQuantity}</span>
                  </td>
                  <td className="text-right revenue">${formatCurrency(product.totalRevenue)}</td>
                  <td className="text-center">{product.appearances}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
