import React from 'react';
import CrudModule from '../../components/CrudModule.jsx';

const config = {
  title: 'Roles',
  description: 'Gestión de roles y permisos del sistema.',
  endpoint: '/api/roles',
  initialValues: {
    name: '',
    description: '',
    permissions: '[]',
  },
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'description', label: 'Descripción', type: 'textarea' },
    { name: 'permissions', label: 'Permisos (JSON)', type: 'textarea', required: true },
  ],
  transformPayload: (form) => ({
    name: form.name,
    description: form.description,
    permissions: form.permissions ? JSON.parse(form.permissions) : [],
  }),
  mapItemToForm: (item) => ({
    name: item.name || '',
    description: item.description || '',
    permissions: JSON.stringify(item.permissions || [], null, 2),
  }),
  columns: [
    { label: 'Nombre', value: (item) => item.name || '-' },
    { label: 'Descripción', value: (item) => item.description || '-' },
    { label: 'Permisos', value: (item) => (item.permissions || []).length },
  ]
};

export default function RolesPage() {
  return <CrudModule config={config} />;
}
