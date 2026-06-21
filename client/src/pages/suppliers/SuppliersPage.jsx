import React, { useEffect, useMemo, useRef, useState } from 'react';
import { apiRequest, unwrapList } from '../../services/api.js';
import { exportToCsv, slugify } from '../../utils/csvExport.js';
import SupplierFormModal from './SupplierFormModal.jsx';
import SupplierDetailModal from './SupplierDetailModal.jsx';
import { Permission } from '../../components/Permission';

const PAGE_SIZE = 10;

const STATUS_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'ACTIVO', label: 'Activos' },
  { key: 'SUSPENDIDO', label: 'Suspendidos' },
  { key: 'CANCELADO', label: 'Cancelados' }
];

const STATUS_META = {
  ACTIVO: { label: 'Activo', className: 'badge-success' },
  SUSPENDIDO: { label: 'Suspendido', className: 'badge-info' },
  CANCELADO: { label: 'Cancelado', className: 'badge-danger' }
};

const getStatus = (supplier) => supplier.status || 'ACTIVO';

const SUPPLIER_COLUMNS = [
  { header: 'NRO. DE PROVEEDOR', value: (supplier) => supplier.supplier_code || '-' },
  { header: 'NOMBRE', value: (supplier) => supplier.name || '-' },
  { header: 'NOMBRE DE CONTACTO', value: (supplier) => supplier.contact_name || '-' },
  { header: 'TELÉFONO', value: (supplier) => supplier.phone || '-' },
  { header: 'EMAIL', value: (supplier) => supplier.email || '-' },
  {
    header: 'ESTADO',
    value: (supplier) => (STATUS_META[getStatus(supplier)] || STATUS_META.ACTIVO).label
  }
];

function RowMenu({ supplier, onEdit, onDetail, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const runAction = (action) => {
    setOpen(false);
    action();
  };

  return (
    <div className="row-menu" ref={menuRef}>
      <button
        type="button"
        className="icon-button"
        aria-label="Acciones"
        onClick={() => setOpen((current) => !current)}
      >
        ⋮
      </button>
      {open ? (
        <div className="row-menu-dropdown">
          <button type="button" onClick={() => runAction(() => onDetail(supplier))}>
            Ver detalle
          </button>
          <Permission permission="edit_suppliers">
          <button type="button" onClick={() => runAction(() => onEdit(supplier))}>
            Editar
          </button>
          </Permission>
          <Permission permission="delete_suppliers">
          <button type="button" className="danger-text" onClick={() => runAction(() => onDelete(supplier))}>
            Borrar
          </button>
          </Permission>
        </div>
      ) : null}
    </div>
  );
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [formSupplier, setFormSupplier] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [detailSupplier, setDetailSupplier] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = await apiRequest('/api/suppliers');
      setSuppliers(unwrapList(payload));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const filteredSuppliers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      if (statusFilter !== 'all' && getStatus(supplier) !== statusFilter) {
        return false;
      }

      if (!term) {
        return true;
      }

      const haystack = [
        supplier.supplier_code,
        supplier.name,
        supplier.contact_name,
        supplier.email,
        supplier.phone
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [suppliers, search, statusFilter]);

  const total = filteredSuppliers.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filteredSuppliers.slice(startIndex, startIndex + PAGE_SIZE);
  const rangeFrom = total === 0 ? 0 : startIndex + 1;
  const rangeTo = Math.min(startIndex + PAGE_SIZE, total);

  const handleExport = () => {
    const statusLabel = STATUS_TABS.find((tab) => tab.key === statusFilter)?.label || 'todos';
    exportToCsv(`proveedores_${slugify(statusLabel)}`, filteredSuppliers, SUPPLIER_COLUMNS);
  };

  const openCreate = () => {
    setFormSupplier(null);
    setShowForm(true);
  };

  const openEdit = (supplier) => {
    setFormSupplier(supplier);
    setShowForm(true);
  };

  const handleSaved = async () => {
    setShowForm(false);
    setFormSupplier(null);
    await loadData();
  };

  const handleDelete = async (supplier) => {
    const id = supplier._id || supplier.id;
    const confirmed = window.confirm('¿Borrar este proveedor?');
    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(`/api/suppliers/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  if (loading) {
    return <div className="state-box">Cargando proveedores...</div>;
  }

  return (
    <section className="module-grid">
      <header className="section-header">
        <div>
          <p className="eyebrow">Módulo</p>
          <h2>Listado de proveedores</h2>
        </div>
        <Permission permission="create_suppliers">
        <button type="button" className="btn-with-icon" onClick={openCreate}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Nuevo Proveedor
        </button>
        </Permission>
      </header>

      <div className="panel">
        <div className="clients-toolbar">
          <div className="list-search">
            <input
              type="search"
              placeholder="Buscar proveedor..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <span className="search-icon" aria-hidden="true">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16.65" y2="16.65" />
              </svg>
            </span>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={handleExport}
            disabled={filteredSuppliers.length === 0}
          >
            Exportar a Excel
          </button>
        </div>

        <div className="filter-tabs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`filter-tab ${statusFilter === tab.key ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>NRO. DE PROVEEDOR</th>
                <th>NOMBRE</th>
                <th>NOMBRE DE CONTACTO</th>
                <th>TELÉFONO</th>
                <th>EMAIL</th>
                <th>ESTADO</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7}>No hay proveedores para mostrar.</td>
                </tr>
              ) : (
                pageItems.map((supplier) => {
                  const status = getStatus(supplier);
                  const meta = STATUS_META[status] || STATUS_META.ACTIVO;

                  return (
                    <tr key={supplier._id || supplier.id}>
                      <td>
                        <button
                          type="button"
                          className="code-link"
                          onClick={() => setDetailSupplier(supplier)}
                        >
                          {supplier.supplier_code || '-'}
                        </button>
                      </td>
                      <td>{supplier.name || '-'}</td>
                      <td>{supplier.contact_name || '-'}</td>
                      <td>{supplier.phone || '-'}</td>
                      <td>{supplier.email || '-'}</td>
                      <td>
                        <span className={`badge ${meta.className}`}>{meta.label}</span>
                      </td>
                      <td>
                        <RowMenu
                          supplier={supplier}
                          onEdit={openEdit}
                          onDetail={setDetailSupplier}
                          onDelete={handleDelete}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="section-description">
            Mostrando {rangeFrom}-{rangeTo} de {total}
          </span>
          <div className="pagination-controls">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage <= 1}
            >
              Anterior
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage >= totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {showForm ? (
        <SupplierFormModal
          supplier={formSupplier}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      ) : null}

      {detailSupplier ? (
        <SupplierDetailModal supplier={detailSupplier} onClose={() => setDetailSupplier(null)} />
      ) : null}
    </section>
  );
}
