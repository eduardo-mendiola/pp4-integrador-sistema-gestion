import { useState, useMemo } from 'react';
import { apiRequest } from '../../../services/api.js';

export default function useSalesList() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    dateRange: 'all',
    customDateFrom: '',
    customDateTo: '',
    status: '',
    paymentMethod: '',
    clientSearch: '',
    saleNumber: ''
  });

  const loadSales = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiRequest('/api/sales');
      const data = response.data || response;
      setSales(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading sales:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar ventas según los filtros aplicados
  const filteredSales = useMemo(() => {
    let result = [...sales];

    // Filtrar por rango de fechas
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (filters.dateRange === 'today') {
      result = result.filter(sale => {
        const saleDate = new Date(sale.createdAt || sale.created_at);
        return saleDate >= today;
      });
    } else if (filters.dateRange === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      result = result.filter(sale => {
        const saleDate = new Date(sale.createdAt || sale.created_at);
        return saleDate >= yesterday && saleDate < today;
      });
    } else if (filters.dateRange === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      result = result.filter(sale => {
        const saleDate = new Date(sale.createdAt || sale.created_at);
        return saleDate >= weekStart;
      });
    } else if (filters.dateRange === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      result = result.filter(sale => {
        const saleDate = new Date(sale.createdAt || sale.created_at);
        return saleDate >= monthStart;
      });
    } else if (filters.dateRange === 'custom' && filters.customDateFrom && filters.customDateTo) {
      const fromDate = new Date(filters.customDateFrom);
      const toDate = new Date(filters.customDateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(sale => {
        const saleDate = new Date(sale.createdAt || sale.created_at);
        return saleDate >= fromDate && saleDate <= toDate;
      });
    }
    // Si es 'all', no filtra por fecha (result = [...sales])

    // Filtrar por estado
    if (filters.status) {
      result = result.filter(sale => sale.status === filters.status);
    }

    // Filtrar por método de pago
    if (filters.paymentMethod) {
      result = result.filter(sale => {
        if (!sale.payments || sale.payments.length === 0) return false;
        const method = sale.payments[0].method;
        if (typeof method === 'string') return method === filters.paymentMethod;
        if (method?.name) {
          const methodMap = {
            'cash': 'cash',
            'credit_card': 'Tarjeta de Crédito',
            'debit_card': 'Tarjeta de Débito',
            'transfer': 'transfer'
          };
          return method.name.toLowerCase().includes(methodMap[filters.paymentMethod]?.toLowerCase() || '');
        }
        return false;
      });
    }

    // Filtrar por cliente
    if (filters.clientSearch) {
      const search = filters.clientSearch.toLowerCase();
      result = result.filter(sale => {
        const clientName = (
          sale.customer_name || 
          sale.metadata?.customer_name || 
          sale.client_id?.business_name ||
          sale.client_id?.first_name ||
          ''
        ).toLowerCase();
        return clientName.includes(search);
      });
    }

    // Filtrar por número de venta
    if (filters.saleNumber) {
      const search = filters.saleNumber.toLowerCase();
      result = result.filter(sale => 
        (sale._id || '').toLowerCase().includes(search)
      );
    }

    return result;
  }, [sales, filters]);

  return {
    sales: filteredSales,
    allSales: sales,
    loading,
    error,
    filters,
    setFilters,
    loadSales
  };
}