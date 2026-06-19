import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import '../EvolutionChart/EvolutionChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const formatCurrency = (value) => {
  return (value || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 });
};

export default function SalesByHourChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>Ventas por Hora del Día</h3>
        <div className="chart-empty">No hay datos para mostrar</div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: 'Ventas ($)',
        data: data.map(item => item.total),
        backgroundColor: 'rgba(40, 167, 69, 0.7)',
        borderColor: '#28a745',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        callbacks: {
          title: function(context) {
            const index = context[0].dataIndex;
            return `${data[index].label} hs`;
          },
          label: function(context) {
            const index = context.dataIndex;
            const hourData = data[index];
            return [
              `Total: $${formatCurrency(hourData.total)}`,
              `Ventas: ${hourData.count}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 11 },
          color: '#6c757d',
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: { size: 12 },
          color: '#6c757d',
          callback: function(value) {
            return '$' + formatCurrency(value);
          }
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <h3>Ventas por Hora del Día</h3>
      <div className="chart-wrapper">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}