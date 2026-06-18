import React from 'react';
import './CashRegisterStatsCards.css';

export default function CashRegisterStatsCards({ cashRegister, dailySummary, lastClosedSummary }) {
  const isOpen = cashRegister?.status === 'OPEN';
  
  const formatCurrency = (value) => {
    return (value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Calcular saldo actual esperado
  const initialAmount = cashRegister?.initialAmount || 0;
  const totalIncomes = dailySummary?.totalIncomes || 0;
  const totalExpenses = dailySummary?.totalExpenses || 0;
  const expectedBalance = initialAmount + totalIncomes - totalExpenses;

  // Usar lastClosedSummary cuando la caja está cerrada
  const lastInitialAmount = lastClosedSummary?.initialAmount || 0;
  const lastTotalIncomes = lastClosedSummary?.totalIncomes || 0;
  const lastTotalExpenses = lastClosedSummary?.totalExpenses || 0;
  const lastCount = lastClosedSummary?.count || 0;

    const stats = isOpen ? [
    {
      label: 'Saldo Inicial',
      value: `$${formatCurrency(initialAmount)}`,
      color: '#6c757d',
    },
        {
      label: 'Ingresos del Día',
      value: `$${formatCurrency(totalIncomes)}`,
      color: '#529d85',
      suffix: `${dailySummary?.incomeCount || 0} mov.`
    },
    {
      label: 'Egresos del Día',
      value: `$${formatCurrency(totalExpenses)}`,
      color: '#df5757',
      suffix: `${dailySummary?.expenseCount || 0} mov.`
    },
    {
      label: 'Saldo Esperado',
      value: `$${formatCurrency(expectedBalance)}`,
      color: '#576cb0',
    }
  ] : [
    {
      label: 'Estado',
      value: 'CERRADA',
      color: '#6c757d',
    },
    {
      label: 'Último Monto Inicial',
      value: `$${formatCurrency(lastInitialAmount)}`,
      color: '#9ca3af',
    },
    {
      label: 'Últimos Movimientos',
      value: `$${formatCurrency(lastTotalIncomes + lastTotalExpenses)}`,
      color: '#9ca3af',
      suffix: `${lastCount} mov.`
    },
    {
      label: 'Último Balance',
      value: `$${formatCurrency(lastInitialAmount + lastTotalIncomes - lastTotalExpenses)}`,
      color: '#9ca3af',
    }
  ];

  return (
    <div className="cash-stats-grid">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="cash-stat-card"
          style={{ backgroundColor: stat.color }}
        >
          <div className="cash-stat-icon">{stat.icon}</div>
          <div className="cash-stat-content">
            <div className="cash-stat-label">{stat.label}</div>
            <div className="cash-stat-value">
              {stat.value}
              {stat.suffix && <span className="cash-stat-suffix"> {stat.suffix}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}