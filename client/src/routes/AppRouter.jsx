import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../components/AppShell/AppShell.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { moduleCards } from '../config/modules.js';
import AccessDeniedPage from '../pages/AccessDeniedPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import ProductsPage from '../pages/products/ProductsPage.jsx';
import CategoriesPage from '../pages/categories/CategoriesPage.jsx';
import ClientsPage from '../pages/clients/ClientsPage.jsx';
import CashRegisterPage from '../pages/cashRegisterPage/CashRegisterPage/CashRegisterPage.jsx';
import MovementsPage from '../pages/cashRegisterPage/MovementsPage/MovementsPage.jsx';
import SalesListPage from '../pages/sales/SalesListPage/SalesListPage.jsx';
import UsersPage from '../pages/access/UsersPage/UsersPage.jsx';
import EmployeesPage from '../pages/personal/EmployeesPage/EmployeesPage.jsx';
import PersonsPage from '../pages/personal/PersonsPage/PersonsPage.jsx';
import RolesPage from '../pages/access/RolesPage/RolesPage.jsx';
import SuppliersPage from '../pages/suppliers/SuppliersPage.jsx';
import UnderConstructionPage from '../pages/UnderConstructionPage/UnderConstructionPage.jsx';
import PromocionsPage from '../pages/promotions/PromocionsPage.jsx';
import DescuentosPage from '../pages/discount-rules/DiscountRulesPage.jsx';
import DiscountRuleFormPage from '../pages/discount-rules/DiscountRuleFormPage.jsx';
import StockPage from '../pages/products/StockPage.jsx';
import NewSalesPage from '../pages/sales/NewSalesPage/NewSalePage.jsx';
import ReturnsPage from '../pages/returns/ReturnsPage.jsx'; 
import ReportsPage from '../pages/cashRegisterPage/Reports/ReportsPage.jsx';
import StatisticsPage from '../pages/statisticsPage/StatisticsPage.jsx';
import ConfiguracionPage from '../pages/ConfiguracionPage/ConfiguracionPage.jsx';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/acceso-denegado" element={<AccessDeniedPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Acceso */}
        <Route path="usuarios" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
        <Route path="roles" element={<ProtectedRoute><RolesPage /></ProtectedRoute>} />

        {/* Personal */}
        <Route path="empleados" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />
        <Route path="/datos-personales" element={<PersonsPage />} />
        
        {/* Clientes */}
        <Route path="clientes" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />

        {/* Caja */}
        <Route path="caja/estado" element={<ProtectedRoute><CashRegisterPage /></ProtectedRoute>} />
        <Route path="caja/movimientos" element={<ProtectedRoute><MovementsPage /></ProtectedRoute>} />
        <Route path="caja/reportes" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        
        {/* Ventas */}
        <Route path="ventas" element={<ProtectedRoute><SalesListPage /></ProtectedRoute>} />
        <Route path="ventas/nueva" element={<ProtectedRoute><NewSalesPage /></ProtectedRoute>} />
        <Route path="ventas/devoluciones" element={<ProtectedRoute><ReturnsPage /></ProtectedRoute>} /> 
        
        {/* Productos */}
        <Route path="productos" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
        <Route path="productos/stock" element={<ProtectedRoute><StockPage /></ProtectedRoute>} />
        <Route path="categorias" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
        
        {/* Proveedores */}
        <Route path="proveedores" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
        <Route path="proveedores/egresos" element={<ProtectedRoute><UnderConstructionPage /></ProtectedRoute>} />
        <Route path="proveedores/ingresos" element={<ProtectedRoute><UnderConstructionPage /></ProtectedRoute>} />
        
        {/* Pagos */}
        <Route path="pagos/proveedores" element={<ProtectedRoute><UnderConstructionPage /></ProtectedRoute>} />
        
        {/* Promociones */}
        <Route path="promociones" element={<ProtectedRoute><PromocionsPage /></ProtectedRoute>} />
        <Route path="promociones/descuentos" element={<ProtectedRoute><DescuentosPage /></ProtectedRoute>} />
        <Route path="promociones/descuentos/nuevo" element={<ProtectedRoute><DiscountRuleFormPage /></ProtectedRoute>} />
        <Route path="promociones/descuentos/:id/editar" element={<ProtectedRoute><DiscountRuleFormPage /></ProtectedRoute>} />
        
        {/* Estadisticas */}
        <Route path="estadisticas" element={<ProtectedRoute><StatisticsPage /></ProtectedRoute>} />
        
        {/* Configuración */}
        <Route path="configuracion" element={<ProtectedRoute><ConfiguracionPage /></ProtectedRoute>} />
        
        {/* Módulos dinámicos del moduleCards */}
        {moduleCards
          .filter((module) => module.key !== 'dashboard')
          .map((module) => {
            const PageMap = {
              products: ProductsPage,
              categories: CategoriesPage,
              clients: ClientsPage,
              sales: SalesListPage,
              users: UsersPage
            };
            const Page = PageMap[module.key];
            
            if (!Page) return null;

            return (
              <Route
                key={module.key}
                path={module.path.replace(/^\//, '')}
                element={
                  <ProtectedRoute allowedRoles={module.allowedRoles}>
                    <Page />
                  </ProtectedRoute>
                }
              />
            );
          })}

        {/* Catch-all dentro del AppShell */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}