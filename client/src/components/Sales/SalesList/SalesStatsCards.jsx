import React from 'react';
import './SalesStatsCards.css';

export default function SalesStatsCards({ sales }) {
  const getTodaySales = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Fallback: si sales es undefined, usar array vacío
    return (sales || []).filter(sale => {
      const saleDate = new Date(sale.createdAt || sale.created_at);
      return saleDate >= today;
    });
  };

  const todaySales = getTodaySales();

  const totalVentasHoy = todaySales.length;
  
  const totalFacturadoHoy = todaySales
    .filter(s => s.status === 'PAID')
    .reduce((sum, s) => sum + (s.total || 0), 0);

  const ventasPendientes = (sales || []).filter(s => s.status === 'PENDING').length;

  const ticketPromedio = totalVentasHoy > 0 
    ? totalFacturadoHoy / totalVentasHoy 
    : 0;

  const formatCurrency = (value) => {
    return value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const stats = [
    {
      label: 'Ventas Hoy',
      value: totalVentasHoy,
      color: '#809bce',
      suffix: 'ventas'
    },
    {
      label: 'Facturado Hoy',
      value: `$${formatCurrency(totalFacturadoHoy)}`,
      color: '#95b8d1'
    },
    {
      label: 'Ticket Promedio',
      value: `$${formatCurrency(ticketPromedio)}`,
      color: '#b8e0d2'
    },
    {
      label: 'Ventas Pendientes',
      value: ventasPendientes,
      color: '#9cadce',
      suffix: 'pendientes'
    }
  ];

  return (
    <div className="sales-stats-grid">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="sales-stat-card"
          style={{ backgroundColor: stat.color }}
        >
          <div className="sales-stat-content">
            <div className="sales-stat-label">{stat.label}</div>
            <div className="sales-stat-value">
              {stat.value}
              {stat.suffix && <span className="sales-stat-suffix"> {stat.suffix}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
