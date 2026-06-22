import React from 'react';
import CrudModule from '../../components/CrudModule.jsx';

// Configuración específica para el módulo de ventas
const config = {
  title: 'Ventas',
  description: 'Registro básico de ventas con items en JSON.',
  endpoint: '/api/sales',
  useModal: true,
  initialValues: {
    customer_name: '',
    items_json: '[]',
    total: '',
    metadata: ''
  },
  fields: [
    { name: 'customer_name', label: 'Cliente', type: 'text' },
    { name: 'items_json', label: 'Items (JSON)', type: 'textarea' },
    { name: 'total', label: 'Total', type: 'number', step: '0.01' },
    { name: 'metadata', label: 'Metadata (JSON opcional)', type: 'textarea' }
  ],
  transformPayload: (form) => ({
    customer_name: form.customer_name,
    total: Number(form.total || 0),
    items: form.items_json ? JSON.parse(form.items_json) : [],
    metadata: form.metadata ? JSON.parse(form.metadata) : undefined
  }),
  mapItemToForm: (item) => ({
    customer_name: item.customer_name || '',
    items_json: JSON.stringify(item.items || [], null, 2),
    total: item.total ?? '',
    metadata: item.metadata ? JSON.stringify(item.metadata, null, 2) : ''
  }),
  columns: [
    { label: 'Cliente', value: (item) => item.customer_name || '-' },
    { label: 'Total', value: (item) => Number(item.total || 0).toFixed(2) },
    { label: 'Items', value: (item) => (item.items || []).length }
  ]
};

export default function SalesPage() {
  return <CrudModule config={config} />;
}