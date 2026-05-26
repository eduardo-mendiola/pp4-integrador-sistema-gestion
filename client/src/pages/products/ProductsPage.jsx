import React from 'react';
import CrudModule from '../../components/CrudModule.jsx';

const config = {
  title: 'Productos',
  description: 'Administración básica del inventario.',
  endpoint: '/api/products',
  useModal: true,
  singleTitle: 'Producto',
  lookups: [
    { key: 'categories', endpoint: '/api/categories' },
    { key: 'suppliers', endpoint: '/api/suppliers' }
  ],
  initialValues: {
    name: '',
    sku: '',
    category: '',
    supplier: '',
    age_range: '',
    price: '',
    stock: '',
    min_stock_alert: ''
  },
  mapItemToForm: (item) => ({
    name: item.name || '',
    sku: item.sku || '',
    category: item.category?._id || item.category || '',
    supplier: item.supplier?._id || item.supplier || '',
    age_range: item.age_range || '',
    price: item.price ?? '',
    stock: item.stock ?? '',
    min_stock_alert: item.min_stock_alert ?? ''
  }),
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'sku', label: 'SKU', type: 'text' },
    { name: 'category', label: 'Categoría', type: 'select', lookup: 'categories' },
    { name: 'supplier', label: 'Proveedor', type: 'select', lookup: 'suppliers' },
    { name: 'age_range', label: 'Rango de edad', type: 'text' },
    { name: 'price', label: 'Precio', type: 'number', step: '0.01' },
    { name: 'stock', label: 'Stock', type: 'number' },
    { name: 'min_stock_alert', label: 'Alerta mínima', type: 'number' }
  ],
  columns: [
    { label: 'Nombre', value: (item) => item.name },
    { label: 'SKU', value: (item) => item.sku || '-' },
    { label: 'Categoría', value: (item) => item.category?.name || '-' },
    { label: 'Proveedor', value: (item) => item.supplier?.name || '-' },
    { label: 'Precio', value: (item) => `$${Number(item.price || 0).toFixed(2)}` },
    { label: 'Stock', value: (item) => item.stock ?? 0 }
  ]
};

export default function ProductsPage() {
  return <CrudModule config={config} />;
}