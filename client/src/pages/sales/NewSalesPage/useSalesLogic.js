import { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/api.js';

export default function useSalesLogic() {
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

  // Calcular totales
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = cartItems.reduce((sum, item) => sum + (item.discount || 0), 0);
    const total = subtotal - discount;
    const tax = total * 0.21; // IVA 21%
    
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

  // Agregar producto al carrito
  const addToCart = (product) => {
    setCartItems(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item._id === product._id);
      
      if (existingItemIndex >= 0) {
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + 1
        };
        return newCart;
      } else {
        const newItem = {
          _id: product._id,
          sku: product.sku,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice || product.price,
          discount: product.discount || 0,
          quantity: 1,
          image: product.image,
          stock: product.stock
        };
        return [...prevCart, newItem];
      }
    });
    
    setSearchQuery('');
    setShowSearchResults(false);
    setMessage({ type: 'success', text: `Producto agregado: ${product.name}` });
    setTimeout(() => setMessage(''), 3000);
  };

  // Eliminar producto del carrito
  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item._id !== itemId));
    
    setEditingQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[itemId];
      return newQuantities;
    });
    
    if (selectedItem?._id === itemId) {
      setSelectedItem(null);
    }
  };

  // Actualizar cantidad
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prev => 
      prev.map(item =>
        item._id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Manejo de input de cantidad
  const handleQuantityFocus = (e, item) => {
    e.target.select();
    setEditingQuantities(prev => ({
      ...prev,
      [item._id]: String(item.quantity)
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
          product_id: item._id,
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

  // Limpiar venta
  const clearSale = () => {
    if (window.confirm('¿Cancelar venta?')) {
      setCartItems([]);
      setEditingQuantities({});
      setCustomerName('');
      setSelectedItem(null);
    }
  };

  // Filtrar productos para búsqueda
  const filteredProducts = availableProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10);

  return {
    searchQuery,
    customerName,
    cartItems,
    selectedItem,
    editingQuantities,
    loading,
    message,
    showSearchResults,
    filteredProducts,
    totals,
    setCustomerName,
    setMessage,
    handleSearch,
    addToCart,
    removeFromCart,
    handleQuantityFocus,
    handleQuantityChange,
    handleQuantityBlur,
    handleQuantityKeyDown,
    selectItem,
    processPayment,
    clearSale
  };
}