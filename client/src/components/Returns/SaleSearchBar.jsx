import React, { useRef, useEffect } from 'react';
import './SaleSearchBar.css';

export default function SaleSearchBar({ 
  searchQuery, 
  setSearchQuery, 
  searchResults, 
  isSearching, 
  onSearch, 
  onSelectSale,
  error 
}) {
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  // Cerrar resultados al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        // No cerrar inmediatamente para permitir seleccionar un resultado
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onSearch(value);
    }, 300);
  };

  const getInvoiceNumber = (sale) => {
    return (sale._id || '').slice(-8).toUpperCase();
  };

  const getClientName = (sale) => {
    return sale.customer_name || 
           sale.metadata?.customer_name || 
           sale.client_id?.business_name ||
           sale.client_id?.first_name ||
           'Sin nombre';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="sale-search-container" ref={searchRef}>
      <div className="sale-search-header">
        <h2>Buscar Factura Original</h2>
        <p className="sale-search-hint">Ingrese el N° de factura o nombre del cliente</p>
      </div>

      <div className="sale-search-input-wrapper">
        <input
          type="text"
          className="sale-search-input"
          placeholder="Ej: A4F5936E o Carlos Ramírez"
          value={searchQuery}
          onChange={handleInputChange}
          autoFocus
        />
        {isSearching && <span className="sale-search-loading">Buscando...</span>}
      </div>

      {error && (
        <div className="sale-search-error">
          {error}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="sale-search-results">
          {searchResults.map(sale => (
            <div 
              key={sale._id} 
              className="sale-search-result-item"
              onClick={() => onSelectSale(sale)}
            >
              <div className="sale-result-main">
                <span className="sale-result-invoice">N° {getInvoiceNumber(sale)}</span>
                <span className="sale-result-client">{getClientName(sale)}</span>
              </div>
              <div className="sale-result-details">
                <span className="sale-result-date">{formatDate(sale.createdAt || sale.created_at)}</span>
                <span className="sale-result-total">${(sale.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                <span className="sale-result-items">{sale.items?.length || 0} items</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="sale-search-no-results">
          No se encontraron facturas
        </div>
      )}
    </div>
  );
}
