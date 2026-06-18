import { useState, useEffect } from "react";
import { apiRequest } from "../../../services/api.js";

const PAYMENT_METHOD_IDS = {
  cash: "6a2a413493ebd9bb34545eeb",
  credit_card: "6a13292f36b47dc045a9fc7a",
  debit_card: "6a13296f36b47dc045a9fc88",
  transfer: "6a2a414593ebd9bb34545ef0"
};

export default function useSalesLogic() {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [cartItems, setCartItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingQuantities, setEditingQuantities] = useState({});

  // Descuentos individuales por producto { productId: percentage }
  const [itemDiscounts, setItemDiscounts] = useState({});
  
  // Información de descuentos automáticos por producto
  const [automaticDiscounts, setAutomaticDiscounts] = useState({});
  
  // Marcar qué descuentos fueron modificados manualmente
  const [manualDiscounts, setManualDiscounts] = useState({});
  
  // Descuento global (%)
  const [discountRate, setDiscountRate] = useState(0);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentProcessModal, setShowPaymentProcessModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastSale, setLastSale] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  // Cálculo con descuentos individuales + global
  const calculateTotals = () => {
    const activeItems = cartItems.filter((item) => item.active !== false);

    // 1. Subtotal bruto: suma de (precio × cantidad)
    const subtotal = activeItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 2. Descuentos individuales por producto
    const itemDiscountsTotal = activeItems.reduce((sum, item) => {
      const itemDiscountRate = itemDiscounts[item._id] || 0;
      const itemSubtotal = item.price * item.quantity;
      return sum + (itemSubtotal * (itemDiscountRate / 100));
    }, 0);

    // 3. Descuento global sobre el subtotal menos descuentos individuales
    const subtotalAfterItemDiscounts = subtotal - itemDiscountsTotal;
    const globalDiscount = subtotalAfterItemDiscounts * (discountRate / 100);

    // 4. Descuento total
    const discount = itemDiscountsTotal + globalDiscount;

    // 5. Base imponible
    const taxableBase = subtotal - discount;

    // 6. IVA 21%
    const tax_rate = 21;
    const tax = taxableBase * (tax_rate / 100);

    // 7. Total final
    const total = taxableBase + tax;

    return {
      subtotal,
      discount_rate: discountRate,
      discount,
      tax_rate,
      tax,
      total,
    };
  };

  const totals = calculateTotals();

  const loadProducts = async () => {
    try {
      const response = await apiRequest("/api/products?limit=100");
      const products = response.data || response;
      setAvailableProducts(products);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

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

  // Función para calcular descuento automático
  const calculateAutomaticDiscount = async (productId) => {
    try {
      const response = await apiRequest(`/api/promotions/calculate-discount/${productId}`);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error calculando descuento automático:", error);
      return null;
    }
  };

  const addToCart = async (product) => {
    setCartItems((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item._id === product._id
      );

      if (existingItemIndex >= 0) {
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + 1,
          active: true,
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
          active: true,
        };
        return [...prevCart, newItem];
      }
    });

    // Calcular descuento automático para el producto
    const autoDiscount = await calculateAutomaticDiscount(product._id);
    if (autoDiscount) {
      setAutomaticDiscounts((prev) => ({
        ...prev,
        [product._id]: autoDiscount
      }));
      
      // Aplicar el descuento automático si no fue modificado manualmente
      if (!manualDiscounts[product._id]) {
        setItemDiscounts((prev) => ({
          ...prev,
          [product._id]: autoDiscount.discountRate
        }));
      }
    }

    setSearchQuery("");
    setShowSearchResults(false);
    setMessage({ type: "success", text: `Producto agregado: ${product.name}` });
    setTimeout(() => setMessage(""), 3000);
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== itemId));
    setItemDiscounts((prev) => {
      const newDiscounts = { ...prev };
      delete newDiscounts[itemId];
      return newDiscounts;
    });
    
    // Limpiar descuentos automáticos y manuales
    setAutomaticDiscounts((prev) => {
      const newAutoDiscounts = { ...prev };
      delete newAutoDiscounts[itemId];
      return newAutoDiscounts;
    });
    
    setManualDiscounts((prev) => {
      const newManualDiscounts = { ...prev };
      delete newManualDiscounts[itemId];
      return newManualDiscounts;
    });

    setEditingQuantities((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[itemId];
      return newQuantities;
    });

    if (selectedItem?._id === itemId) {
      setSelectedItem(null);
    }
  };

  const toggleItemActive = (itemId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, active: !item.active } : item
      )
    );
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems((prev) =>
      prev.map((i) =>
        i._id === itemId ? { ...i, quantity: newQuantity } : i
      )
    );
  };

  const handleQuantityFocus = (e, item) => {
    e.target.select();
    setEditingQuantities((prev) => ({
      ...prev,
      [item._id]: String(item.quantity),
    }));
  };

  // Actualización automática al cambiar
  const handleQuantityChange = (itemId, value) => {
    // Solo actualizar el valor visual del input, NO el state
    setEditingQuantities((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleQuantityBlur = (itemId) => {
    const value = editingQuantities[itemId];
    const parsed = parseInt(value);

    setCartItems((prev) => {
      const item = prev.find((i) => i._id === itemId);
      if (!item) return prev;

      // Si no es un número válido, restaurar la cantidad actual
      if (isNaN(parsed) || parsed < 1) {
        setEditingQuantities((prevEdit) => {
          const newEdit = { ...prevEdit };
          delete newEdit[itemId];
          return newEdit;
        });
        return prev;
      }

      // Si supera el stock, corregir al máximo y mostrar warning
      if (parsed > item.stock) {
        setMessage({ 
          type: "warning", 
          text: `Stock máximo disponible: ${item.stock} unidades` 
        });
        setTimeout(() => setMessage(""), 4000);
        
        setEditingQuantities((prevEdit) => {
          const newEdit = { ...prevEdit };
          delete newEdit[itemId];
          return newEdit;
        });
        
        return prev.map((i) =>
          i._id === itemId ? { ...i, quantity: item.stock } : i
        );
      }

      // Valor válido: actualizar cantidad
      setEditingQuantities((prevEdit) => {
        const newEdit = { ...prevEdit };
        delete newEdit[itemId];
        return newEdit;
      });
      
      return prev.map((i) =>
        i._id === itemId ? { ...i, quantity: parsed } : i
      );
    });
  };

  const handleQuantityKeyDown = (e, itemId) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  // Manejo de descuento individual por producto
  const setItemDiscount = (productId, percentage) => {
    const validPercentage = Math.min(Math.max(0, percentage), 100);
    setItemDiscounts((prev) => ({
      ...prev,
      [productId]: validPercentage,
    }));
    
    // Marcar como descuento manual si el cajero lo modifica
    setManualDiscounts((prev) => ({
      ...prev,
      [productId]: true
    }));
  };

  const selectItem = (item) => {
    setSelectedItem(item);
  };

  const processPayment = async (client, paymentMethod, paymentData = {}) => {
    const activeItems = cartItems.filter((item) => item.active !== false);

    if (activeItems.length === 0) {
      setMessage({
        type: "error",
        text: "No hay productos activos en el carrito",
      });
      return { success: false };
    }

    if (!client) {
      setMessage({ type: "error", text: "Seleccione un cliente" });
      return { success: false };
    }

    setLoading(true);

    try {
      // Incluir descuentos individuales en los items
      const items = activeItems.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
        discount_rate: itemDiscounts[item._id] || 0,
      }));

      const paymentMethodId = PAYMENT_METHOD_IDS[paymentMethod];

      if (!paymentMethodId) {
        setMessage({ type: "error", text: "Método de pago no válido" });
        setLoading(false);
        return { success: false };
      }

      const totalAmount = totals.total;

      let paymentReference = "";
      if (paymentMethod === "cash" && paymentData.amount_received) {
        paymentReference = `Recibido: $${paymentData.amount_received}, Vuelto: $${paymentData.change || 0}`;
      } else if (
        (paymentMethod === "credit_card" || paymentMethod === "debit_card") &&
        paymentData.card_number
      ) {
        const cleanNumber = paymentData.card_number.replace(/\s/g, "");
        paymentReference = `Tarjeta terminada en ${cleanNumber.slice(-4)}`;
      } else if (paymentMethod === "transfer") {
        paymentReference =
          paymentData.transfer_reference || "Transferencia bancaria";
      }

      const payload = {
        client_id: client._id,
        items: items,
        payments: [
          {
            method: paymentMethodId,
            amount: totalAmount,
            reference: paymentReference,
            status: "CONFIRMED",
          },
        ],
        subtotal: totals.subtotal,
        discount_rate: totals.discount_rate,
        discount: totals.discount,
        tax_rate: totals.tax_rate,
        tax: totals.tax,
        total: totals.total,
        metadata: {
          customer_name:
            client.business_name ||
            `${client.first_name || ""} ${client.last_name || ""}`.trim(),
          payment_details: paymentData,
          processed_at: new Date().toISOString(),
        },
      };

      const response = await apiRequest("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const saleData = response.data || response;

      setLastSale(saleData);
      setShowPaymentProcessModal(false);
      setShowReceiptModal(true);

      setMessage({ type: "success", text: "✓ Venta creada exitosamente" });

      setCartItems([]);
      setEditingQuantities({});
      setSelectedItem(null);
      setSelectedPaymentMethod(null);
      setDiscountRate(0);
      setItemDiscounts({});
      setAutomaticDiscounts({});
      setManualDiscounts({});

      setTimeout(() => setMessage(""), 5000);

      return { success: true, sale: saleData };
    } catch (error) {
      console.error("Error al procesar pago:", error);
      setMessage({ type: "error", text: "✗ Error: " + error.message });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const clearSale = () => {
    if (window.confirm("¿Cancelar venta?")) {
      setCartItems([]);
      setEditingQuantities({});
      setSelectedItem(null);
      setSelectedPaymentMethod(null);
      setDiscountRate(0);
      setItemDiscounts({});
      setAutomaticDiscounts({});
      setManualDiscounts({});
      setShowPaymentModal(false);
      setShowPaymentProcessModal(false);
    }
  };

  const filteredProducts = availableProducts
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 10);

  const openPaymentModal = () => {
    setShowPaymentModal(true);
  };

  const handleSelectPaymentMethod = (method) => {
    setSelectedPaymentMethod(method);
    setShowPaymentModal(false);
    setShowPaymentProcessModal(true);
  };

  const closePaymentProcessModal = () => {
    setShowPaymentProcessModal(false);
    setSelectedPaymentMethod(null);
  };

  const handleNewSale = () => {
    setLastSale(null);
    setShowReceiptModal(false);
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
    discountRate,
    setDiscountRate,
    itemDiscounts,
    setItemDiscount,
    automaticDiscounts,
    manualDiscounts,
    setMessage,
    handleSearch,
    addToCart,
    removeFromCart,
    toggleItemActive,
    handleQuantityFocus,
    handleQuantityChange,
    handleQuantityBlur,
    handleQuantityKeyDown,
    selectItem,
    processPayment,
    clearSale,
    showPaymentModal,
    showPaymentProcessModal,
    selectedPaymentMethod,
    openPaymentModal,
    handleSelectPaymentMethod,
    closePaymentProcessModal,
    setShowPaymentModal,
    showReceiptModal,
    lastSale,
    handleNewSale,
    setShowReceiptModal,
  };
}