import React from 'react';
import './ClientSelector.css';

export default function ClientSelector({
  selectedClient,
  onAddClient,
  onViewClient,
  onEditClient,
  onChangeClient,
  onClearClient
}) {
  // Estado: Sin cliente seleccionado
  if (!selectedClient) {
    return (
      <div className="client-selector">
        <button className="client-selector-btn add" onClick={onAddClient}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Agregar Cliente
        </button>
        <div className="client-selector-warning">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Seleccione un cliente para continuar</span>
        </div>
      </div>
    );
  }

  // Estado: Cliente seleccionado
  const displayName = selectedClient.business_name || 
    `${selectedClient.first_name || ''} ${selectedClient.last_name || ''}`.trim() ||
    selectedClient.client_code;

  const documentInfo = `${selectedClient.document_type}: ${selectedClient.document_number}`;

  return (
    <div className="client-selector selected">
      <div className="client-selector-info">
        <div className="client-selector-avatar">
          {(selectedClient.first_name?.[0] || selectedClient.business_name?.[0] || '?').toUpperCase()}
        </div>
        <div className="client-selector-details">
          <div className="client-selector-name">{displayName}</div>
          <div className="client-selector-doc">{documentInfo}</div>
        </div>
      </div>
      
      <div className="client-selector-actions">
        <button 
          className="client-selector-btn view" 
          onClick={onViewClient}
          title="Ver detalles"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Ver
        </button>
        <button 
          className="client-selector-btn edit" 
          onClick={onEditClient}
          title="Editar datos"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar
        </button>
        <button 
          className="client-selector-btn change" 
          onClick={onChangeClient}
          title="Cambiar cliente"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Cambiar
        </button>
      </div>
    </div>
  );
}
