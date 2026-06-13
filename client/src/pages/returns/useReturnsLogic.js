import { useState } from 'react';
import { apiRequest } from '../../services/api.js';

export const RETURN_PERIOD_DAYS = 2;

export default function useReturnsLogic() {
  const [currentStep, setCurrentStep] = useState('search');
  
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
    
    const initialReturnItems = sale.items.map(item => ({
      productId: item.product?._id || item.product,
      name: item.product?.name || 'Producto',
      quantity: 0,
      maxQuantity: item.quantity,
      price: item.price,
      subtotal: 0
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

  const updateReturnQuantity = (productId, quantity) => {
    setReturnItems(prev => prev.map(item => {
      if (item.productId === productId) {
        const validQty = Math.min(Math.max(0, quantity), item.maxQuantity);
        return { ...item, quantity: validQty, subtotal: validQty * item.price };
      }
      return item;
    }));
  };

  return {
    currentStep,
    searchFilters,
    setSearchFilters,
    searchResults,
    isSearching,
    hasSearched,       
    originalSale,
    returnItems,
    error,
    performSearch,
    clearFilters,      
    selectSale,
    cancelOperation,
    updateReturnQuantity
  };
}