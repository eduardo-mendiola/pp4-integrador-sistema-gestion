import React from 'react';
import './CashRegisterStatus.css';

export default function CashRegisterStatus({ cashRegister, dailySummary }) {
  if (!cashRegister) return null;

  const isOpen = cashRegister.status === 'OPEN';

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

  const getUserName = (user) => {
    if (!user) return '-';
    return user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}`
      : user.username || '-';
  };

  const formatCurrency = (value) => {
    return (value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
  };

  return (
    <div className="cash-status-panel">
      <div className="cash-status-header">
        <h2>Información de la Caja</h2>
        <span className={`cash-status-badge ${isOpen ? 'open' : 'closed'}`}>
          {isOpen ? '🟢 ABIERTA' : '🔴 CERRADA'}
        </span>
      </div>

      <div className="cash-status-grid">
        <div className="cash-status-field">
          <span className="cash-status-label">Nombre</span>
          <span className="cash-status-value">{cashRegister.name || 'Caja Principal'}</span>
        </div>

        {isOpen && (
          <>
            <div className="cash-status-field">
              <span className="cash-status-label">Fecha de Apertura</span>
              <span className="cash-status-value">{formatDate(cashRegister.openingDate)}</span>
            </div>

            <div className="cash-status-field">
              <span className="cash-status-label">Abierta por</span>
              <span className="cash-status-value">{getUserName(cashRegister.openedBy)}</span>
            </div>

            <div className="cash-status-field">
              <span className="cash-status-label">Monto Inicial</span>
              <span className="cash-status-value amount">
                ${formatCurrency(cashRegister.initialAmount)}
              </span>
            </div>

            {cashRegister.openingNotes && (
              <div className="cash-status-field full-width">
                <span className="cash-status-label">Notas de Apertura</span>
                <span className="cash-status-value notes">{cashRegister.openingNotes}</span>
              </div>
            )}
          </>
        )}

        {!isOpen && cashRegister.closingDate && (
          <>
            <div className="cash-status-field">
              <span className="cash-status-label">Último Cierre</span>
              <span className="cash-status-value">{formatDate(cashRegister.closingDate)}</span>
            </div>

            <div className="cash-status-field">
              <span className="cash-status-label">Cerrada por</span>
              <span className="cash-status-value">{getUserName(cashRegister.closedBy)}</span>
            </div>

            {cashRegister.difference !== null && cashRegister.difference !== undefined && (
              <div className="cash-status-field">
                <span className="cash-status-label">Diferencia Último Cierre</span>
                <span className={`cash-status-value difference ${cashRegister.difference === 0 ? 'zero' : cashRegister.difference > 0 ? 'positive' : 'negative'}`}>
                  {cashRegister.difference === 0 ? 'Sin diferencia' : 
                   `$${formatCurrency(Math.abs(cashRegister.difference))} ${cashRegister.difference > 0 ? '(Sobra)' : '(Falta)'}`}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
