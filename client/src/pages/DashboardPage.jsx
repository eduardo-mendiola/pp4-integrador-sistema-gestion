import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '../hooks/usePermission';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();

  const sections = [
    {
      title: "Ventas",
      items: [
        { label: "VENTAS", path: "/ventas/nueva", color: "blue-card", permission: "create_sales" },
        { label: "CLIENTES", path: "/clientes", color: "blue-card", permission: "view_clients" },
        { label: "CAMBIOS Y DEVOLUCIONES", path: "/ventas/devoluciones", color: "blue-card", permission: "edit_sales" },
      ]
    },
    {
      title: "Caja",
      items: [
        { label: "MOVIMIENTOS", path: "/caja/movimientos", color: "green-card", permission: "view_cash_flow" },
        { label: "COMPROBANTES", path: "/caja/reportes", color: "green-card", permission: "view_internal_vouchers" },
      ]
    },
    {
      title: "Consultas",
      items: [
        { label: "PRODUCTOS", path: "/productos", color: "cyan-card", permission: "view_products" },
        { label: "GENERAR REPORTES", path: "/estadisticas", color: "cyan-card", permission: "view_reports" },
      ]
    },
    {
      title: "Mercadería",
      items: [
        { label: "PROVEEDORES", path: "/proveedores", color: "orange-card", permission: "view_suppliers" },
        { label: "INGRESOS", path: "/proveedores/ingresos", color: "orange-card", permission: "view_supplier_payments" },
        { label: "EGRESOS", path: "/proveedores/egresos", color: "orange-card", permission: "view_supplier_payments" },
      ]
    }
  ];

  // Filtrar secciones e items según permisos
  const visibleSections = sections
    .map(section => ({
      ...section,
      items: section.items.filter(item => hasPermission(item.permission))
    }))
    .filter(section => section.items.length > 0); // Ocultar secciones vacías

  return (
    <div className="dashboard-container">
      {visibleSections.map((section, idx) => (
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