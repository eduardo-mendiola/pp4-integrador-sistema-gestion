import React from 'react';
import CrudModule from '../../components/CrudModule.jsx';

const config = {
  title: 'Reglas de Descuento',
  description: 'Gestión de reglas de descuento automático.',
  endpoint: '/api/discount-rules',
  initialValues: {
    name: '',
    description: '',
    condition_type: '',
    condition_value: '',
    discount_percentage: '',
  },
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'description', label: 'Descripción', type: 'textarea' },
    { name: 'condition_type', label: 'Tipo de condición', type: 'text' },
    { name: 'condition_value', label: 'Valor de condición', type: 'text' },
    { name: 'discount_percentage', label: 'Descuento (%)', type: 'number', step: '0.01' },
  ],
  transformPayload: (form) => ({
    name: form.name,
    description: form.description,
    condition_type: form.condition_type,
    condition_value: form.condition_value,
    discount_percentage: Number(form.discount_percentage || 0),
  }),
  mapItemToForm: (item) => ({
    name: item.name || '',
    description: item.description || '',
    condition_type: item.condition_type || '',
    condition_value: item.condition_value || '',
    discount_percentage: item.discount_percentage || '',
  }),
  columns: [
    { label: 'Nombre', value: (item) => item.name || '-' },
    { label: 'Condición', value: (item) => item.condition_type || '-' },
    { label: 'Descuento', value: (item) => `${item.discount_percentage || 0}%` },
  ]
};

export default function DescuentosPage() {
  return <CrudModule config={config} />;
}
