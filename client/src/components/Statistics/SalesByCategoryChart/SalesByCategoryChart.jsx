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

const categoryColors = [
  '#84A3D3',
  '#28a745',
  '#ffc107',
  '#dc3545',
  '#6f42c1',
  '#fd7e14',
  '#17a2b8',
  '#e83e8c',
  '#20c997',
  '#6610f2'
];

export default function SalesByCategoryChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="chart-container">
        <h3>Ventas por Categoría</h3>
        <div className="chart-empty">No hay datos para mostrar</div>
      </div>
    );
  }

  const labels = Object.keys(data);
  const values = Object.values(data).map(item => item.total);
  const counts = Object.values(data).map(item => item.count);
  const colors = labels.map((_, index) => categoryColors[index % categoryColors.length]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Ingresos ($)',
        data: values,
        backgroundColor: colors,
        borderColor: colors.map(c => c),
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const options = {
    indexAxis: 'y',
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
            return labels[index];
          },
          label: function(context) {
            const index = context.dataIndex;
            return [
              `Ingresos: $${formatCurrency(values[index])}`,
              `Unidades: ${counts[index]}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
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
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 13 },
          color: '#333',
          autoSkip: false
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <h3>Ventas por Categoría</h3>
      <div className="chart-wrapper" style={{ height: `${Math.max(300, labels.length * 45)}px` }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}