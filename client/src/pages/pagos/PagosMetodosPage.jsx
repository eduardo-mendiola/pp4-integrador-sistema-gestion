import React from 'react';
import CrudModule from '../../components/CrudModule.jsx';

const config = {
  title: 'Métodos de Pago',
  description: 'Gestión de métodos de pago disponibles.',
  endpoint: '/api/payment-methods',
  initialValues: {
    name: '',
    description: '',
    is_active: true,
  },
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'description', label: 'Descripción', type: 'textarea' },
    { name: 'is_active', label: 'Activo', type: 'checkbox' },
  ],
  transformPayload: (form) => ({
    name: form.name,
    description: form.description,
    is_active: form.is_active === true || form.is_active === 'true',
  }),
  mapItemToForm: (item) => ({
    name: item.name || '',
    description: item.description || '',
    is_active: item.is_active ?? true,
  }),
  columns: [
    { label: 'Nombre', value: (item) => item.name || '-' },
    { label: 'Estado', value: (item) => item.is_active ? '✓ Activo' : '✗ Inactivo' },
  ]
};

export default function PagosMetodosPage() {
  return <CrudModule config={config} />;
}
