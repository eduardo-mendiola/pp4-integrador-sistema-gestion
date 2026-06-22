import React from 'react';
import { printSaleReceipt } from '../../../utils/printSaleReceipt.js';
import './ReceiptModal.css';

export default function ReceiptModal({ isOpen, sale, onNewSale, onClose }) {
  if (!isOpen || !sale) return null;

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

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: 'Efectivo',
      credit_card: 'Tarjeta de Crédito',
      debit_card: 'Tarjeta de Débito',
      transfer: 'Transferencia'
    };
    return labels[method] || method;
  };

  const handlePrint = () => {
    printSaleReceipt(sale);
  };

  return (
    <div className="receipt-overlay" onClick={onClose}>
      <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-header-actions no-print">
          <button className="receipt-btn print" onClick={handlePrint}>
            🖨️ Imprimir
          </button>
          <button className="receipt-btn new-sale" onClick={onNewSale}>
             Nueva Venta
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
            <h2 className="receipt-title">COMPROBANTE DE VENTA</h2>
          </div>

          <div className="receipt-section">
            <div className="receipt-info-row">
              <span className="receipt-label">Fecha:</span>
              <span className="receipt-value">{formatDate(sale.created_at || sale.date || new Date())}</span>
            </div>
            <div className="receipt-info-row">
              <span className="receipt-label">N° Venta:</span>
              <span className="receipt-value">{(sale._id || 'N/A').toString().slice(-8).toUpperCase()}</span>
            </div>
            <div className="receipt-info-row">
              <span className="receipt-label">Cliente:</span>
              <span className="receipt-value">{sale.customer_name || sale.metadata?.customer_name || 'N/A'}</span>
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
            
            {sale.items?.map((item, index) => (
              <div key={index} className="receipt-item">
                <span className="receipt-item-desc">{item.name || item.product?.name || 'Producto'}</span>
                <span className="receipt-item-qty">{item.quantity}</span>
                <span className="receipt-item-price">${(item.price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                <span className="receipt-item-total">${((item.price || 0) * (item.quantity || 1)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-totals">
            <div className="receipt-total-row">
              <span>Subtotal:</span>
              <span>${(sale.subtotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            {sale.discount > 0 && (
              <div className="receipt-total-row">
                <span>Descuento:</span>
                <span>-${(sale.discount || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="receipt-total-row">
              <span>IVA (21%):</span>
              <span>${(sale.tax || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="receipt-total-row receipt-total-final">
              <span>TOTAL:</span>
              <span>${(sale.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-payment">
            <div className="receipt-info-row">
              <span className="receipt-label">Método de pago:</span>
              <span className="receipt-value">{getPaymentMethodLabel(sale.payment_method)}</span>
            </div>
            {sale.payment_data?.amount_received && (
              <div className="receipt-info-row">
                <span className="receipt-label">Recibido:</span>
                <span className="receipt-value">${sale.payment_data.amount_received.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {sale.payment_data?.change > 0 && (
              <div className="receipt-info-row">
                <span className="receipt-label">Vuelto:</span>
                <span className="receipt-value">${sale.payment_data.change.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>

          <div className="receipt-footer">
            <div className="receipt-divider"></div>
            <p className="receipt-thank-you">¡Gracias por su compra!</p>
            <p className="receipt-barcode">||||| |||| ||||| |||| |||||</p>
          </div>
        </div>
      </div>
    </div>
  );
}
