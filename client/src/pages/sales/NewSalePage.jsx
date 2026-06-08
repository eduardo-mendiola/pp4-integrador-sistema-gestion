import React, { useState } from 'react';

export default function NewSalePage() {
  const [formData, setFormData] = useState({
    customer_name: '',
    items_json: '[]',
    total: '',
    metadata: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        customer_name: formData.customer_name,
        total: Number(formData.total || 0),
        items: formData.items_json ? JSON.parse(formData.items_json) : [],
        metadata: formData.metadata ? JSON.parse(formData.metadata) : undefined
      };

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMessage('✓ Venta creada exitosamente');
        setFormData({
          customer_name: '',
          items_json: '[]',
          total: '',
          metadata: '',
        });
      } else {
        setMessage('✗ Error al crear la venta');
      }
    } catch (error) {
      setMessage('✗ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Nueva Venta</h1>
      
      {message && (
        <div className={`message ${message.startsWith('✓') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Cliente *</label>
          <input
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            required
            placeholder="Nombre del cliente"
          />
        </div>

        <div className="form-group">
          <label>Items (JSON) *</label>
          <textarea
            name="items_json"
            value={formData.items_json}
            onChange={handleChange}
            rows="6"
            placeholder='[{"product": "Producto 1", "quantity": 2, "price": 10.50}]'
          />
        </div>

        <div className="form-group">
          <label>Total *</label>
          <input
            type="number"
            name="total"
            value={formData.total}
            onChange={handleChange}
            required
            step="0.01"
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label>Metadata (JSON opcional)</label>
          <textarea
            name="metadata"
            value={formData.metadata}
            onChange={handleChange}
            rows="3"
            placeholder='{}'
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Crear Venta'}
        </button>
      </form>

      <style>{`
        .page-container {
          padding: 20px;
          max-width: 800px;
        }

        .message {
          padding: 12px 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .message.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }

        input, textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
          font-size: 14px;
        }

        input:focus, textarea:focus {
          outline: none;
          border-color: var(--brand, #007bff);
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        button {
          background-color: var(--brand, #007bff);
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        button:hover:not(:disabled) {
          background-color: var(--brand-dark, #0056b3);
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
