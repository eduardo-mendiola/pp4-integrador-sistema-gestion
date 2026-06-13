// Utilitario para imprimir comprobantes de venta
// Funciona con ventas en cualquier formato (nueva venta o venta del listado)

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

const getPaymentMethodLabel = (sale) => {
  // Formato nuevo: array payments
  if (sale.payments && sale.payments.length > 0) {
    const method = sale.payments[0].method;
    if (typeof method === 'string') {
      const map = { 'cash': 'Efectivo', 'transfer': 'Transferencia', 'card': 'Tarjeta' };
      return map[method.toLowerCase()] || method;
    }
    if (method?.name) {
      const name = method.name.toLowerCase();
      if (name.includes('cash') || name.includes('efectivo')) return 'Efectivo';
      if (name.includes('crédito') || name.includes('credito')) return 'Tarjeta de Crédito';
      if (name.includes('débito') || name.includes('debito')) return 'Tarjeta de Débito';
      if (name.includes('transfer') || name.includes('transferencia')) return 'Transferencia';
      return method.name;
    }
  }
  
  // Formato viejo: campo payment_method directo
  if (sale.payment_method) {
    const pm = sale.payment_method.toLowerCase();
    if (pm === 'cash' || pm === 'efectivo') return 'Efectivo';
    if (pm === 'card' || pm.includes('credito') || pm.includes('crédito')) return 'Tarjeta';
    if (pm === 'transfer' || pm === 'transferencia') return 'Transferencia';
    return sale.payment_method;
  }

  return '-';
};

const getClientName = (sale) => {
  return sale.customer_name || 
         sale.metadata?.customer_name || 
         sale.client_id?.business_name ||
         sale.client_id?.first_name ||
         'N/A';
};

const getProductName = (item) => {
  if (item.product && typeof item.product === 'object') {
    return item.product.name || 'Producto';
  }
  return item.name || 'Producto';
};

const formatCurrency = (value) => {
  return (value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
};

export const printSaleReceipt = (sale) => {
  if (!sale) {
    alert('No hay datos de venta para imprimir');
    return;
  }

  const isCancelled = sale.status === 'CANCELLED';
  const invoiceNumber = (sale._id || 'N/A').toString().slice(-8).toUpperCase();
  const paymentMethodLabel = getPaymentMethodLabel(sale);
  const clientName = getClientName(sale);
  const dateStr = formatDate(sale.createdAt || sale.created_at || sale.date || new Date());

  // Calcular subtotal si no viene
  const subtotal = sale.subtotal || 
    sale.items?.reduce((sum, i) => sum + ((i.price || 0) * (i.quantity || 1)), 0) || 0;

  // Generar HTML de items
  const itemsHTML = sale.items?.map((item) => `
    <div class="item">
      <span class="item-desc">${getProductName(item)}</span>
      <span class="item-qty">${item.quantity}</span>
      <span class="item-price">$${formatCurrency(item.price)}</span>
      <span class="item-total">$${formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
    </div>
  `).join('') || '<div class="item"><span>Sin items</span></div>';

  // Generar filas de pago (recibido/vuelto)
  const paymentRows = [];
  const paymentDetails = sale.metadata?.payment_details || sale.payment_data;
  
  if (paymentDetails?.amount_received) {
    paymentRows.push(`
      <div class="info-row">
        <span class="label">Recibido:</span>
        <span class="value">$${formatCurrency(paymentDetails.amount_received)}</span>
      </div>
    `);
  }
  if (paymentDetails?.change > 0) {
    paymentRows.push(`
      <div class="info-row">
        <span class="label">Vuelto:</span>
        <span class="value">$${formatCurrency(paymentDetails.change)}</span>
      </div>
    `);
  }

  // Banner de ANULADA si corresponde
  const cancelBanner = isCancelled ? `
    <div class="cancelled-banner">
      *** VENTA ANULADA ***
      ${sale.metadata?.cancel_reason ? `<div class="cancel-reason">Motivo: ${sale.metadata.cancel_reason}</div>` : ''}
    </div>
  ` : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Comprobante - ${invoiceNumber}</title>
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
        .cancelled-banner {
          text-align: center;
          font-size: 14pt;
          font-weight: bold;
          color: #dc3545;
          border: 3px double #dc3545;
          padding: 10px;
          margin: 10px 0;
          letter-spacing: 2px;
        }
        .cancel-reason {
          font-size: 9pt;
          color: #333;
          margin-top: 6px;
          font-weight: normal;
          letter-spacing: normal;
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

      ${cancelBanner}

      <div class="info-row">
        <span class="label">Fecha:</span>
        <span class="value">${dateStr}</span>
      </div>
      <div class="info-row">
        <span class="label">N° Venta:</span>
        <span class="value">${invoiceNumber}</span>
      </div>
      <div class="info-row">
        <span class="label">Cliente:</span>
        <span class="value">${clientName}</span>
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
        <span>$${formatCurrency(subtotal)}</span>
      </div>
      ${sale.discount > 0 ? `
      <div class="total-row">
        <span>Descuento:</span>
        <span>-$${formatCurrency(sale.discount)}</span>
      </div>
      ` : ''}
      ${sale.tax > 0 ? `
      <div class="total-row">
        <span>IVA (21%):</span>
        <span>$${formatCurrency(sale.tax)}</span>
      </div>
      ` : ''}
      <div class="total-row total-final">
        <span>TOTAL:</span>
        <span>$${formatCurrency(sale.total)}</span>
      </div>

      <div class="divider"></div>

      <div class="info-row">
        <span class="label">Método de pago:</span>
        <span class="value">${paymentMethodLabel}</span>
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

  const printWindow = window.open('', '_blank', 'width=400,height=600');
  
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.focus();
      // Pequeño delay para asegurar que el contenido esté renderizado
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  } else {
    alert('Por favor, permita las ventanas emergentes para imprimir el comprobante.');
  }
};