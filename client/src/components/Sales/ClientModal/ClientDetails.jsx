import React from 'react';
import './ClientDetails.css';

export default function ClientDetails({ client, onEdit, onClose }) {
  if (!client) return null;

  const displayName = client.business_name || 
    `${client.first_name || ''} ${client.last_name || ''}`.trim() ||
    'Sin nombre';

  const getClientTypeLabel = (type) => {
    const labels = {
      'CONSUMIDOR_FINAL': 'Consumidor Final',
      'RESPONSABLE_INSCRIPTO': 'Responsable Inscripto',
      'MONOTRIBUTISTA': 'Monotributista',
      'EXENTO': 'Exento'
    };
    return labels[type] || type;
  };

  const hasAddress = client.address && (
    client.address.street || 
    client.address.city || 
    client.address.state
  );

  return (
    <div className="client-details">
      <div className="client-details-header">
        <div className="client-details-avatar">
          {(client.first_name?.[0] || client.business_name?.[0] || '?').toUpperCase()}
        </div>
        <div className="client-details-title">
          <h2>{displayName}</h2>
          <span className="client-details-code">{client.client_code}</span>
        </div>
      </div>

      <div className="client-details-section">
        <h3>Información Fiscal</h3>
        <div className="client-details-grid">
          <div className="client-details-field">
            <label>Documento</label>
            <span>{client.document_type}: {client.document_number}</span>
          </div>
          <div className="client-details-field">
            <label>Condición IVA</label>
            <span className="client-details-badge">
              {getClientTypeLabel(client.client_type)}
            </span>
          </div>
        </div>
      </div>

      {(client.email || client.phone) && (
        <div className="client-details-section">
          <h3>Contacto</h3>
          <div className="client-details-grid">
            {client.email && (
              <div className="client-details-field">
                <label>Email</label>
                <span>{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="client-details-field">
                <label>Teléfono</label>
                <span>{client.phone}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {hasAddress && (
        <div className="client-details-section">
          <h3>Dirección</h3>
          <div className="client-details-address">
            {client.address.street && (
              <div>{client.address.street} {client.address.number}</div>
            )}
            {(client.address.city || client.address.state) && (
              <div>
                {client.address.city}
                {client.address.city && client.address.state && ', '}
                {client.address.state}
              </div>
            )}
            {client.address.postal_code && (
              <div>CP: {client.address.postal_code}</div>
            )}
            {client.address.country && (
              <div>{client.address.country}</div>
            )}
          </div>
        </div>
      )}

      <div className="client-details-actions">
        <button className="client-details-btn close" onClick={onClose}>
          Cerrar
        </button>
        <button className="client-details-btn edit" onClick={onEdit}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar Cliente
        </button>
      </div>
    </div>
  );
}
