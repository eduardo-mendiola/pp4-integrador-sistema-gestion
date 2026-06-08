import React from 'react';
import CrudModule from '../../components/CrudModule.jsx';

const config = {
  title: 'Promociones',
  description: 'Gestión de promociones disponibles.',
  endpoint: '/api/promotions',
  initialValues: {
    name: '',
    description: '',
    discount_percentage: '',
    start_date: '',
    end_date: '',
  },
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'description', label: 'Descripción', type: 'textarea' },
    { name: 'discount_percentage', label: 'Descuento (%)', type: 'number', step: '0.01' },
    { name: 'start_date', label: 'Fecha inicio', type: 'datetime-local' },
    { name: 'end_date', label: 'Fecha fin', type: 'datetime-local' },
  ],
  transformPayload: (form) => ({
    name: form.name,
    description: form.description,
    discount_percentage: Number(form.discount_percentage || 0),
    start_date: form.start_date,
    end_date: form.end_date,
  }),
  mapItemToForm: (item) => ({
    name: item.name || '',
    description: item.description || '',
    discount_percentage: item.discount_percentage || '',
    start_date: item.start_date || '',
    end_date: item.end_date || '',
  }),
  columns: [
    { label: 'Nombre', value: (item) => item.name || '-' },
    { label: 'Descuento', value: (item) => `${item.discount_percentage || 0}%` },
    { label: 'Inicio', value: (item) => item.start_date ? new Date(item.start_date).toLocaleDateString() : '-' },
  ]
};

export default function PromocionsPage() {
  return <CrudModule config={config} />;
}
