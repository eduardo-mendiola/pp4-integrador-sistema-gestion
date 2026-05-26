import React from 'react';
import CrudModule from '../../components/CrudModule.jsx';

const config = {
  title: 'Categorías',
  description: 'Catálogo simple de categorías.',
  endpoint: '/api/categories',
  useModal: true,
  initialValues: { name: '', description: '' },
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'description', label: 'Descripción', type: 'textarea' }
  ],
  columns: [
    { label: 'Nombre', value: (item) => item.name },
    { label: 'Descripción', value: (item) => item.description || '-' }
  ]
};

export default function CategoriesPage() {
  return <CrudModule config={config} />;
}