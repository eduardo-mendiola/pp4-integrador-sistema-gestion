import React, { useState } from 'react';
import './ClientSearch.css';

export default function ClientSearch({ clients, loading, onSelect, onCreateNew }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = clients.filter(client => {
    const query = searchQuery.toLowerCase();
    const fullName = `${client.first_name || ''} ${client.last_name || ''}`.toLowerCase();
    const businessName = (client.business_name || '').toLowerCase();
    const document = (client.document_number || '').toLowerCase();
    const code = (client.client_code || '').toLowerCase();
    
    return fullName.includes(query) || 
           businessName.includes(query) ||
           document.includes(query) ||
           code.includes(query);
  });

  const getClientDisplayName = (client) => {
    if (client.business_name) return client.business_name;
    return `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Sin nombre';
  };

  const getClientTypeLabel = (type) => {
    const labels = {
      'CONSUMIDOR_FINAL': 'Consumidor Final',
      'RESPONSABLE_INSCRIPTO': 'Resp. Inscripto',
      'MONOTRIBUTISTA': 'Monotributista',
      'EXENTO': 'Exento'
    };
    return labels[type] || type;
  };

  return (
    <div className="client-search">
      <div className="client-search-header">
        <div className="client-search-input-wrapper">
          <span className="client-search-icon">🔍</span>
          <input
            type="text"
            className="client-search-input"
            placeholder="Buscar por nombre, documento, código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
        
        <button className="client-search-create-btn" onClick={onCreateNew}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Nuevo Cliente
        </button>
      </div>

      {loading ? (
        <div className="client-search-loading">
          <div className="client-search-spinner"></div>
          <span>Cargando clientes...</span>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="client-search-empty">
          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No se encontraron clientes</p>
          {searchQuery && <p className="client-search-empty-hint">Intenta con otro término de búsqueda</p>}
        </div>
      ) : (
        <div className="client-search-list">
          {filteredClients.map(client => (
            <div
              key={client._id}
              className="client-search-item"
              onClick={() => onSelect(client)}
            >
              <div className="client-search-item-avatar">
                {(client.first_name?.[0] || client.business_name?.[0] || '?').toUpperCase()}
              </div>
              
              <div className="client-search-item-info">
                <div className="client-search-item-name">
                  {getClientDisplayName(client)}
                </div>
                <div className="client-search-item-details">
                  <span className="client-search-item-doc">
                    {client.document_type}: {client.document_number}
                  </span>
                  <span className="client-search-item-type">
                    {getClientTypeLabel(client.client_type)}
                  </span>
                </div>
              </div>

              <div className="client-search-item-code">
                {client.client_code}
              </div>

              <button className="client-search-item-select">
                Seleccionar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}