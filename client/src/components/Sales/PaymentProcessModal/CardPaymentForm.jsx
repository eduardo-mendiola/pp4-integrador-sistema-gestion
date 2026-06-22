import React, { useState } from 'react';
import './CardPaymentForm.css';

export default function CardPaymentForm({ total, method, loading, onProcess, onCancel }) {
  const [formData, setFormData] = useState({
    card_number: '',
    card_name: '',
    expiry_date: '',
    cvv: '',
    installments: 1
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.card_number || !formData.card_name || !formData.expiry_date || !formData.cvv) {
      alert('Complete todos los campos obligatorios');
      return;
    }

    onProcess({
      ...formData,
      card_type: method === 'credit_card' ? 'credit' : 'debit'
    });
  };

  const isCreditCard = method === 'credit_card';

  return (
    <form className="card-form" onSubmit={handleSubmit}>
      <div className="card-form-field">
        <label>Número de Tarjeta *</label>
        <input
          type="text"
          name="card_number"
          value={formData.card_number}
          onChange={(e) => setFormData(prev => ({ ...prev, card_number: formatCardNumber(e.target.value) }))}
          placeholder="1234 5678 9012 3456"
          maxLength="19"
          className="card-form-input"
        />
      </div>

      <div className="card-form-field">
        <label>Nombre del Titular *</label>
        <input
          type="text"
          name="card_name"
          value={formData.card_name}
          onChange={handleChange}
          placeholder="Como aparece en la tarjeta"
          className="card-form-input"
        />
      </div>

      <div className="card-form-row">
        <div className="card-form-field">
          <label>Vencimiento *</label>
          <input
            type="text"
            name="expiry_date"
            value={formData.expiry_date}
            onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: formatExpiryDate(e.target.value) }))}
            placeholder="MM/AA"
            maxLength="5"
            className="card-form-input"
          />
        </div>

        <div className="card-form-field">
          <label>CVV *</label>
          <input
            type="text"
            name="cvv"
            value={formData.cvv}
            onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
            placeholder="123"
            maxLength="4"
            className="card-form-input"
          />
        </div>
      </div>

      {isCreditCard && (
        <div className="card-form-field">
          <label>Cuotas</label>
          <select
            name="installments"
            value={formData.installments}
            onChange={handleChange}
            className="card-form-input card-form-select"
          >
            <option value="1">1 pago</option>
            <option value="3">3 cuotas</option>
            <option value="6">6 cuotas</option>
            <option value="12">12 cuotas</option>
          </select>
        </div>
      )}

      <div className="card-form-actions">
        <button 
          type="button" 
          className="card-form-btn cancel"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="card-form-btn process"
          disabled={loading}
        >
          {loading ? 'Procesando...' : 'Procesar Pago'}
        </button>
      </div>
    </form>
  );
}
