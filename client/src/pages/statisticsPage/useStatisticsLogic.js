import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api.js';
import { exportToExcel } from '../../utils/exportToExcel';
import { exportToCSV } from '../../utils/exportToCSV';
import { exportReportToPDF } from '../../utils/exportReportToPDF';

const paymentMethodLabels = {
  cash: 'Efectivo',
  debit_card: 'Débito',
  credit_card: 'Crédito',
  transfer: 'Transferencia'
};

const statusLabels = {
  PAID: 'Pagada',
  PENDING: 'Pendiente',
  CANCELLED: 'Anulada'
};

export default function useStatisticsLogic() {
  const [statisticsData, setStatisticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [period, setPeriod] = useState('month');
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

  // ==========================================
  // FUNCIONES DE EXPORTACIÓN
  // ==========================================

  const handleExportPDF = async (element) => {
    if (!element) return;
    await exportReportToPDF(element, 'dashboard_estadisticas');
  };

  const handleExportExcel = () => {
    if (!statisticsData) return;

    const { kpis, evolution, byPaymentMethod, topProducts, byHour, byStatus, byCategory } = statisticsData;

    // Hoja 1: KPIs
    const kpisData = [
      { 'Indicador': 'Total Facturado', 'Actual': kpis.totalRevenue.current, 'Anterior': kpis.totalRevenue.previous, 'Variación (%)': kpis.totalRevenue.variation.toFixed(2) },
      { 'Indicador': 'Cantidad de Ventas', 'Actual': kpis.salesCount.current, 'Anterior': kpis.salesCount.previous, 'Variación (%)': kpis.salesCount.variation.toFixed(2) },
      { 'Indicador': 'Ticket Promedio', 'Actual': kpis.averageTicket.current, 'Anterior': kpis.averageTicket.previous, 'Variación (%)': kpis.averageTicket.variation.toFixed(2) },
      { 'Indicador': 'Unidades Vendidas', 'Actual': kpis.unitsSold.current, 'Anterior': '-', 'Variación (%)': '-' },
      { 'Indicador': 'Clientes Únicos', 'Actual': kpis.uniqueClients.current, 'Anterior': '-', 'Variación (%)': '-' }
    ];

    // Hoja 2: Evolución diaria
    const evolutionData = evolution.map(item => ({
      'Fecha': item.date,
      'Total ($)': item.total,
      'Cantidad de Ventas': item.count
    }));

    // Hoja 3: Métodos de pago
    const paymentData = Object.entries(byPaymentMethod).map(([method, data]) => ({
      'Método': paymentMethodLabels[method] || method,
      'Cantidad': data.count,
      'Total ($)': data.total
    }));

    // Hoja 4: Top productos
    const productsData = topProducts.map(p => ({
      'Ranking': p.rank,
      'Producto': p.name,
      'SKU': p.sku,
      'Cantidad': p.totalQuantity,
      'Ingresos ($)': p.totalRevenue
    }));

    // Hoja 5: Ventas por hora
    const hourData = byHour.map(h => ({
      'Hora': h.label,
      'Cantidad': h.count,
      'Total ($)': h.total
    }));

    // Hoja 6: Estado de ventas
    const statusData = Object.entries(byStatus).map(([status, data]) => ({
      'Estado': statusLabels[status] || status,
      'Cantidad': data.count,
      'Total ($)': data.total
    }));

    // Hoja 7: Ventas por categoría
    const categoryData = Object.entries(byCategory).map(([category, data]) => ({
      'Categoría': category,
      'Unidades': data.count,
      'Total ($)': data.total
    }));

    exportToExcel(
      {
        'KPIs': kpisData,
        'Evolución Diaria': evolutionData,
        'Métodos de Pago': paymentData,
        'Top Productos': productsData,
        'Ventas por Hora': hourData,
        'Estado de Ventas': statusData,
        'Ventas por Categoría': categoryData
      },
      'dashboard_estadisticas'
    );
  };

  const handleExportCSV = () => {
    if (!statisticsData) return;

    const { kpis, evolution, byPaymentMethod, topProducts } = statisticsData;

    // Generar CSV con todas las secciones
    const lines = [];
    
    lines.push('=== KPIs ===');
    lines.push('Indicador,Actual,Anterior,Variación (%)');
    lines.push(`Total Facturado,${kpis.totalRevenue.current},${kpis.totalRevenue.previous},${kpis.totalRevenue.variation.toFixed(2)}`);
    lines.push(`Cantidad de Ventas,${kpis.salesCount.current},${kpis.salesCount.previous},${kpis.salesCount.variation.toFixed(2)}`);
    lines.push(`Ticket Promedio,${kpis.averageTicket.current},${kpis.averageTicket.previous},${kpis.averageTicket.variation.toFixed(2)}`);
    lines.push(`Unidades Vendidas,${kpis.unitsSold.current},-,`);
    lines.push(`Clientes Únicos,${kpis.uniqueClients.current},-,`);
    lines.push('');
    
    lines.push('=== Evolución Diaria ===');
    lines.push('Fecha,Total,Cantidad');
    evolution.forEach(item => {
      lines.push(`${item.date},${item.total},${item.count}`);
    });
    lines.push('');
    
    lines.push('=== Métodos de Pago ===');
    lines.push('Método,Cantidad,Total');
    Object.entries(byPaymentMethod).forEach(([method, data]) => {
      lines.push(`${paymentMethodLabels[method] || method},${data.count},${data.total}`);
    });
    lines.push('');
    
    lines.push('=== Top Productos ===');
    lines.push('Ranking,Producto,SKU,Cantidad,Ingresos');
    topProducts.forEach(p => {
      lines.push(`${p.rank},"${p.name}",${p.sku},${p.totalQuantity},${p.totalRevenue}`);
    });

    const csvContent = lines.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard_estadisticas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    handleCustomDateChange,
    handleExportPDF,
    handleExportExcel,
    handleExportCSV
  };
}