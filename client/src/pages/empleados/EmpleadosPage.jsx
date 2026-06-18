import React from 'react';
import CrudModule from '../../components/CrudModule.jsx';

const config = {
  title: 'Empleados',
  description: 'Gestión de empleados de la empresa.',
  endpoint: '/api/employees',
  initialValues: {
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
  },
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'email', label: 'Correo', type: 'email', required: true },
    { name: 'phone', label: 'Teléfono', type: 'tel' },
    { name: 'position', label: 'Puesto', type: 'text' },
    { name: 'department', label: 'Departamento', type: 'text' },
  ],
  transformPayload: (form) => ({
    name: form.name,
    email: form.email,
    phone: form.phone,
    position: form.position,
    department: form.department,
  }),
  mapItemToForm: (item) => ({
    name: item.name || '',
    email: item.email || '',
    phone: item.phone || '',
    position: item.position || '',
    department: item.department || '',
  }),
  columns: [
    { label: 'Nombre', value: (item) => item.name || '-' },
    { label: 'Correo', value: (item) => item.email || '-' },
    { label: 'Puesto', value: (item) => item.position || '-' },
    { label: 'Departamento', value: (item) => item.department || '-' },
  ]
};

export default function EmpleadosPage() {
  return <CrudModule config={config} />;
}
