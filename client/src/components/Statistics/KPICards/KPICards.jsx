import React from 'react';
import './KPICards.css';

const formatCurrency = (value) => {
  return (value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
};

const formatVariation = (variation) => {
  if (variation === 0) return { text: '0%', className: 'neutral' };
  if (variation > 0) return { text: `+${variation.toFixed(1)}%`, className: 'positive' };
  return { text: `${variation.toFixed(1)}%`, className: 'negative' };
};

export default function KPICards({ kpis }) {
  if (!kpis) return null;

  const cards = [
    {
      title: 'Total Facturado',
      value: `$${formatCurrency(kpis.totalRevenue.current)}`,
      variation: kpis.totalRevenue.variation,
      subtitle: 'vs período anterior'
    },
    {
      title: 'Cantidad de Ventas',
      value: kpis.salesCount.current,
      variation: kpis.salesCount.variation,
      subtitle: 'vs período anterior'
    },
    {
      title: 'Ticket Promedio',
      value: `$${formatCurrency(kpis.averageTicket.current)}`,
      variation: kpis.averageTicket.variation,
      subtitle: 'vs período anterior'
    },
    {
      title: 'Unidades Vendidas',
      value: kpis.unitsSold.current,
      variation: null,
      subtitle: 'total unidades'
    },
    {
      title: 'Clientes Únicos',
      value: kpis.uniqueClients.current,
      variation: null,
      subtitle: 'clientes atendidos'
    }
  ];

  return (
    <div className="kpi-cards-container">
      {cards.map((card, index) => {
        const variationInfo = card.variation !== null ? formatVariation(card.variation) : null;
        
        return (
          <div key={index} className="kpi-card">
            <div className="kpi-card-header">
              <h3 className="kpi-card-title">{card.title}</h3>
            </div>
            <div className="kpi-card-body">
              <div className="kpi-card-value">{card.value}</div>
              <div className="kpi-card-footer">
                {variationInfo && (
                  <span className={`kpi-card-variation ${variationInfo.className}`}>
                    {variationInfo.text}
                  </span>
                )}
                <span className="kpi-card-subtitle">{card.subtitle}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}