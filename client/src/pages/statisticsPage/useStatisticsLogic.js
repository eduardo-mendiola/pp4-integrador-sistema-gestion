import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api.js';

export default function useStatisticsLogic() {
  const [statisticsData, setStatisticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [period, setPeriod] = useState('month'); // 'today', 'week', 'month', 'year', 'custom'
  const [customDates, setCustomDates] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const getDateRange = () => {
    const today = new Date();
    let from, to;

    switch (period) {
      case 'today':
        from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        to = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        from = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
        to = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        break;
      case 'month':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'year':
        from = new Date(today.getFullYear(), 0, 1);
        to = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
        break;
      case 'custom':
        from = new Date(customDates.from);
        from.setHours(0, 0, 0, 0);
        to = new Date(customDates.to);
        to.setHours(23, 59, 59, 999);
        break;
      default:
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    }

    return {
      from: from.toISOString(),
      to: to.toISOString()
    };
  };

  const loadStatistics = async () => {
    setLoading(true);
    setError('');
    
    try {
      const dateRange = getDateRange();
      const queryParams = new URLSearchParams({
        from: dateRange.from,
        to: dateRange.to
      });

      const response = await apiRequest(`/api/statistics/dashboard?${queryParams.toString()}`);
      setStatisticsData(response.data || response);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
      setError('Error al cargar las estadísticas: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const handleCustomDateChange = (field, value) => {
    setCustomDates(prev => ({ ...prev, [field]: value }));
  };

  // Cargar automáticamente al cambiar el período
  useEffect(() => {
    if (period !== 'custom') {
      loadStatistics();
    }
  }, [period]);

  return {
    statisticsData,
    loading,
    error,
    period,
    customDates,
    loadStatistics,
    handlePeriodChange,
    handleCustomDateChange
  };
}