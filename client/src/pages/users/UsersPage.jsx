import React from 'react';
import CrudModule from '../../components/CrudModule.jsx';

const config = {
  title: 'Usuarios',
  description: 'Administración de cuentas y roles.',
  endpoint: '/api/users',
  initialValues: {
    username: '',
    email: '',
    password: '',
    role_id: '',
    is_active: true
  },
  mapItemToForm: (item) => ({
    username: item.username || '',
    email: item.email || '',
    password: '',
    role_id: item.role_id?._id || item.role_id || '',
    is_active: Boolean(item.is_active)
  }),
  lookups: [{ key: 'roles', endpoint: '/api/roles' }],
  fields: [
    { name: 'username', label: 'Usuario', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Contraseña', type: 'password' },
    { name: 'role_id', label: 'Rol', type: 'select', lookup: 'roles' },
    { name: 'is_active', label: 'Activo', type: 'checkbox' }
  ],
  columns: [
    { label: 'Usuario', value: (item) => item.username },
    { label: 'Email', value: (item) => item.email },
    { label: 'Rol', value: (item) => item.role_id?.name || '-' },
    { label: 'Estado', value: (item) => (item.is_active ? 'Activo' : 'Inactivo') }
  ]
};

export default function UsersPage() {
  return <CrudModule config={config} />;
}