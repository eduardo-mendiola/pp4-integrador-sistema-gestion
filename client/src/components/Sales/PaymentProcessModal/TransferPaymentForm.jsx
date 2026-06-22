import React from 'react';
import './TransferPaymentForm.css';

export default function TransferPaymentForm({ total, loading, onProcess, onCancel }) {
  const bankData = {
    bank_name: 'Banco Nación',
    account_holder: 'Planeta Juguetes S.A.',
    cuit: '30-12345678-9',
    cbu: '0110123456789012345678',
    alias: 'planeta.juguetes.sa'
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onProcess({
      bank_data: bankData,
      transfer_reference: `TRANS-${Date.now()}`
    });
  };

  return (
    <div className="transfer-form">
      <div className="transfer-form-info">
        <p className="transfer-form-info-text">
          Realice la transferencia a los siguientes datos y luego confirme el pago:
        </p>
      </div>

      <div className="transfer-form-bank">
        <div className="transfer-form-bank-row">
          <span className="transfer-form-bank-label">Banco:</span>
          <span className="transfer-form-bank-value">{bankData.bank_name}</span>
        </div>
        <div className="transfer-form-bank-row">
          <span className="transfer-form-bank-label">Titular:</span>
          <span className="transfer-form-bank-value">{bankData.account_holder}</span>
        </div>
        <div className="transfer-form-bank-row">
          <span className="transfer-form-bank-label">CUIT:</span>
          <span className="transfer-form-bank-value">{bankData.cuit}</span>
        </div>
        <div className="transfer-form-bank-row">
          <span className="transfer-form-bank-label">CBU:</span>
          <span className="transfer-form-bank-value transfer-form-copyable">
            {bankData.cbu}
            <button 
              type="button" 
              className="transfer-form-copy-btn"
              onClick={() => handleCopy(bankData.cbu)}
            >
              Copiar
            </button>
          </span>
        </div>
        <div className="transfer-form-bank-row">
          <span className="transfer-form-bank-label">Alias:</span>
          <span className="transfer-form-bank-value transfer-form-copyable">
            {bankData.alias}
            <button 
              type="button" 
              className="transfer-form-copy-btn"
              onClick={() => handleCopy(bankData.alias)}
            >
              Copiar
            </button>
          </span>
        </div>
      </div>

      <div className="transfer-form-amount">
        <span>Monto a transferir:</span>
        <span className="transfer-form-amount-value">
          ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="transfer-form-actions">
        <button 
          type="button" 
          className="transfer-form-btn cancel"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </button>
        <button 
          type="button" 
          className="transfer-form-btn process"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Procesando...' : 'Confirmar Transferencia'}
        </button>
      </div>
    </div>
  );
}
