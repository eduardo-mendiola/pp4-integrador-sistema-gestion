import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api.js';

export const RETURN_PERIOD_DAYS = 30;

// Mapeo de métodos de pago del frontend a ObjectIds del backend
const PAYMENT_METHOD_IDS = {
  cash: "6a2a413493ebd9bb34545eeb",
  credit_card: "6a13292f36b47dc045a9fc7a",
  debit_card: "6a13296f36b47dc045a9fc88",
  transfer: "6a2a414593ebd9bb34545ef0"
};

export default function useReturnsLogic() {
  const [currentStep, setCurrentStep] = useState('search');
  const [selectionMode, setSelectionMode] = useState('full');
  
  const [searchFilters, setSearchFilters] = useState({
    invoiceNumber: '',
    clientName: '',
    dateFrom: '',
    dateTo: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); 
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(false);
  const [operationCompleted, setOperationCompleted] = useState(false);

  const [originalSale, setOriginalSale] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [exchangeItems, setExchangeItems] = useState([]);
  const [operationType, setOperationType] = useState('return');
  const [returnReason, setReturnReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  useEffect(() => {
    if (operationType === 'exchange_same') {
      const selectedReturns = returnItems.filter(item => item.quantity > 0);
      const syncedExchangeItems = selectedReturns.map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      }));
      setExchangeItems(syncedExchangeItems);
    }
  }, [operationType, returnItems]);

  useEffect(() => {
    if (operationType !== 'exchange_same') {
      setExchangeItems([]);
    }
  }, [operationType]);

  useEffect(() => {
    if (returnReason) {
      setWarning('');
    }
  }, [returnReason, customReason]);

  const performSearch = async () => {
    setIsSearching(true);
    setHasSearched(true); 
    setError('');
    setWarning('');
    setSearchResults([]);

    try {
      const response = await apiRequest('/api/sales');
      let allSales = response.data || response;

      const results = allSales.filter(sale => {
        const invoiceNumber = (sale._id || '').slice(-8).toUpperCase();
        const clientName = (
          sale.customer_name || 
          sale.metadata?.customer_name || 
          sale.client_id?.business_name ||
          sale.client_id?.first_name ||
          sale.client_id?.document_number ||
          ''
        ).toLowerCase();
        
        const saleDate = new Date(sale.createdAt || sale.created_at);

        if (searchFilters.invoiceNumber && !invoiceNumber.includes(searchFilters.invoiceNumber.toUpperCase())) return false;
        if (searchFilters.clientName && !clientName.includes(searchFilters.clientName.toLowerCase())) return false;
        
        if (searchFilters.dateFrom) {
          const fromDate = new Date(searchFilters.dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          if (saleDate < fromDate) return false;
        }
        if (searchFilters.dateTo) {
          const toDate = new Date(searchFilters.dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (saleDate > toDate) return false;
        }

        return true;
      });

      setSearchResults(results);
    } catch (err) {
      console.error('Error buscando factura:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setIsSearching(false);
    }
  };

  const clearFilters = () => {
    setSearchFilters({ invoiceNumber: '', clientName: '', dateFrom: '', dateTo: '' });
    setSearchResults([]);
    setHasSearched(false);
    setError('');
    setWarning('');
  };

  const selectSale = (sale) => {
    const saleDate = new Date(sale.createdAt || sale.created_at);
    const today = new Date();
    const daysDiff = Math.floor((today - saleDate) / (1000 * 60 * 60 * 24));

    if (daysDiff > RETURN_PERIOD_DAYS) {
      setError(`Esta factura tiene ${daysDiff} días. El período máximo de devolución es de ${RETURN_PERIOD_DAYS} días.`);
      return;
    }

    setOriginalSale(sale);
    setError('');
    setWarning('');
    setSelectionMode('full');
    setOperationCompleted(false);
    
    const initialReturnItems = sale.items.map(item => ({
      productId: item.product?._id || item.product,
      name: item.product?.name || 'Producto',
      quantity: item.quantity,
      maxQuantity: item.quantity,
      price: item.price,
      discount_rate: item.discount_rate || 0,
      discount: item.discount || 0,
      subtotal: item.subtotal
    }));

    setReturnItems(initialReturnItems);
    setExchangeItems([]);
    setOperationType('return');
    setReturnReason('');
    setCustomReason('');
    setCurrentStep('operation');
  };

  const cancelOperation = () => {
    setOriginalSale(null);
    setReturnItems([]);
    setExchangeItems([]);
    setOperationType('return');
    setReturnReason('');
    setCustomReason('');
    setOperationCompleted(false);
    setWarning('');
    setError('');
    clearFilters();
    setCurrentStep('search');
  };

  const toggleSelectionMode = () => {
    setSelectionMode(prev => {
      const nextMode = prev === 'full' ? 'individual' : 'full';
      
      setReturnItems(prevItems => prevItems.map(item => {
        if (nextMode === 'individual') {
          return { ...item, quantity: 0, subtotal: 0 };
        }
        return { ...item, quantity: item.maxQuantity, subtotal: item.price * item.maxQuantity };
      }));
      
      return nextMode;
    });
  };

  const updateReturnQuantity = (productId, quantity) => {
    if (selectionMode !== 'individual') return;

    setReturnItems(prev => prev.map(item => {
      if (item.productId === productId) {
        const validQty = Math.min(Math.max(0, quantity), item.maxQuantity);
        return { ...item, quantity: validQty };
      }
      return item;
    }));
  };

  const addExchangeItem = (product) => {
    setExchangeItems(prev => {
      const existing = prev.find(item => item.productId === product._id);
      if (existing) {
        return prev.map(item => 
          item.productId === product._id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, {
        productId: product._id,
        name: product.name,
        quantity: 1,
        price: product.price,
        subtotal: product.price
      }];
    });
  };

  const updateExchangeQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setExchangeItems(prev => prev.filter(item => item.productId !== productId));
    } else {
      setExchangeItems(prev => prev.map(item => 
        item.productId === productId 
          ? { ...item, quantity, subtotal: quantity * item.price }
          : item
      ));
    }
  };

  const calculateTotals = () => {
    if (!originalSale) return { returnTotal: 0, exchangeTotal: 0, difference: 0, breakdown: {} };

    const selectedItems = returnItems.filter(item => item.quantity > 0);
    
    const returnSubtotalBruto = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const returnDiscountsIndividual = selectedItems.reduce((sum, item) => {
      const proporcion = item.quantity / item.maxQuantity;
      return sum + (item.discount * proporcion);
    }, 0);
    
    const baseAfterIndividualDiscounts = returnSubtotalBruto - returnDiscountsIndividual;
    const saleDiscountGlobalRate = originalSale.discount_rate || 0;
    const returnDiscountGlobal = baseAfterIndividualDiscounts * (saleDiscountGlobalRate / 100);
    const returnDiscountTotal = returnDiscountsIndividual + returnDiscountGlobal;
    
    const returnBaseImponible = returnSubtotalBruto - returnDiscountTotal;
    const returnTaxRate = originalSale.tax_rate || 21;
    const returnIVA = returnBaseImponible * (returnTaxRate / 100);
    const returnTotal = returnBaseImponible + returnIVA; // Este es el crédito CON IVA
    
    let exchangeSubtotal = 0;
    let exchangeTotalWithTax = 0;
    
    if (operationType === 'exchange_same') {
      exchangeSubtotal = returnBaseImponible;
      exchangeTotalWithTax = returnTotal; // Mismo valor con IVA
    } else {
      exchangeSubtotal = exchangeItems.reduce((sum, item) => sum + item.subtotal, 0);
      const exchangeIVA = exchangeSubtotal * (returnTaxRate / 100);
      exchangeTotalWithTax = exchangeSubtotal + exchangeIVA; // Total del nuevo producto CON IVA
    }
    
    // Ahora la resta es correcta: (Nuevo con IVA) - (Crédito con IVA)
    const difference = exchangeTotalWithTax - returnTotal;

    return {
      returnTotal,
      exchangeTotal: exchangeTotalWithTax, // Ahora es con IVA
      exchangeSubtotal,
      difference,
      breakdown: {
        subtotalBruto: returnSubtotalBruto,
        descuentosIndividuales: returnDiscountsIndividual,
        descuentoGlobal: returnDiscountGlobal,
        descuentoTotal: returnDiscountTotal,
        baseImponible: returnBaseImponible,
        iva: returnIVA,
        taxRate: returnTaxRate
      }
    };
  };

  const processReturn = async (paymentMethod = null, paymentReference = '') => {
    setError('');
    setWarning('');

    if (!returnReason) {
      setWarning('Debe seleccionar un motivo para la operación');
      return { success: false, error: 'Motivo requerido' };
    }

    if (returnReason === 'otro' && !customReason.trim()) {
      setWarning('Debe especificar el motivo en el campo de texto');
      return { success: false, error: 'Motivo requerido' };
    }

    const selectedItems = returnItems.filter(item => item.quantity > 0);
    if (selectedItems.length === 0) {
      setWarning('Debe seleccionar al menos un producto para devolver');
      return { success: false, error: 'No hay productos seleccionados' };
    }

    setLoading(true);

    try {
      const totals = calculateTotals();
      
      // Convertir el método de pago de string a ObjectId
      const paymentMethodId = paymentMethod ? PAYMENT_METHOD_IDS[paymentMethod] : null;
      
      const payload = {
        original_sale_id: originalSale._id,
        type: operationType.toUpperCase(),
        reason: returnReason,
        reason_custom: returnReason === 'otro' ? customReason : '',
        items: selectedItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          discount_rate: item.discount_rate || 0,
          discount: item.discount || 0,
          subtotal: item.subtotal,
          maxQuantity: item.maxQuantity
        })),
        exchange_items: operationType === 'exchange_other' ? exchangeItems : [],
        exchange_total: totals.exchangeTotal,
        difference: totals.difference,
        payment_method: paymentMethodId, // Ahora es un ObjectId válido
        payment_reference: paymentReference
      };

      const response = await apiRequest('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.success) {
        throw new Error(response.message || 'Error al procesar la operación');
      }

      setOperationCompleted(true);
      
      setTimeout(() => {
        cancelOperation();
      }, 3000);

      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error procesando devolución:', err);
      setError('✗ Error: ' + (err.message || 'Error al procesar la operación'));
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    currentStep,
    selectionMode,
    searchFilters,
    setSearchFilters,
    searchResults,
    isSearching,
    hasSearched,
    loading,
    operationCompleted,
    originalSale,
    returnItems,
    exchangeItems,
    operationType,
    setOperationType,
    returnReason,
    setReturnReason,
    customReason,
    setCustomReason,
    error,
    warning,
    performSearch,
    clearFilters,      
    selectSale,
    cancelOperation,
    toggleSelectionMode,
    updateReturnQuantity,
    addExchangeItem,
    updateExchangeQuantity,
    processReturn,
    totals: calculateTotals()
  };
}