import React from 'react';
import ClientSearch from './ClientSearch';
import ClientForm from './ClientForm';
import ClientDetails from './ClientDetails';
import './ClientModal.css';

export default function ClientModal({
  isOpen,
  mode,
  client,
  clients,
  loading,
  saving,
  onClose,
  onSelect,
  onCreate,
  onUpdate,
  onModeChange
}) {
  if (!isOpen) return null;

  const getModalTitle = () => {
    switch (mode) {
      case 'search': return 'Seleccionar Cliente';
      case 'create': return 'Nuevo Cliente';
      case 'edit': return 'Editar Cliente';
      case 'view': return 'Detalles del Cliente';
      default: return 'Cliente';
    }
  };

  const renderContent = () => {
    switch (mode) {
      case 'search':
        return (
          <ClientSearch
            clients={clients}
            loading={loading}
            onSelect={onSelect}
            onCreateNew={() => onModeChange('create')}
          />
        );
      case 'create':
        return (
          <ClientForm
            client={null}
            saving={saving}
            onSubmit={onCreate}
            onCancel={() => onModeChange('search')}
          />
        );
      case 'edit':
        return (
          <ClientForm
            client={client}
            saving={saving}
            onSubmit={(data) => onUpdate(client._id, data)}
            onCancel={onClose}
          />
        );
      case 'view':
        return (
          <ClientDetails
            client={client}
            onEdit={() => onModeChange('edit')}
            onClose={onClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="client-modal-overlay" onClick={onClose}>
      <div className="client-modal" onClick={(e) => e.stopPropagation()}>
        <div className="client-modal-header">
          <h2>{getModalTitle()}</h2>
          <button className="client-modal-close" onClick={onClose}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="client-modal-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}