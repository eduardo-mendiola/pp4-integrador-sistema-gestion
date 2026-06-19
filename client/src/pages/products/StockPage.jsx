import React from 'react';
import CrudModule from '../../components/CrudModule.jsx';

const config = {
  title: 'Stock',
  description: 'Gestión de inventario y stock de productos.',
  endpoint: '/api/products',
  initialValues: {
    name: '',
    sku: '',
    stock: '',
    min_stock_alert: '',
  },
  fields: [
    { name: 'name', label: 'Producto', type: 'text', required: true },
    { name: 'sku', label: 'SKU', type: 'text' },
    { name: 'stock', label: 'Cantidad en Stock', type: 'number', required: true },
    { name: 'min_stock_alert', label: 'Alerta Stock Mínimo', type: 'number' },
  ],
  transformPayload: (form) => ({
    name: form.name,
    sku: form.sku,
    stock: Number(form.stock || 0),
    min_stock_alert: Number(form.min_stock_alert || 0),
  }),
  mapItemToForm: (item) => ({
    name: item.name || '',
    sku: item.sku || '',
    stock: item.stock ?? '',
    min_stock_alert: item.min_stock_alert ?? '',
  }),
  columns: [
    { label: 'Producto', value: (item) => item.name || '-' },
    { label: 'SKU', value: (item) => item.sku || '-' },
    { label: 'Stock Actual', value: (item) => item.stock ?? 0 },
    { label: 'Alerta Stock Mínimo', value: (item) => item.min_stock_alert ?? 0 },
  ]
};

export default function StockPage() {
  return <CrudModule config={config} />;
}
