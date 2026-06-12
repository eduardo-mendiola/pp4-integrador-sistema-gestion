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
import SalesListPage from '../pages/sales/SalesListPage/SalesListPage.jsx';
import UsersPage from '../pages/users/UsersPage.jsx';
import RolesPage from '../pages/roles/RolesPage.jsx';
import EmpleadosPage from '../pages/empleados/EmpleadosPage.jsx';
import ProveedoresPage from '../pages/proveedores/ProveedoresPage.jsx';
import PagosMetodosPage from '../pages/pagos/PagosMetodosPage.jsx';
import PromocionsPage from '../pages/promociones/PromocionsPage.jsx';
import DescuentosPage from '../pages/promociones/DescuentosPage.jsx';
import StockPage from '../pages/products/StockPage.jsx';
import NewSalesPage from '../pages/sales/NewSalesPage/NewSalePage.jsx';
import ReportesPage from '../pages/ReportesPage.jsx';
import ConfiguracionPage from '../pages/ConfiguracionPage.jsx';

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
        
        {/* Usuarios */}
        <Route path="usuarios" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
        <Route path="roles" element={<ProtectedRoute><RolesPage /></ProtectedRoute>} />
        <Route path="empleados" element={<ProtectedRoute><EmpleadosPage /></ProtectedRoute>} />
        
        {/* Clientes */}
        <Route path="clientes" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
        
        {/* Ventas */}
        <Route path="ventas" element={<ProtectedRoute><SalesListPage /></ProtectedRoute>} />
        <Route path="ventas/nueva" element={<ProtectedRoute><NewSalesPage /></ProtectedRoute>} />
        <Route path="ventas/pagos" element={<ProtectedRoute><SalesListPage /></ProtectedRoute>} />
        
        {/* Productos */}
        <Route path="productos" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
        <Route path="productos/stock" element={<ProtectedRoute><StockPage /></ProtectedRoute>} />
        <Route path="categorias" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
        
        {/* Proveedores */}
        <Route path="proveedores" element={<ProtectedRoute><ProveedoresPage /></ProtectedRoute>} />
        
        {/* Pagos */}
        <Route path="pagos/metodos" element={<ProtectedRoute><PagosMetodosPage /></ProtectedRoute>} />
        
        {/* Promociones */}
        <Route path="promociones" element={<ProtectedRoute><PromocionsPage /></ProtectedRoute>} />
        <Route path="promociones/descuentos" element={<ProtectedRoute><DescuentosPage /></ProtectedRoute>} />
        
        {/* Reportes */}
        <Route path="reportes" element={<ProtectedRoute><ReportesPage /></ProtectedRoute>} />
        
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