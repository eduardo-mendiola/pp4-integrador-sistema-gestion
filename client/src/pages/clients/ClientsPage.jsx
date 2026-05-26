import React from 'react';
import CrudModule from '../../components/CrudModule.jsx';

const config = {
  title: 'Clientes',
  description: 'Gestión mínima de clientes existentes.',
  endpoint: '/api/clients',
  useModal: true,
  initialValues: {
    client_type: 'company',
    name: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    website: '',
    category: '',
    company_type: '',
    is_active: true
  },
  fields: [
    {
      name: 'client_type',
      label: 'Tipo',
      type: 'select',
      options: [
        { value: 'company', label: 'Empresa' },
        { value: 'person', label: 'Persona' }
      ]
    },
    { name: 'name', label: 'Nombre empresa', type: 'text' },
    { name: 'first_name', label: 'Nombre', type: 'text' },
    { name: 'last_name', label: 'Apellido', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Teléfono', type: 'text' },
    { name: 'website', label: 'Sitio web', type: 'text' },
    { name: 'category', label: 'Categoría', type: 'text' },
    { name: 'company_type', label: 'Tipo de empresa', type: 'text' },
    { name: 'is_active', label: 'Activo', type: 'checkbox' }
  ],
  columns: [
    { label: 'Tipo', value: (item) => item.client_type },
    { label: 'Nombre', value: (item) => item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || '-' },
    { label: 'Email', value: (item) => item.email || '-' },
    { label: 'Teléfono', value: (item) => item.phone || '-' },
    { label: 'Estado', value: (item) => (item.is_active ? 'Activo' : 'Inactivo') }
  ]
};

export default function ClientsPage() {
  return <CrudModule config={config} />;
}