import Counter from '../models/Counter.js';

// Genera un número de factura oficial e incrementa el contador
export async function invoiceNumberGenerator({
  key = 'invoice_number',
  prefix = 'FAC-',
  length = 6
} = {}) {
  const counter = await Counter.findByIdAndUpdate(
    key,
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true } 
  );

  const padded = String(counter.sequence_value).padStart(length, '0');
  return `${prefix}${padded}`;
}

// Función para obtener el próximo número de factura sin incrementarlo
export async function getNextInvoiceNumberPreview({
  key = 'invoice_number',
  prefix = 'FAC-',
  length = 6
} = {}) {
  const counter = await Counter.findById(key);
  const nextValue = (counter?.sequence_value || 0) + 1;
  return `${prefix}${String(nextValue).padStart(length, '0')}`;
}
