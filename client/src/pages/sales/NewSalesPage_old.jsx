// /src/pages/Sales/NewSale.jsx
import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api.js';
import './NewSalesPage.css';

export default function NewSale() {
  // Eliminar padding del main-area para usar todo el espacio
  useEffect(() => {
    const mainArea = document.querySelector('.main-area');

    if (mainArea) {
      mainArea.classList.add('no-padding');
    }

    return () => {
      if (mainArea) {
        mainArea.classList.remove('no-padding');
      }
    };
  }, []);

  // Estado para productos disponibles
  const [availableProducts, setAvailableProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Estado para items en el carrito
  const [cartItems, setCartItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Estado para valores de cantidad en edición
  const [editingQuantities, setEditingQuantities] = useState({});
  
  // Estado para cliente
  const [customerName, setCustomerName] = useState('');
  
  // Estado para UI
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Cargar productos al iniciar
  useEffect(() => {
    loadProducts();
  }, []);

  // Debug: Ver cambios en cartItems
  useEffect(() => {
    console.log('🛒 CartItems actualizado:', cartItems);
  }, [cartItems]);

  // Calcular totales
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = cartItems.reduce((sum, item) => sum + (item.discount || 0), 0);
    const total = subtotal - discount;
    const tax = total * 0.16; // IVA 16%
    
    return {
      subtotal,
      discount,
      tax,
      total: total + tax
    };
  };

  const totals = calculateTotals();

  // Cargar productos disponibles
  const loadProducts = async () => {
    try {
      const response = await apiRequest('/api/products?limit=100');
      const products = response.data || response;
      console.log('📦 Productos cargados:', products);
      setAvailableProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // Buscar productos
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      setIsSearching(true);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  // Agregar producto al carrito - CORREGIDO: usar _id en lugar de id
  const addToCart = (product) => {
    console.log('➕ Agregando producto:', product);
    
    setCartItems(prevCart => {
      console.log('📋 Cart actual:', prevCart);
      
      // CAMBIO: usar _id en lugar de id
      const existingItemIndex = prevCart.findIndex(item => item._id === product._id);
      
      if (existingItemIndex >= 0) {
        // El producto ya existe, incrementar cantidad
        console.log('✅ Producto ya existe, incrementando cantidad');
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + 1
        };
        console.log('🛒 Nuevo cart:', newCart);
        return newCart;
      } else {
        // Producto nuevo, agregar al carrito
        console.log('✨ Producto nuevo, agregando al carrito');
        const newItem = {
          _id: product._id, // CAMBIO: usar _id
          sku: product.sku,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice || product.price,
          discount: product.discount || 0,
          quantity: 1,
          image: product.image,
          stock: product.stock
        };
        const newCart = [...prevCart, newItem];
        console.log('🛒 Nuevo cart:', newCart);
        return newCart;
      }
    });
    
    setSearchQuery('');
    setShowSearchResults(false);
    setMessage({ type: 'success', text: `Producto agregado: ${product.name}` });
    setTimeout(() => setMessage(''), 3000);
  };

  // Eliminar producto del carrito - CORREGIDO: usar _id
  const removeFromCart = (itemId) => {
    setCartItems(prev => {
      // CAMBIO: usar _id
      const newCart = prev.filter(item => item._id !== itemId);
      console.log('🗑️ Producto eliminado, nuevo cart:', newCart);
      return newCart;
    });
    
    setEditingQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[itemId];
      return newQuantities;
    });
    
    if (selectedItem?._id === itemId) { // CAMBIO: usar _id
      setSelectedItem(null);
    }
  };

  // Actualizar cantidad - CORREGIDO: usar _id
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prev => {
      // CAMBIO: usar _id
      const newCart = prev.map(item =>
        item._id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      );
      console.log('🔢 Cantidad actualizada, nuevo cart:', newCart);
      return newCart;
    });
  };

  // Manejo de input de cantidad
  const handleQuantityFocus = (e, item) => {
    e.target.select();
    setEditingQuantities(prev => ({
      ...prev,
      [item._id]: String(item.quantity) // CAMBIO: usar _id
    }));
  };

  const handleQuantityChange = (itemId, value) => {
    setEditingQuantities(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleQuantityBlur = (itemId) => {
    const value = editingQuantities[itemId];
    const parsed = parseInt(value);
    
    if (!isNaN(parsed) && parsed >= 1) {
      updateQuantity(itemId, parsed);
    } else {
      setCartItems(prev => {
        // CAMBIO: usar _id
        const item = prev.find(i => i._id === itemId);
        if (item) {
          setEditingQuantities(prevEdit => ({
            ...prevEdit,
            [itemId]: String(item.quantity)
          }));
        }
        return prev;
      });
    }
  };

  const handleQuantityKeyDown = (e, itemId) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  // Seleccionar item para ver detalles
  const selectItem = (item) => {
    setSelectedItem(item);
  };

  // Procesar pago
  const processPayment = async (paymentMethod) => {
    if (cartItems.length === 0) {
      setMessage({ type: 'error', text: 'Agrega productos al carrito' });
      return;
    }

    if (!customerName.trim()) {
      setMessage({ type: 'error', text: 'Ingresa el nombre del cliente' });
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        customer_name: customerName,
        items: cartItems.map(item => ({
          product_id: item._id, // CAMBIO: usar _id
          sku: item.sku,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount
        })),
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total,
        payment_method: paymentMethod,
        metadata: {
          cashier_id: 5,
          date: new Date().toISOString()
        }
      };

      const response = await apiRequest('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setMessage({ type: 'success', text: '✓ Venta creada exitosamente' });
      
      setCartItems([]);
      setEditingQuantities({});
      setCustomerName('');
      setSelectedItem(null);
      
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage({ type: 'error', text: '✗ Error: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos para búsqueda
  const filteredProducts = availableProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10);

  return (
    <div className="sales-container">
      {/* Barra de búsqueda */}
      <div className="sales-search-bar">
        <div className="sales-search-input-wrapper">
          <span className="sales-search-icon">🔍</span>
          <input
            type="text"
            className="sales-search-input"
            placeholder="Buscar productos (SKU, nombre)..."
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
          />
          
          {/* Resultados de búsqueda */}
          {showSearchResults && searchQuery.length >= 2 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #e1e8ed',
              borderRadius: '8px',
              marginTop: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {filteredProducts.length === 0 ? (
                <div style={{ padding: '16px', color: '#8898aa' }}>
                  No se encontraron productos
                </div>
              ) : (
                filteredProducts.map(product => (
                  <div
                    key={product._id} // CAMBIO: usar _id como key
                    onClick={() => addToCart(product)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f0f4f8',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{product.name}</div>
                      <div style={{ fontSize: '13px', color: '#8898aa' }}>
                        SKU: {product.sku}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#007bff' }}>
                      ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        <input
          type="text"
          placeholder="Nombre del cliente"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '2px solid #e1e8ed',
            borderRadius: '8px',
            width: '300px',
            fontSize: '15px'
          }}
        />
      </div>

      {/* Mensajes */}
      {message && (
        <div className={`sales-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Contenido principal */}
      <div className="sales-main-content">
        {/* Panel de productos */}
        <div className="sales-products-panel">
          <div className="sales-products-header">
            <h3>Productos</h3>
            <span className="sales-items-count">{cartItems.length} items</span>
          </div>

          {cartItems.length === 0 ? (
            <div className="sales-empty-state">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p>Busca y agrega productos al carrito</p>
            </div>
          ) : (
            <div className="sales-products-table">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>SKU</th>
                    <th>Nombre del Producto</th>
                    <th className="text-center" style={{ width: '100px' }}>Cant.</th>
                    <th className="text-right" style={{ width: '120px' }}>Precio</th>
                    <th className="text-right" style={{ width: '120px' }}>Total</th>
                    <th className="text-center" style={{ width: '60px' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr 
                      key={item._id} // CAMBIO: usar _id como key
                      className={selectedItem?._id === item._id ? 'selected' : ''} // CAMBIO: usar _id
                      onClick={() => selectItem(item)}
                    >
                      <td>
                        <input 
                          type="checkbox" 
                          className="sales-checkbox"
                          checked={true}
                          onChange={() => {}}
                        />
                      </td>
                      <td>
                        <span className="sales-product-sku">{item.sku}</span>
                      </td>
                      <td>
                        <div className="sales-product-name">{item.name}</div>
                        {item.discount > 0 && (
                          <div className="sales-product-discount">
                            Discount - Special Price (${item.discount.toLocaleString()})
                          </div>
                        )}
                      </td>
                      <td className="text-center">
                        <input
                          type="number"
                          className="sales-quantity-input"
                          value={editingQuantities[item._id] ?? item.quantity} // CAMBIO: usar _id
                          onFocus={(e) => handleQuantityFocus(e, item)}
                          onChange={(e) => handleQuantityChange(item._id, e.target.value)} // CAMBIO: usar _id
                          onBlur={() => handleQuantityBlur(item._id)} // CAMBIO: usar _id
                          onKeyDown={(e) => handleQuantityKeyDown(e, item._id)} // CAMBIO: usar _id
                          min="1"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="text-right">
                        {item.originalPrice > item.price && (
                          <span className="sales-price-original">
                            ${item.originalPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                        <span className="sales-price-final">
                          ${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="sales-price">
                          ${(item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="text-center">
                        <button 
                          className="sales-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(item._id); // CAMBIO: usar _id
                          }}
                          title="Eliminar producto"
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Panel de detalles */}
        <div className="sales-details-panel">
          <div className="sales-details-header">
            <h3>
              {selectedItem ? selectedItem.name : 'Master Hero Series - Ultra Rare'}
            </h3>
            {selectedItem?.image ? (
              <img 
                src={selectedItem.image} 
                alt={selectedItem.name}
                className="sales-product-image"
              />
            ) : (
              <div className="sales-product-image" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8898aa',
                backgroundColor: '#f8f9fa'
              }}>
                Sin imagen
              </div>
            )}
          </div>

          <div className="sales-details-info">
            <div className="sales-detail-row">
              <span className="sales-detail-label">Precio</span>
              <span className="sales-detail-value">
                ${selectedItem ? selectedItem.price.toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '24,500.00'}
              </span>
            </div>
            <div className="sales-detail-row">
              <span className="sales-detail-label">SKU</span>
              <span className="sales-detail-value">{selectedItem?.sku || 'AF-00923'}</span>
            </div>
            <div className="sales-detail-row">
              <span className="sales-detail-label">Categoría</span>
              <span className="sales-detail-value">COLLECTOR-ED</span>
            </div>
            <div className="sales-detail-row">
              <span className="sales-detail-label">Disponibles</span>
              <span className="sales-detail-value highlight">{selectedItem?.stock || 12}</span>
            </div>
            <div className="sales-detail-row">
              <span className="sales-detail-label">Descuento</span>
              <span className="sales-detail-value">
                ${selectedItem?.discount.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '0.00'}
              </span>
            </div>

            <button className="sales-check-stock-btn">
              <span>🔍</span>
              Chequear Stock
            </button>
          </div>

          {/* Botones de pago */}
          <div className="sales-payment-section">
            <div className="sales-payment-grid">
              <button 
                className="sales-payment-btn efectivo"
                onClick={() => processPayment('cash')}
                disabled={loading || cartItems.length === 0}
              >
                EFECTIVO
              </button>
              <button 
                className="sales-payment-btn tarjeta"
                onClick={() => processPayment('credit_card')}
                disabled={loading || cartItems.length === 0}
              >
                TARJETA
              </button>
              <button 
                className="sales-payment-btn debito"
                onClick={() => processPayment('debit_card')}
                disabled={loading || cartItems.length === 0}
              >
                DÉBITO
              </button>
              <button 
                className="sales-payment-btn transferencia"
                onClick={() => processPayment('transfer')}
                disabled={loading || cartItems.length === 0}
              >
                TRANSF.
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer con totales */}
      <div className="sales-footer">
        <div className="sales-totals-info">
          <div className="sales-total-item">
            <div className="sales-total-label">Descuento: {totals.discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
            <div className="sales-total-label">Impuesto (IVA): {totals.tax.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="sales-total-item">
            <div className="sales-total-label">Subtotal: {totals.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="sales-total-item">
            <div className="sales-total-label">
              TOTAL <span className="sales-total-badge">{cartItems.length} ITEMS</span>
            </div>
            <div className="sales-total-value main">
              ${totals.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="sales-actions">
          <button 
            className="sales-btn sales-btn-cancel"
            onClick={() => {
              if (window.confirm('¿Cancelar venta?')) {
                setCartItems([]);
                setEditingQuantities({});
                setCustomerName('');
                setSelectedItem(null);
              }
            }}
            disabled={loading || cartItems.length === 0}
          >
            <span>⊘</span>
            CANCELAR
          </button>
          <button 
            className="sales-btn sales-btn-pay"
            onClick={() => processPayment('cash')}
            disabled={loading || cartItems.length === 0}
          >
            $ PAGAR
          </button>
        </div>
      </div>
    </div>
  );
}