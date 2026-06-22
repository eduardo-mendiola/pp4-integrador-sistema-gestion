import React, { useRef } from 'react';
import { exportToCSV } from '../../../utils/exportToCSV';
import { exportToExcel } from '../../../utils/exportToExcel';
import { exportReportToPDF } from '../../../utils/exportReportToPDF';
import './MovementsReport.css';

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

export default function MovementsReport({ data }) {
  const reportRef = useRef(null);

  if (!data) return null;

  const { movements, totals, period } = data;

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

  const handleExportPDF = async () => {
    await exportReportToPDF(reportRef.current, 'reporte_movimientos');
  };

  const handleExportExcel = () => {
    const columns = [
      { key: 'date', label: 'Fecha' },
      { key: 'type', label: 'Tipo' },
      { key: 'concept', label: 'Concepto' },
      { key: 'sourceType', label: 'Origen' },
      { key: 'paymentMethod', label: 'Método Pago' },
      { key: 'amount', label: 'Monto' },
      { key: 'operator', label: 'Operador' }
    ];

    const exportData = movements.map(m => ({
      date: formatDate(m.date),
      type: typeLabels[m.type],
      concept: m.concept,
      sourceType: sourceTypeLabels[m.sourceType] || m.sourceType,
      paymentMethod: paymentMethodLabels[m.paymentMethod] || m.paymentMethod,
      amount: m.amount,
      operator: getOperatorName(m)
    }));

    exportToExcel(exportData, 'reporte_movimientos', 'Movimientos', columns);
  };

  const handleExportCSV = () => {
    const columns = [
      { key: 'date', label: 'Fecha' },
      { key: 'type', label: 'Tipo' },
      { key: 'concept', label: 'Concepto' },
      { key: 'sourceType', label: 'Origen' },
      { key: 'paymentMethod', label: 'Método Pago' },
      { key: 'amount', label: 'Monto' },
      { key: 'operator', label: 'Operador' }
    ];

    const exportData = movements.map(m => ({
      date: formatDate(m.date),
      type: typeLabels[m.type],
      concept: m.concept,
      sourceType: sourceTypeLabels[m.sourceType] || m.sourceType,
      paymentMethod: paymentMethodLabels[m.paymentMethod] || m.paymentMethod,
      amount: m.amount,
      operator: getOperatorName(m)
    }));

    exportToCSV(exportData, 'reporte_movimientos', columns);
  };

  return (
    <div className="movements-report">
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
          <h2 className="report-subtitle">Reporte de Movimientos de Caja</h2>
          <div className="report-period">
            <span>Período: {formatDate(period.from)} al {formatDate(period.to)}</span>
            <span>Generado: {new Date().toLocaleString('es-AR')}</span>
          </div>
        </div>

        {/* Resumen */}
        <div className="report-summary">
          <div className="summary-card">
            <div className="summary-label">Total Movimientos</div>
            <div className="summary-value">{totals.count}</div>
          </div>
          <div className="summary-card income">
            <div className="summary-label">Total Ingresos</div>
            <div className="summary-value">${formatCurrency(totals.totalIncomes)}</div>
          </div>
          <div className="summary-card expense">
            <div className="summary-label">Total Egresos</div>
            <div className="summary-value">${formatCurrency(totals.totalExpenses)}</div>
          </div>
          <div className="summary-card balance">
            <div className="summary-label">Balance</div>
            <div className="summary-value">${formatCurrency(totals.balance)}</div>
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
                </tr>
              </thead>
              <tbody>
                {Object.entries(totals.byPaymentMethod).map(([method, data]) => (
                  <tr key={method}>
                    <td>{paymentMethodLabels[method] || method}</td>
                    <td className="text-right">{data.count}</td>
                    <td className="text-right">${formatCurrency(data.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Desglose por origen */}
        {Object.keys(totals.bySourceType).length > 0 && (
          <div className="report-breakdown">
            <h3>Desglose por Origen</h3>
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th>Origen</th>
                  <th className="text-right">Cantidad</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(totals.bySourceType).map(([source, data]) => (
                  <tr key={source}>
                    <td>{sourceTypeLabels[source] || source}</td>
                    <td className="text-right">{data.count}</td>
                    <td className="text-right">${formatCurrency(data.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tabla de movimientos */}
        <div className="report-table-section">
          <h3>Detalle de Movimientos</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Concepto</th>
                <th>Origen</th>
                <th>Método</th>
                <th className="text-right">Monto</th>
                <th>Operador</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement, index) => (
                <tr key={movement._id || index}>
                  <td>{formatDate(movement.date)}</td>
                  <td>
                    <span className={`movement-type-badge ${movement.type.toLowerCase()}`}>
                      {typeLabels[movement.type]}
                    </span>
                  </td>
                  <td>{movement.concept}</td>
                  <td>{sourceTypeLabels[movement.sourceType] || movement.sourceType}</td>
                  <td>{paymentMethodLabels[movement.paymentMethod] || movement.paymentMethod}</td>
                  <td className={`text-right movement-amount ${movement.type.toLowerCase()}`}>
                    {movement.type === 'INCOME' ? '+' : '-'}${formatCurrency(movement.amount)}
                  </td>
                  <td>{getOperatorName(movement)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
