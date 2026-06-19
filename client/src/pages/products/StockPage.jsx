import React from 'react';
import CrudModule from '../../components/CrudModule.jsx';

const config = {
  title: 'Stock',
  description: 'Gestión de inventario y stock de productos.',
  endpoint: '/api/stock',
  initialValues: {
    product_id: '',
    warehouse: '',
    quantity: '',
    minimum_quantity: '',
  },
  fields: [
    { name: 'product_id', label: 'Producto', type: 'text', required: true },
    { name: 'warehouse', label: 'Almacén', type: 'text' },
    { name: 'quantity', label: 'Cantidad', type: 'number', required: true },
    { name: 'minimum_quantity', label: 'Cantidad mínima', type: 'number' },
  ],
  transformPayload: (form) => ({
    product_id: form.product_id,
    warehouse: form.warehouse,
    quantity: Number(form.quantity || 0),
    minimum_quantity: Number(form.minimum_quantity || 0),
  }),
  mapItemToForm: (item) => ({
    product_id: item.product_id || '',
    warehouse: item.warehouse || '',
    quantity: item.quantity || '',
    minimum_quantity: item.minimum_quantity || '',
  }),
  columns: [
    { label: 'Producto', value: (item) => item.product_id || '-' },
    { label: 'Almacén', value: (item) => item.warehouse || '-' },
    { label: 'Cantidad', value: (item) => item.quantity || 0 },
    { label: 'Mínimo', value: (item) => item.minimum_quantity || 0 },
  ]
};

export default function StockPage() {
  return <CrudModule config={config} />;
}
