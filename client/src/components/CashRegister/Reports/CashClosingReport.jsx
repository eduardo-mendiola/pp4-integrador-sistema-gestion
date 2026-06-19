import React, { useRef } from 'react';
import { exportToCSV } from '../../../utils/exportToCSV';
import { exportToExcel } from '../../../utils/exportToExcel';
import { exportReportToPDF } from '../../../utils/exportReportToPDF';
import './CashClosingReport.css';

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

const typeLabels = {
  INCOME: 'Ingreso',
  EXPENSE: 'Egreso'
};

export default function CashClosingReport({ data }) {
  const reportRef = useRef(null);

  if (!data) return null;

  const { registers, totals, period } = data;

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
    await exportReportToPDF(reportRef.current, 'reporte_cierre_caja');
  };

  const handleExportExcel = () => {
    const columns = [
      { key: 'registerId', label: 'ID Caja' },
      { key: 'openingDate', label: 'Fecha Apertura' },
      { key: 'closingDate', label: 'Fecha Cierre' },
      { key: 'initialAmount', label: 'Monto Inicial' },
      { key: 'finalAmount', label: 'Monto Final' },
      { key: 'expectedAmount', label: 'Monto Esperado' },
      { key: 'difference', label: 'Diferencia' },
      { key: 'totalIncomes', label: 'Total Ingresos' },
      { key: 'totalExpenses', label: 'Total Egresos' },
      { key: 'balance', label: 'Balance' },
      { key: 'movementCount', label: 'Movimientos' }
    ];

    const exportData = registers.map(r => ({
      registerId: (r.registerId || '').slice(-8).toUpperCase(),
      openingDate: formatDate(r.openingDate),
      closingDate: r.closingDate ? formatDate(r.closingDate) : 'Abierta',
      initialAmount: r.initialAmount,
      finalAmount: r.finalAmount,
      expectedAmount: r.expectedAmount,
      difference: r.difference !== null ? r.difference : 'N/A',
      totalIncomes: r.totalIncomes,
      totalExpenses: r.totalExpenses,
      balance: r.balance,
      movementCount: r.movementCount
    }));

    exportToExcel(exportData, 'reporte_cierre_caja', 'Cierres', columns);
  };

  const handleExportCSV = () => {
    const columns = [
      { key: 'registerId', label: 'ID Caja' },
      { key: 'openingDate', label: 'Fecha Apertura' },
      { key: 'closingDate', label: 'Fecha Cierre' },
      { key: 'initialAmount', label: 'Monto Inicial' },
      { key: 'finalAmount', label: 'Monto Final' },
      { key: 'expectedAmount', label: 'Monto Esperado' },
      { key: 'difference', label: 'Diferencia' },
      { key: 'totalIncomes', label: 'Total Ingresos' },
      { key: 'totalExpenses', label: 'Total Egresos' },
      { key: 'balance', label: 'Balance' },
      { key: 'movementCount', label: 'Movimientos' }
    ];

    const exportData = registers.map(r => ({
      registerId: (r.registerId || '').slice(-8).toUpperCase(),
      openingDate: formatDate(r.openingDate),
      closingDate: r.closingDate ? formatDate(r.closingDate) : 'Abierta',
      initialAmount: r.initialAmount,
      finalAmount: r.finalAmount,
      expectedAmount: r.expectedAmount,
      difference: r.difference !== null ? r.difference : 'N/A',
      totalIncomes: r.totalIncomes,
      totalExpenses: r.totalExpenses,
      balance: r.balance,
      movementCount: r.movementCount
    }));

    exportToCSV(exportData, 'reporte_cierre_caja', columns);
  };

  return (
    <div className="cash-closing-report">
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
          <h2 className="report-subtitle">Reporte de Cierre de Caja</h2>
          <div className="report-period">
            <span>Período: {formatDate(period.from)} al {formatDate(period.to)}</span>
            <span>Generado: {new Date().toLocaleString('es-AR')}</span>
          </div>
        </div>

        {/* Resumen general */}
        <div className="report-summary">
          <div className="summary-card">
            <div className="summary-label">Cajas en el Período</div>
            <div className="summary-value">{totals.registerCount}</div>
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
            <div className="summary-label">Balance Total</div>
            <div className="summary-value">${formatCurrency(totals.totalBalance)}</div>
          </div>
        </div>

        {/* Detalle por caja */}
        {registers.map((register, index) => (
          <div key={register.registerId} className="register-detail">
            <div className="register-header">
              <h3>Caja #{index + 1}</h3>
              <span className="register-id">ID: {(register.registerId || '').slice(-8).toUpperCase()}</span>
            </div>

            <div className="register-info-grid">
              <div className="info-item">
                <span className="info-label">Apertura:</span>
                <span className="info-value">{formatDate(register.openingDate)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Cierre:</span>
                <span className="info-value">
                  {register.closingDate ? formatDate(register.closingDate) : 'Aún abierta'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Monto Inicial:</span>
                <span className="info-value">${formatCurrency(register.initialAmount)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Monto Final:</span>
                <span className="info-value">${formatCurrency(register.finalAmount)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Monto Esperado:</span>
                <span className="info-value">${formatCurrency(register.expectedAmount)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Diferencia:</span>
                <span className={`info-value ${register.difference > 0 ? 'positive' : register.difference < 0 ? 'negative' : ''}`}>
                  {register.difference !== null ? `$${formatCurrency(register.difference)}` : 'N/A'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Ingresos:</span>
                <span className="info-value income">${formatCurrency(register.totalIncomes)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Egresos:</span>
                <span className="info-value expense">${formatCurrency(register.totalExpenses)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Balance:</span>
                <span className="info-value">${formatCurrency(register.balance)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Movimientos:</span>
                <span className="info-value">{register.movementCount}</span>
              </div>
            </div>

            {/* Movimientos de esta caja */}
            {register.movements && register.movements.length > 0 && (
              <div className="register-movements">
                <h4>Movimientos ({register.movements.length})</h4>
                <table className="movements-table">
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
                    {register.movements.map((movement, mIndex) => (
                      <tr key={movement._id || mIndex}>
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
}