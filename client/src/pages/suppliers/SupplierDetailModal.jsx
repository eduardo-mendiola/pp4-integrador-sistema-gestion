import React from 'react';
import Modal from '../../components/Modal.jsx';

const STATUS_META = {
  ACTIVO: { label: 'Activo', className: 'badge-success' },
  SUSPENDIDO: { label: 'Suspendido', className: 'badge-info' },
  CANCELADO: { label: 'Cancelado', className: 'badge-danger' }
};

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('es-AR');
};

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value || '-'}</span>
    </div>
  );
}

export default function SupplierDetailModal({ supplier, onClose }) {
  const status = supplier.status || 'ACTIVO';
  const meta = STATUS_META[status] || STATUS_META.ACTIVO;

  return (
    <Modal title={`Proveedor ${supplier.supplier_code || ''}`.trim()} size="lg" onClose={onClose}>
      <div className="detail-grid">
        <DetailRow label="Nro. de proveedor" value={supplier.supplier_code} />
        <DetailRow
          label="Estado"
          value={<span className={`badge ${meta.className}`}>{meta.label}</span>}
        />
        <DetailRow label="Nombre" value={supplier.name} />
        <DetailRow label="Nombre de contacto" value={supplier.contact_name} />
        <DetailRow label="Email" value={supplier.email} />
        <DetailRow label="Teléfono" value={supplier.phone} />
        <DetailRow label="Dirección" value={supplier.address} />
        <DetailRow label="Fecha de registro" value={formatDate(supplier.createdAt)} />
      </div>

      <div className="form-actions modal-actions">
        <button type="button" className="secondary-button" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
