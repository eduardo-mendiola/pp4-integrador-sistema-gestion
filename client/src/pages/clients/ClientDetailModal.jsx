import React from 'react';
import Modal from '../../components/Modal.jsx';

const CLIENT_TYPE_LABELS = {
  CONSUMIDOR_FINAL: 'Consumidor final',
  RESPONSABLE_INSCRIPTO: 'Responsable inscripto',
  MONOTRIBUTISTA: 'Monotributista',
  EXENTO: 'Exento'
};

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('es-AR');
};

const getFullName = (client) => {
  const composed = `${client.first_name || ''} ${client.last_name || ''}`.trim();
  return client.full_name || composed || client.business_name || '-';
};

const formatAddress = (address) => {
  if (!address) {
    return '-';
  }

  const parts = [
    [address.street, address.number].filter(Boolean).join(' '),
    address.city,
    address.state,
    address.postal_code,
    address.country
  ].filter(Boolean);

  return parts.length ? parts.join(', ') : '-';
};

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value || '-'}</span>
    </div>
  );
}

export default function ClientDetailModal({ client, onClose }) {
  const purchases = Array.isArray(client.purchases) ? client.purchases : [];

  return (
    <Modal title={`Cliente ${client.client_code || ''}`.trim()} size="lg" onClose={onClose}>
      <div className="detail-grid">
        <DetailRow label="Nro. de cliente" value={client.client_code} />
        <DetailRow
          label="Estado"
          value={
            <span className={`badge ${client.active ? 'badge-success' : 'badge-danger'}`}>
              {client.active ? 'Activo' : 'Cancelado'}
            </span>
          }
        />
        <DetailRow label="Nombre / Razón social" value={getFullName(client)} />
        <DetailRow label="Tipo de cliente" value={CLIENT_TYPE_LABELS[client.client_type] || client.client_type} />
        <DetailRow label="Documento" value={`${client.document_type || ''} ${client.document_number || ''}`.trim()} />
        <DetailRow label="Email" value={client.email} />
        <DetailRow label="Teléfono" value={client.phone} />
        <DetailRow label="Fecha de registro" value={formatDate(client.created_at)} />
        <DetailRow label="Domicilio" value={formatAddress(client.address)} />
      </div>

      <h4 className="detail-section-title">Historial de compras ({purchases.length})</h4>
      {purchases.length === 0 ? (
        <p className="section-description">Este cliente no registra compras.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Comprobante</th>
                <th>Items</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((sale, index) => (
                <tr key={sale._id || index}>
                  <td>{sale.code || sale.sale_code || sale._id || '-'}</td>
                  <td>{Array.isArray(sale.items) ? sale.items.length : '-'}</td>
                  <td>{sale.total != null ? Number(sale.total).toFixed(2) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="form-actions modal-actions">
        <button type="button" className="secondary-button" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
