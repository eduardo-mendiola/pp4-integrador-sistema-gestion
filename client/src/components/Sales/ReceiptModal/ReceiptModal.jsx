import React, { useRef } from 'react';
import './ReceiptModal.css';

export default function ReceiptModal({ isOpen, sale, onNewSale, onClose }) {
  const receiptRef = useRef(null);

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

  // Generar HTML del ticket para impresión
  const generateTicketHTML = () => {
    const itemsHTML = sale.items?.map((item) => `
      <div class="item">
        <span class="item-desc">${item.name || item.product?.name || 'Producto'}</span>
        <span class="item-qty">${item.quantity}</span>
        <span class="item-price">$${(item.price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        <span class="item-total">$${((item.price || 0) * (item.quantity || 1)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
      </div>
    `).join('') || '<div class="item"><span>Sin items</span></div>';

    const paymentRows = [];
    if (sale.payment_data?.amount_received) {
      paymentRows.push(`
        <div class="info-row">
          <span class="label">Recibido:</span>
          <span class="value">$${sale.payment_data.amount_received.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        </div>
      `);
    }
    if (sale.payment_data?.change > 0) {
      paymentRows.push(`
        <div class="info-row">
          <span class="label">Vuelto:</span>
          <span class="value">$${sale.payment_data.change.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        </div>
      `);
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Comprobante - ${sale._id || 'Venta'}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 5mm;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 10pt;
            color: #000;
            width: 80mm;
            margin: 0 auto;
            padding: 5mm;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
          }
          .store-name {
            font-size: 14pt;
            font-weight: bold;
            letter-spacing: 1px;
            margin-bottom: 6px;
          }
          .store-info {
            font-size: 9pt;
            margin: 3px 0;
          }
          .title {
            font-size: 11pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 10px;
          }
          .divider {
            border-top: 2px dashed #000;
            margin: 8px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            font-size: 9pt;
          }
          .label {
            color: #333;
            font-weight: 600;
          }
          .value {
            font-weight: 700;
            text-align: right;
          }
          .items-header {
            display: flex;
            justify-content: space-between;
            padding-bottom: 4px;
            border-bottom: 1px solid #000;
            font-size: 8pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            border-bottom: 1px dotted #999;
            font-size: 9pt;
          }
          .item-desc {
            flex: 2;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .item-qty, .item-price, .item-total {
            flex: 0.5;
            text-align: right;
            font-weight: 600;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
            font-size: 9pt;
          }
          .total-final {
            font-size: 12pt;
            font-weight: bold;
            border-top: 2px solid #000;
            margin-top: 6px;
            padding-top: 6px;
          }
          .footer {
            text-align: center;
            margin-top: 12px;
          }
          .thank-you {
            font-size: 11pt;
            font-weight: bold;
            margin: 10px 0;
          }
          .barcode {
            font-size: 16pt;
            letter-spacing: 2px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="store-name">PLANETA JUGUETES</div>
          <div class="store-info">Av. Siempre Viva 123</div>
          <div class="store-info">Tel: (011) 4567-8900</div>
          <div class="store-info">CUIT: 30-12345678-9</div>
          <div class="divider"></div>
          <div class="title">COMPROBANTE DE VENTA</div>
        </div>

        <div class="info-row">
          <span class="label">Fecha:</span>
          <span class="value">${formatDate(sale.created_at || sale.date || new Date())}</span>
        </div>
        <div class="info-row">
          <span class="label">N° Venta:</span>
          <span class="value">${(sale._id || 'N/A').toString().slice(-8).toUpperCase()}</span>
        </div>
        <div class="info-row">
          <span class="label">Cliente:</span>
          <span class="value">${sale.customer_name || sale.metadata?.customer_name || 'N/A'}</span>
        </div>

        <div class="divider"></div>

        <div class="items-header">
          <span style="flex:2">Producto</span>
          <span style="flex:0.5;text-align:right">Cant</span>
          <span style="flex:0.5;text-align:right">Precio</span>
          <span style="flex:0.5;text-align:right">Total</span>
        </div>
        ${itemsHTML}

        <div class="divider"></div>

        <div class="total-row">
          <span>Subtotal:</span>
          <span>$${(sale.subtotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        </div>
        ${sale.discount > 0 ? `
        <div class="total-row">
          <span>Descuento:</span>
          <span>-$${(sale.discount || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        </div>
        ` : ''}
        <div class="total-row">
          <span>IVA (21%):</span>
          <span>$${(sale.tax || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="total-row total-final">
          <span>TOTAL:</span>
          <span>$${(sale.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        </div>

        <div class="divider"></div>

        <div class="info-row">
          <span class="label">Método de pago:</span>
          <span class="value">${getPaymentMethodLabel(sale.payment_method)}</span>
        </div>
        ${paymentRows.join('')}

        <div class="footer">
          <div class="divider"></div>
          <div class="thank-you">¡Gracias por su compra!</div>
          <div class="barcode">||||| |||| ||||| |||| |||||</div>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const html = generateTicketHTML();
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Esperar a que cargue y luego imprimir
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        // Cerrar automáticamente después de imprimir (opcional)
        // printWindow.onafterprint = () => printWindow.close();
      };
    } else {
      alert('Por favor, permita las ventanas emergentes para imprimir el comprobante.');
    }
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

        <div className="receipt-ticket" ref={receiptRef}>
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