import React from 'react';
import './MovementReceiptModal.css';

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

export default function MovementReceiptModal({ movement, onClose }) {
  if (!movement) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-AR');
  };

  const getOperatorName = () => {
    if (!movement.operatorId) return '-';
    return `${movement.operatorId.first_name || ''} ${movement.operatorId.last_name || ''}`.trim() || movement.operatorId.username || '-';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="movement-receipt-overlay" onClick={onClose}>
      <div className="movement-receipt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="movement-receipt-header no-print">
          <div className="movement-receipt-header-actions">
            <button className="movement-receipt-btn print" onClick={handlePrint}>
              🖨️ Imprimir
            </button>
            <button className="movement-receipt-btn close" onClick={onClose}>
              ✕ Cerrar
            </button>
          </div>
        </div>

        <div className="movement-receipt-ticket">
          <div className="movement-receipt-ticket-header">
            <h1 className="movement-receipt-store-name">PLANETA JUGUETES</h1>
            <p className="movement-receipt-store-info">Av. Siempre Viva 123</p>
            <p className="movement-receipt-store-info">Tel: (011) 4567-8900</p>
            <p className="movement-receipt-store-info">CUIT: 30-12345678-9</p>
            <div className="movement-receipt-divider"></div>
            <h2 className="movement-receipt-title">COMPROBANTE DE MOVIMIENTO</h2>
          </div>

          <div className="movement-receipt-section">
            <div className="movement-receipt-info-row">
              <span className="movement-receipt-label">Fecha:</span>
              <span className="movement-receipt-value">{formatDate(movement.date)}</span>
            </div>
            <div className="movement-receipt-info-row">
              <span className="movement-receipt-label">Tipo:</span>
              <span className="movement-receipt-value">{typeLabels[movement.type]}</span>
            </div>
            <div className="movement-receipt-info-row">
              <span className="movement-receipt-label">Concepto:</span>
              <span className="movement-receipt-value">{movement.concept}</span>
            </div>
            <div className="movement-receipt-info-row">
              <span className="movement-receipt-label">Origen:</span>
              <span className="movement-receipt-value">{sourceTypeLabels[movement.sourceType] || movement.sourceType}</span>
            </div>
            <div className="movement-receipt-info-row">
              <span className="movement-receipt-label">Método de Pago:</span>
              <span className="movement-receipt-value">{paymentMethodLabels[movement.paymentMethod] || movement.paymentMethod}</span>
            </div>
            <div className="movement-receipt-info-row">
              <span className="movement-receipt-label">Operador:</span>
              <span className="movement-receipt-value">{getOperatorName()}</span>
            </div>
            {movement.notes && (
              <div className="movement-receipt-info-row">
                <span className="movement-receipt-label">Notas:</span>
                <span className="movement-receipt-value">{movement.notes}</span>
              </div>
            )}
          </div>

          <div className="movement-receipt-divider"></div>

          <div className="movement-receipt-amount">
            <div className={`movement-receipt-amount-value ${movement.type.toLowerCase()}`}>
              {movement.type === 'INCOME' ? '+' : '-'}${(movement.amount || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="movement-receipt-footer">
            <div className="movement-receipt-divider"></div>
            <p className="movement-receipt-thank-you">Comprobante generado el {new Date().toLocaleString('es-AR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}