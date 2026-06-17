import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api.js';

export default function useCashRegisterLogic() {
  const [cashRegister, setCashRegister] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [lastClosedSummary, setLastClosedSummary] = useState(null); 
  const [cashFlows, setCashFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modales
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filtros de movimientos
  const [filters, setFilters] = useState({
    type: '',
    paymentMethod: ''
  });

  useEffect(() => {
    loadCashRegisterStatus();
  }, []);

  useEffect(() => {
    if (cashRegister?.status === 'OPEN') {
      loadDailySummary();
      loadCashFlows();
    }
  }, [cashRegister, filters]);

  const loadCashRegisterStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiRequest('/api/cash-register/status');
      setCashRegister(response.data || null);
    } catch (err) {
      setError('Error al cargar el estado de la caja');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDailySummary = async () => {
    try {
      const response = await apiRequest('/api/cash-register/daily-summary');
      setDailySummary(response.data || null);
    } catch (err) {
      console.error('Error al cargar resumen:', err);
    }
  };

  const loadCashFlows = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.paymentMethod) queryParams.append('paymentMethod', filters.paymentMethod);

      const url = `/api/cash-flow${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiRequest(url);
      setCashFlows(response.data || []);
    } catch (err) {
      console.error('Error al cargar movimientos:', err);
    }
  };

  const openCashRegister = async (initialAmount, notes, cashBreakdown = []) => {
    setSaving(true);
    setError('');
    try {
      const response = await apiRequest('/api/cash-register/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          initialAmount, 
          notes,
          cashBreakdown
        })
      });
      
      setCashRegister(response.data);
      setShowOpenModal(false);
      setSuccess('Caja abierta exitosamente');
      setTimeout(() => setSuccess(''), 3000);
      
      await loadDailySummary();
      await loadCashFlows();
    } catch (err) {
      setError(err.message || 'Error al abrir la caja');
    } finally {
      setSaving(false);
    }
  };

  const closeCashRegister = async (finalAmount, notes, cashBreakdown = []) => {
    setSaving(true);
    setError('');
    try {
      // ✅ NUEVO: Guardar el último resumen antes de cerrar
      if (dailySummary) {
        setLastClosedSummary({
          ...dailySummary,
          initialAmount: cashRegister?.initialAmount || 0,
          closingDate: new Date().toISOString()
        });
      }

      const response = await apiRequest('/api/cash-register/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          finalAmount, 
          notes,
          cashBreakdown
        })
      });
      
      setCashRegister(response.data);
      setShowCloseModal(false);
      setSuccess('Caja cerrada exitosamente');
      setTimeout(() => setSuccess(''), 3000);
      
      setDailySummary(null);
      setCashFlows([]);
    } catch (err) {
      setError(err.message || 'Error al cerrar la caja');
    } finally {
      setSaving(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return {
    cashRegister,
    dailySummary,
    lastClosedSummary, 
    cashFlows,
    loading,
    error,
    success,
    showOpenModal,
    showCloseModal,
    saving,
    filters,
    setShowOpenModal,
    setShowCloseModal,
    openCashRegister,
    closeCashRegister,
    handleFilterChange,
    loadCashFlows
  };
}