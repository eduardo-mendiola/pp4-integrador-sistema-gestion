import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardStyles.css';

const DashboardPage = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Ventas",
      items: [
        { label: "VENTAS", path: "/ventas", color: "blue-card" },
        { label: "CLIENTES", path: "/clientes", color: "blue-card" },
        { label: "CAMBIOS Y DEVOLUCIONES", path: "/devoluciones", color: "blue-card" },
      ]
    },
    {
      title: "Caja",
      items: [
        { label: "FLUJO DE CAJA", path: "/caja", color: "green-card" },
        { label: "COMPROBANTE INTERNO", path: "/comprobantes", color: "green-card" },
      ]
    },
    {
      title: "Consultas",
      items: [
        { label: "PRODUCTOS", path: "/productos", color: "cyan-card" },
        { label: "GENERAR REPORTES", path: "/reportes", color: "cyan-card" },
      ]
    },
    {
      title: "Mercadería",
      items: [
        { label: "PROVEEDORES", path: "/proveedores", color: "orange-card" },
        { label: "INGRESOS", path: "/ingresos", color: "orange-card" },
        { label: "EGRESOS", path: "/egresos", color: "orange-card" },
      ]
    }
  ];

  return (
    <div className="dashboard-container">
      {sections.map((section, idx) => (
        <div key={idx} className="dashboard-section">
          <h2 className="section-title">{section.title}</h2>
          <div className="cards-grid">
            {section.items.map((item, i) => (
              <div 
                key={i} 
                className={`dashboard-card ${item.color}`}
                onClick={() => navigate(item.path)}
              >
                <span className="card-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardPage;
