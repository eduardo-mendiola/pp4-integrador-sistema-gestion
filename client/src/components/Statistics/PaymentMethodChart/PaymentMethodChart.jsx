import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import '../EvolutionChart/EvolutionChart.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const formatCurrency = (value) => {
  return (value || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 });
};

const paymentMethodLabels = {
  cash: 'Efectivo',
  debit_card: 'Débito',
  credit_card: 'Crédito',
  transfer: 'Transferencia'
};

const paymentMethodColors = {
  cash: '#28a745',
  debit_card: '#007bff',
  credit_card: '#6f42c1',
  transfer: '#fd7e14'
};

export default function PaymentMethodChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="chart-container">
        <h3>Ventas por Método de Pago</h3>
        <div className="chart-empty">No hay datos para mostrar</div>
      </div>
    );
  }

  const labels = Object.keys(data).map(key => paymentMethodLabels[key] || key);
  const values = Object.values(data).map(item => item.total);
  const counts = Object.values(data).map(item => item.count);
  const colors = Object.keys(data).map(key => paymentMethodColors[key] || '#6c757d');

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 8
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 16,
          font: { size: 13 },
          color: '#333',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            const index = context.dataIndex;
            const value = values[index];
            const count = counts[index];
            const total = values.reduce((sum, v) => sum + v, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return [
              `Total: $${formatCurrency(value)}`,
              `Ventas: ${count}`,
              `Porcentaje: ${percentage}%`
            ];
          }
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <h3>Ventas por Método de Pago</h3>
      <div className="chart-wrapper">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}