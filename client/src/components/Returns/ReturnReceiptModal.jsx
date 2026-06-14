import React from 'react';
import { printSaleReceipt } from '../../utils/printSaleReceipt.js';
import '../Sales/ReceiptModal/ReceiptModal.css'; 

export default function ReturnReceiptModal({ isOpen, data, onNewReturn, onClose }) {
  if (!isOpen || !data) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type) => {
    const labels = {
      'RETURN': 'COMPROBANTE DE DEVOLUCIÓN',
      'CREDIT_NOTE': 'NOTA DE CRÉDITO',
      'EXCHANGE_SAME': 'COMPROBANTE DE CAMBIO',
      'EXCHANGE_OTHER': 'COMPROBANTE DE CAMBIO'
    };
    return labels[type] || 'COMPROBANTE DE OPERACIÓN';
  };

  const handlePrint = () => {
    // Adaptamos los datos para que la función de impresión existente los entienda
    const mockSale = {
      _id: data._id,
      created_at: data.createdAt,
      customer_name: data.original_sale_id?.client_id?.business_name || data.original_sale_id?.client_id?.first_name || 'Cliente',
      items: data.items.map(i => ({
        name: i.product?.name || 'Producto',
        quantity: i.quantity,
        price: i.price,
        subtotal: i.subtotal
      })),
      subtotal: data.subtotal,
      discount: data.discount,
      tax: data.tax,
      total: data.total,
      payment_method: data.payment_method || 'cash',
      metadata: {
        customer_name: data.original_sale_id?.client_id?.business_name || 'Cliente',
        operation_type: getTypeLabel(data.type),
        original_sale_id: data.original_sale_id?._id
      }
    };
    printSaleReceipt(mockSale);
  };

  const originalSaleId = typeof data.metadata?.original_sale_id === 'object' 
    ? data.metadata.original_sale_id._id 
    : data.metadata?.original_sale_id;

  return (
    <div className="receipt-overlay" onClick={onClose}>
      <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-header-actions no-print">
          <button className="receipt-btn print" onClick={handlePrint}>
            🖨️ Imprimir
          </button>
          <button className="receipt-btn new-sale" onClick={onNewReturn}>
             Nueva Operación
          </button>
          <button className="receipt-btn close" onClick={onClose}>
            ✕ Cerrar
          </button>
        </div>

        <div className="receipt-ticket">
          <div className="receipt-ticket-header">
            <h1 className="receipt-store-name">PLANETA JUGUETES</h1>
            <p className="receipt-store-info">Av. Siempre Viva 123</p>
            <p className="receipt-store-info">Tel: (011) 4567-8900</p>
            <p className="receipt-store-info">CUIT: 30-12345678-9</p>
            <div className="receipt-divider"></div>
            <h2 className="receipt-title">{getTypeLabel(data.type)}</h2>
            {originalSaleId && (
              <p className="receipt-store-info" style={{marginTop: '8px', fontSize: '10pt'}}>
                Ref. Venta Original: {originalSaleId.toString().slice(-8).toUpperCase()}
              </p>
            )}
          </div>

          <div className="receipt-section">
            <div className="receipt-info-row">
              <span className="receipt-label">Fecha:</span>
              <span className="receipt-value">{formatDate(data.createdAt)}</span>
            </div>
            <div className="receipt-info-row">
              <span className="receipt-label">N° Operación:</span>
              <span className="receipt-value">{(data._id || 'N/A').toString().slice(-8).toUpperCase()}</span>
            </div>
            <div className="receipt-info-row">
              <span className="receipt-label">Motivo:</span>
              <span className="receipt-value">{data.reason}</span>
            </div>
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-items">
            <div className="receipt-items-header">
              <span className="receipt-item-desc">Producto</span>
              <span className="receipt-item-qty">Cant</span>
              <span className="receipt-item-price">Precio</span>
              <span className="receipt-item-total">Total</span>
            </div>
            
            {data.items?.map((item, index) => (
              <div key={index} className="receipt-item">
                <span className="receipt-item-desc">{item.product?.name || 'Producto'}</span>
                <span className="receipt-item-qty">{item.quantity}</span>
                <span className="receipt-item-price">${(item.price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                <span className="receipt-item-total">${(item.subtotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-totals">
            <div className="receipt-total-row">
              <span>Subtotal:</span>
              <span>${(data.subtotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            {data.discount > 0 && (
              <div className="receipt-total-row">
                <span>Crédito Aplicado:</span>
                <span>-${(data.discount || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="receipt-total-row">
              <span>IVA (21%):</span>
              <span>${(data.tax || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="receipt-total-row receipt-total-final">
              <span>TOTAL OPERACIÓN:</span>
              <span>${(data.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {data.difference !== 0 && (
            <>
              <div className="receipt-divider"></div>
              <div className="receipt-payment">
                <div className="receipt-info-row">
                  <span className="receipt-label">{data.difference > 0 ? 'Diferencia Pagada:' : 'Saldo a Favor:'}</span>
                  <span className="receipt-value">${Math.abs(data.difference || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </>
          )}

          <div className="receipt-footer">
            <div className="receipt-divider"></div>
            <p className="receipt-thank-you">¡Gracias por su confianza!</p>
            <p className="receipt-barcode">||||| |||| ||||| |||| |||||</p>
          </div>
        </div>
      </div>
    </div>
  );
}