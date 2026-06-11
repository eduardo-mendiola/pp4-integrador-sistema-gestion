import { useState, useEffect } from "react";
import { apiRequest } from "../../../services/api.js";

export default function useSalesLogic() {
  // Estado para productos disponibles
  const [availableProducts, setAvailableProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Estado para items en el carrito
  const [cartItems, setCartItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  // Estado para valores de cantidad en edición
  const [editingQuantities, setEditingQuantities] = useState({});

  // Estado para UI
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Estado para flujo de pago
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentProcessModal, setShowPaymentProcessModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  // Cargar productos al iniciar
  useEffect(() => {
    loadProducts();
  }, []);

  // Calcular totales
  const calculateTotals = () => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const discount = cartItems.reduce(
      (sum, item) => sum + (item.discount || 0),
      0,
    );
    const total = subtotal - discount;
    const tax = total * 0.21;

    return {
      subtotal,
      discount,
      tax,
      total: total + tax,
    };
  };

  const totals = calculateTotals();

  // Cargar productos disponibles
  const loadProducts = async () => {
    try {
      const response = await apiRequest("/api/products?limit=100");
      const products = response.data || response;
      setAvailableProducts(products);
    } catch (error) {
      console.error("Error loading products:", error);
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
    setCartItems((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item._id === product._id,
      );

      if (existingItemIndex >= 0) {
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + 1,
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
          stock: product.stock,
        };
        return [...prevCart, newItem];
      }
    });

    setSearchQuery("");
    setShowSearchResults(false);
    setMessage({ type: "success", text: `Producto agregado: ${product.name}` });
    setTimeout(() => setMessage(""), 3000);
  };

  // Eliminar producto del carrito
  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== itemId));

    setEditingQuantities((prev) => {
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

    setCartItems((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  // Manejo de input de cantidad
  const handleQuantityFocus = (e, item) => {
    e.target.select();
    setEditingQuantities((prev) => ({
      ...prev,
      [item._id]: String(item.quantity),
    }));
  };

  const handleQuantityChange = (itemId, value) => {
    setEditingQuantities((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleQuantityBlur = (itemId) => {
    const value = editingQuantities[itemId];
    const parsed = parseInt(value);

    if (!isNaN(parsed) && parsed >= 1) {
      updateQuantity(itemId, parsed);
    } else {
      setCartItems((prev) => {
        const item = prev.find((i) => i._id === itemId);
        if (item) {
          setEditingQuantities((prevEdit) => ({
            ...prevEdit,
            [itemId]: String(item.quantity),
          }));
        }
        return prev;
      });
    }
  };

  const handleQuantityKeyDown = (e, itemId) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  // Seleccionar item para ver detalles
  const selectItem = (item) => {
    setSelectedItem(item);
  };

  // Procesar pago - ahora recibe el cliente como parámetro
  const processPayment = async (client, paymentMethod, paymentData = {}) => {
    if (cartItems.length === 0) {
      setMessage({ type: "error", text: "Agrega productos al carrito" });
      return { success: false };
    }

    if (!client) {
      setMessage({ type: "error", text: "Seleccione un cliente" });
      return { success: false };
    }

    setLoading(true);

    try {
      const payload = {
        client_id: client._id,
        customer_name: client.business_name || 
          `${client.first_name || ''} ${client.last_name || ''}`.trim(),
        items: cartItems.map((item) => ({
          product_id: item._id,
          sku: item.sku,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
        })),
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total,
        payment_method: paymentMethod,
        payment_data: paymentData,
        metadata: {
          date: new Date().toISOString(),
        },
      };

      const response = await apiRequest("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const saleData = response.data || response;
      
      setMessage({ type: "success", text: "✓ Venta creada exitosamente" });

      // Limpiar carrito pero NO el cliente (por si quiere hacer otra venta)
      setCartItems([]);
      setEditingQuantities({});
      setSelectedItem(null);
      setShowPaymentProcessModal(false);
      setSelectedPaymentMethod(null);

      setTimeout(() => setMessage(""), 5000);
      
      return { success: true, sale: saleData };
    } catch (error) {
      setMessage({ type: "error", text: "✗ Error: " + error.message });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Limpiar venta
  const clearSale = () => {
    if (window.confirm("¿Cancelar venta?")) {
      setCartItems([]);
      setEditingQuantities({});
      setSelectedItem(null);
      setSelectedPaymentMethod(null);
      setShowPaymentModal(false);
      setShowPaymentProcessModal(false);
    }
  };

  // Filtrar productos para búsqueda
  const filteredProducts = availableProducts
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .slice(0, 10);

  // Abrir modal de selección de método de pago
  const openPaymentModal = () => {
    setShowPaymentModal(true);
  };

  // Seleccionar método de pago y abrir modal de procesamiento
  const handleSelectPaymentMethod = (method) => {
    setSelectedPaymentMethod(method);
    setShowPaymentModal(false);
    setShowPaymentProcessModal(true);
  };

  // Cerrar modal de procesamiento
  const closePaymentProcessModal = () => {
    setShowPaymentProcessModal(false);
    setSelectedPaymentMethod(null);
  };

  return {
    searchQuery,
    cartItems,
    selectedItem,
    editingQuantities,
    loading,
    message,
    showSearchResults,
    filteredProducts,
    totals,
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
    clearSale,
    // Flujo de pago
    showPaymentModal,
    showPaymentProcessModal,
    selectedPaymentMethod,
    openPaymentModal,
    handleSelectPaymentMethod,
    closePaymentProcessModal,
    setShowPaymentModal,
  };
}