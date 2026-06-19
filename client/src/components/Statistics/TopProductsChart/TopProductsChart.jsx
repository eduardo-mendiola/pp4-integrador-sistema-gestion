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

export default function TopProductsChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>Top 10 Productos Más Vendidos</h3>
        <div className="chart-empty">No hay datos para mostrar</div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: data.map(item => item.totalQuantity),
        backgroundColor: 'rgba(132, 163, 211, 0.8)',
        borderColor: '#84A3D3',
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
            return data[index].name;
          },
          label: function(context) {
            const index = context.dataIndex;
            const product = data[index];
            return [
              `Cantidad: ${product.totalQuantity}`,
              `Ingresos: $${formatCurrency(product.totalRevenue)}`,
              `SKU: ${product.sku}`
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
          color: '#6c757d'
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 12 },
          color: '#333',
          autoSkip: false
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <h3>Top 10 Productos Más Vendidos</h3>
      <div className="chart-wrapper" style={{ height: `${Math.max(300, data.length * 40)}px` }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}