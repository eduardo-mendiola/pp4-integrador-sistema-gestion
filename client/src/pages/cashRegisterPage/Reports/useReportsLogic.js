import { useState } from 'react';
import { apiRequest } from '../../../services/api.js';

export default function useReportsLogic() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0]
  });

  const selectReport = (reportType) => {
    setSelectedReport(reportType);
    setReportData(null);
    setError('');
  };

  // Limpia la selección y los datos del reporte
  const clearSelection = () => {
    setSelectedReport(null);
    setReportData(null);
    setError('');
  };

  const generateReport = async () => {
    if (!selectedReport) return;
    
    setLoading(true);
    setError('');
    
    try {
      const queryParams = new URLSearchParams();
      if (filters.dateFrom) queryParams.append('from', filters.dateFrom);
      if (filters.dateTo) queryParams.append('to', filters.dateTo);

      const url = `/api/reports/${selectedReport}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiRequest(url);
      setReportData(response.data || response);
    } catch (err) {
      console.error('Error generando reporte:', err);
      setError('Error al generar el reporte: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedReport,
    reportData,
    loading,
    error,
    filters,
    setFilters,
    selectReport,
    clearSelection,
    generateReport
  };
}