import React from 'react';
import './ReportSelector.css';

const reportTypes = [
  {
    key: 'cash-closing',
    icon: '💰',
    title: 'Cierre de Caja',
    description: 'Resumen de apertura y cierre de caja con ingresos, egresos y diferencia.',
    color: '#43a258'
  },
  {
    key: 'sales',
    icon: '🛒',
    title: 'Ventas por Período',
    description: 'Listado completo de ventas entre fechas con totales y métodos de pago.',
    color: '#007bff'
  },
  {
    key: 'movements',
    icon: '📊',
    title: 'Movimientos de Caja',
    description: 'Todos los movimientos de caja (ingresos y egresos) en el período.',
    color: '#6f42c1'
  },
  {
    key: 'top-products',
    icon: '🏆',
    title: 'Productos Más Vendidos',
    description: 'Ranking de productos con mayor cantidad vendida e ingresos generados.',
    color: '#fd7e14'
  },
  {
    key: 'returns',
    icon: '↩️',
    title: 'Devoluciones y Cambios',
    description: 'Reporte de devoluciones procesadas con motivos y montos.',
    color: '#dc4655'
  }
];

export default function ReportSelector({ onSelect }) {
  return (
    <div className="report-selector">
      <div className="report-selector-header">
        <h2>Seleccioná un tipo de reporte</h2>
        <p>Elegí el tipo de reporte que querés generar y luego configurá los filtros.</p>
      </div>

      <div className="report-cards-grid">
        {reportTypes.map(report => (
          <div 
            key={report.key} 
            className="report-card"
            onClick={() => onSelect(report.key)}
            style={{ '--card-color': report.color }}
          >
            <div className="report-card-icon">{report.icon}</div>
            <div className="report-card-content">
              <h3>{report.title}</h3>
              <p>{report.description}</p>
            </div>
            <div className="report-card-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  );
}
