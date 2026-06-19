import React from 'react';
import CrudModule from '../../components/CrudModule.jsx';

const config = {
  title: 'Proveedores',
  description: 'Gestión de proveedores.',
  endpoint: '/api/suppliers',
  initialValues: {
    name: '',
    email: '',
    phone: '',
    address: '',
    contact_person: '',
  },
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'email', label: 'Correo', type: 'email' },
    { name: 'phone', label: 'Teléfono', type: 'tel' },
    { name: 'address', label: 'Dirección', type: 'text' },
    { name: 'contact_person', label: 'Persona de contacto', type: 'text' },
  ],
  transformPayload: (form) => ({
    name: form.name,
    email: form.email,
    phone: form.phone,
    address: form.address,
    contact_person: form.contact_person,
  }),
  mapItemToForm: (item) => ({
    name: item.name || '',
    email: item.email || '',
    phone: item.phone || '',
    address: item.address || '',
    contact_person: item.contact_person || '',
  }),
  columns: [
    { label: 'Nombre', value: (item) => item.name || '-' },
    { label: 'Correo', value: (item) => item.email || '-' },
    { label: 'Teléfono', value: (item) => item.phone || '-' },
    { label: 'Contacto', value: (item) => item.contact_person || '-' },
  ]
};

export default function ProveedoresPage() {
  return <CrudModule config={config} />;
}
