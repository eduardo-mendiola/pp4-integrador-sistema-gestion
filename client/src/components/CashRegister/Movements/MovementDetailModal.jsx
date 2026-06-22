import React from 'react';
import './MovementDetailModal.css';

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

// Etiquetas para los tipos de origen
const sourceTypeLabels = {
  SALE: 'Venta',
  RETURN: 'Devolución',
  VOUCHER: 'Comprobante',
  MANUAL: 'Manual',
  OPENING: 'Apertura',
  CLOSING: 'Cierre'
};

export default function MovementDetailModal({ movement, onClose, onPrint, onDownload }) {
  if (!movement) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getOperatorName = () => {
    if (!movement.operatorId) return '-';
    const name = `${movement.operatorId.first_name || ''} ${movement.operatorId.last_name || ''}`.trim();
    return name || movement.operatorId.username || '-';
  };

  const getMovementId = () => {
    return (movement._id || '').slice(-8).toUpperCase();
  };

  return (
    <div className="movement-detail-overlay" onClick={onClose}>
      <div className="movement-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="movement-detail-header">
          <div>
            <h2>Detalle del Movimiento</h2>
            <span className="movement-detail-id">ID: {getMovementId()}</span>
          </div>
          <button className="movement-detail-close" onClick={onClose}>✕</button>
        </div>

        <div className="movement-detail-body">
          {/* Monto destacado */}
          <div className={`movement-detail-amount ${movement.type.toLowerCase()}`}>
            {movement.type === 'INCOME' ? '+' : '-'}${(movement.amount || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </div>

          {/* Información principal */}
          <div className="movement-detail-section">
            <h3 className="movement-detail-section-title">Información General</h3>
            
            <div className="movement-detail-row">
              <span className="movement-detail-label">Fecha y Hora</span>
              <span className="movement-detail-value">{formatDate(movement.date)}</span>
            </div>
            
            <div className="movement-detail-row">
              <span className="movement-detail-label">Tipo</span>
              <span className="movement-detail-value">
                <span className={`movement-detail-badge ${movement.type.toLowerCase()}`}>
                  {typeLabels[movement.type]}
                </span>
              </span>
            </div>
            
            <div className="movement-detail-row">
              <span className="movement-detail-label">Concepto</span>
              <span className="movement-detail-value">{movement.concept}</span>
            </div>
            
            <div className="movement-detail-row">
              <span className="movement-detail-label">Origen</span>
              <span className="movement-detail-value">
                {sourceTypeLabels[movement.sourceType] || movement.sourceType}
              </span>
            </div>
            
            <div className="movement-detail-row">
              <span className="movement-detail-label">Método de Pago</span>
              <span className="movement-detail-value">
                {paymentMethodLabels[movement.paymentMethod] || movement.paymentMethod}
              </span>
            </div>
            
            <div className="movement-detail-row">
              <span className="movement-detail-label">Operador</span>
              <span className="movement-detail-value">{getOperatorName()}</span>
            </div>
          </div>

          {/* Información adicional */}
          {(movement.notes || movement.sourceId || movement.cashRegisterId) && (
            <div className="movement-detail-section">
              <h3 className="movement-detail-section-title">Información Técnica</h3>
              
              {movement.sourceId && (
                <div className="movement-detail-row">
                  <span className="movement-detail-label">ID de Origen</span>
                  <span className="movement-detail-value mono">
                    {(movement.sourceId || '').toString().slice(-8).toUpperCase()}
                  </span>
                </div>
              )}
              
              {movement.cashRegisterId && (
                <div className="movement-detail-row">
                  <span className="movement-detail-label">ID de Caja</span>
                  <span className="movement-detail-value mono">
                    {(movement.cashRegisterId || '').toString().slice(-8).toUpperCase()}
                  </span>
                </div>
              )}
              
              {movement.notes && (
                <div className="movement-detail-row">
                  <span className="movement-detail-label">Notas</span>
                  <span className="movement-detail-value">{movement.notes}</span>
                </div>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="movement-detail-section">
            <h3 className="movement-detail-section-title">Timestamps</h3>
            
            <div className="movement-detail-row">
              <span className="movement-detail-label">Creado</span>
              <span className="movement-detail-value mono">
                {formatDate(movement.createdAt)}
              </span>
            </div>
            
            {movement.updatedAt && (
              <div className="movement-detail-row">
                <span className="movement-detail-label">Actualizado</span>
                <span className="movement-detail-value mono">
                  {formatDate(movement.updatedAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="movement-detail-footer">
          <button 
            className="movement-detail-btn secondary" 
            onClick={onClose}
          >
            Cerrar
          </button>
          {onDownload && (
            <button 
              className="movement-detail-btn download" 
              onClick={() => onDownload(movement)}
            >
              ⬇️ Descargar PDF
            </button>
          )}
          {onPrint && (
            <button 
              className="movement-detail-btn primary" 
              onClick={() => onPrint(movement)}
            >
              🖨️ Imprimir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}