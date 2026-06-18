import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api.js';

export default function useMovementsLogic() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    type: '',
    paymentMethod: '',
    sourceType: '',
    operator: '',
    minAmount: '',
    dateFrom: '',
    dateTo: ''
  });

  const loadMovements = async () => {
    setLoading(true);
    setError('');
    
    try {
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.paymentMethod) queryParams.append('paymentMethod', filters.paymentMethod);
      if (filters.sourceType) queryParams.append('sourceType', filters.sourceType);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);

      const url = `/api/cash-flow${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiRequest(url);
      setMovements(response.data || []);
    } catch (err) {
      console.error('Error loading movements:', err);
      setError('Error al cargar los movimientos');
    } finally {
      setLoading(false);
    }
  };

  const refreshMovements = () => {
    loadMovements();
  };

  useEffect(() => {
    loadMovements();
  }, [filters]);

  return {
    movements,
    loading,
    error,
    filters,
    setFilters,
    loadMovements,
    refreshMovements
  };
}