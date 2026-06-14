import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api.js';

export const RETURN_PERIOD_DAYS = 30;

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

  const [originalSale, setOriginalSale] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [exchangeItems, setExchangeItems] = useState([]);
  const [operationType, setOperationType] = useState('return');
  const [returnReason, setReturnReason] = useState('');

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

  const performSearch = async () => {
    setIsSearching(true);
    setHasSearched(true); 
    setError('');
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
    setSelectionMode('full');
    
    // Inicializar items con toda la información financiera
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
    setCurrentStep('operation');
  };

  const cancelOperation = () => {
    setOriginalSale(null);
    setReturnItems([]);
    setExchangeItems([]);
    setOperationType('return');
    setReturnReason('');
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

  // CÁLCULO CORRECTO DE DEVOLUCIÓN
  const calculateTotals = () => {
    if (!originalSale) return { returnTotal: 0, exchangeTotal: 0, difference: 0, breakdown: {} };

    const selectedItems = returnItems.filter(item => item.quantity > 0);
    
    // 1. Subtotal bruto de items a devolver (precio × cantidad sin descuentos)
    const returnSubtotalBruto = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // 2. Descuentos individuales de items a devolver
    const returnDiscountsIndividual = selectedItems.reduce((sum, item) => {
      // Calcular proporción del descuento individual según cantidad devuelta
      const proporcion = item.quantity / item.maxQuantity;
      return sum + (item.discount * proporcion);
    }, 0);
    
    // 3. Base después de descuentos individuales
    const baseAfterIndividualDiscounts = returnSubtotalBruto - returnDiscountsIndividual;
    
    // 4. Aplicar descuento global proporcionalmente
    const saleDiscountGlobalRate = originalSale.discount_rate || 0;
    const returnDiscountGlobal = baseAfterIndividualDiscounts * (saleDiscountGlobalRate / 100);
    
    // 5. Total descuentos de la devolución
    const returnDiscountTotal = returnDiscountsIndividual + returnDiscountGlobal;
    
    // 6. Base imponible final (sobre lo que se calcula el IVA)
    const returnBaseImponible = returnSubtotalBruto - returnDiscountTotal;
    
    // 7. IVA de la devolución
    const returnTaxRate = originalSale.tax_rate || 21;
    const returnIVA = returnBaseImponible * (returnTaxRate / 100);
    
    // 8. Total a devolver
    const returnTotal = returnBaseImponible + returnIVA;
    
    // Total de productos nuevos (para cambio)
    const exchangeTotal = exchangeItems.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Diferencia
    const difference = exchangeTotal - returnTotal;

    return {
      returnTotal,
      exchangeTotal,
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

  return {
    currentStep,
    selectionMode,
    searchFilters,
    setSearchFilters,
    searchResults,
    isSearching,
    hasSearched,       
    originalSale,
    returnItems,
    exchangeItems,
    operationType,
    setOperationType,
    returnReason,
    setReturnReason,
    error,
    performSearch,
    clearFilters,      
    selectSale,
    cancelOperation,
    toggleSelectionMode,
    updateReturnQuantity,
    addExchangeItem,
    updateExchangeQuantity,
    totals: calculateTotals()
  };
}