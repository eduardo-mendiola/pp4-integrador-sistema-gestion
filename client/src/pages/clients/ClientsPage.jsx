import React, { useEffect, useMemo, useRef, useState } from 'react';
import { apiRequest, unwrapList } from '../../services/api.js';
import { exportToCsv, slugify } from '../../utils/csvExport.js';
import ClientFormModal from './ClientFormModal.jsx';
import ClientDetailModal from './ClientDetailModal.jsx';

const PAGE_SIZE = 10;

const STATUS_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'En Stock' },
  { key: 'cancelled', label: 'Cancelados' }
];

const getFullName = (client) => {
  const composed = `${client.first_name || ''} ${client.last_name || ''}`.trim();
  return client.full_name || composed || client.business_name || '-';
};

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('es-AR');
};

const CLIENT_COLUMNS = [
  { header: 'NRO. DE CLIENTE', value: (client) => client.client_code || '-' },
  { header: 'NOMBRE', value: (client) => getFullName(client) },
  { header: 'TELÉFONO', value: (client) => client.phone || '-' },
  { header: 'EMAIL', value: (client) => client.email || '-' },
  { header: 'FECHA DE REGISTRO', value: (client) => formatDate(client.created_at) },
  { header: 'ESTADO', value: (client) => (client.active ? 'Activo' : 'Cancelado') }
];

function RowMenu({ client, onEdit, onDetail, onToggleActive }) {
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
          <button type="button" onClick={() => runAction(() => onDetail(client))}>
            Ver detalle
          </button>
          <button type="button" onClick={() => runAction(() => onEdit(client))}>
            Editar
          </button>
          <button
            type="button"
            className={client.active ? 'danger-text' : ''}
            onClick={() => runAction(() => onToggleActive(client))}
          >
            {client.active ? 'Borrar' : 'Reactivar'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [formClient, setFormClient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [detailClient, setDetailClient] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = await apiRequest('/api/clients');
      setClients(unwrapList(payload));
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

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();

    return clients.filter((client) => {
      if (statusFilter === 'active' && !client.active) {
        return false;
      }
      if (statusFilter === 'cancelled' && client.active) {
        return false;
      }

      if (!term) {
        return true;
      }

      const haystack = [
        client.client_code,
        getFullName(client),
        client.business_name,
        client.email,
        client.phone
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [clients, search, statusFilter]);

  const total = filteredClients.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filteredClients.slice(startIndex, startIndex + PAGE_SIZE);
  const rangeFrom = total === 0 ? 0 : startIndex + 1;
  const rangeTo = Math.min(startIndex + PAGE_SIZE, total);

  const handleExport = () => {
    const statusLabel = STATUS_TABS.find((tab) => tab.key === statusFilter)?.label || 'todos';
    exportToCsv(`clientes_${slugify(statusLabel)}`, filteredClients, CLIENT_COLUMNS);
  };

  const openCreate = () => {
    setFormClient(null);
    setShowForm(true);
  };

  const openEdit = (client) => {
    setFormClient(client);
    setShowForm(true);
  };

  const handleSaved = async () => {
    setShowForm(false);
    setFormClient(null);
    await loadData();
  };

  const handleToggleActive = async (client) => {
    const id = client._id || client.id;
    const cancelling = client.active;
    const confirmed = window.confirm(
      cancelling ? '¿Borrar este cliente?' : '¿Reactivar este cliente?'
    );
    if (!confirmed) {
      return;
    }

    try {
      if (cancelling) {
        await apiRequest(`/api/clients/${id}`, { method: 'DELETE' });
      } else {
        await apiRequest(`/api/clients/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ active: true })
        });
      }
      await loadData();
    } catch (toggleError) {
      setError(toggleError.message);
    }
  };

  if (loading) {
    return <div className="state-box">Cargando clientes...</div>;
  }

  return (
    <section className="module-grid">
      <header className="section-header">
        <div>
          <p className="eyebrow">Módulo</p>
          <h2>Listado de clientes</h2>
        </div>
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
          Nuevo Cliente
        </button>
      </header>

      <div className="panel">
        <div className="clients-toolbar">
          <div className="search-input">
            <input
              type="search"
              placeholder="Buscar cliente..."
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
            disabled={filteredClients.length === 0}
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
                <th>NRO. DE CLIENTE</th>
                <th>NOMBRE</th>
                <th>TELÉFONO</th>
                <th>EMAIL</th>
                <th>FECHA DE REGISTRO</th>
                <th>ESTADO</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7}>No hay clientes para mostrar.</td>
                </tr>
              ) : (
                pageItems.map((client) => (
                  <tr key={client._id || client.id}>
                    <td>
                      <button
                        type="button"
                        className="code-link"
                        onClick={() => setDetailClient(client)}
                      >
                        {client.client_code || '-'}
                      </button>
                    </td>
                    <td>{getFullName(client)}</td>
                    <td>{client.phone || '-'}</td>
                    <td>{client.email || '-'}</td>
                    <td>{formatDate(client.created_at)}</td>
                    <td>
                      <span className={`badge ${client.active ? 'badge-success' : 'badge-danger'}`}>
                        {client.active ? 'Activo' : 'Cancelado'}
                      </span>
                    </td>
                    <td>
                      <RowMenu
                        client={client}
                        onEdit={openEdit}
                        onDetail={setDetailClient}
                        onToggleActive={handleToggleActive}
                      />
                    </td>
                  </tr>
                ))
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
        <ClientFormModal
          client={formClient}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      ) : null}

      {detailClient ? (
        <ClientDetailModal client={detailClient} onClose={() => setDetailClient(null)} />
      ) : null}
    </section>
  );
}
