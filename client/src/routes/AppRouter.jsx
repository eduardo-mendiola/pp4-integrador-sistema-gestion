import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { moduleCards } from '../config/modules.js';
import AccessDeniedPage from '../pages/AccessDeniedPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import ProductsPage from '../pages/products/ProductsPage.jsx';
import CategoriesPage from '../pages/categories/CategoriesPage.jsx';
import ClientsPage from '../pages/clients/ClientsPage.jsx';
import SalesPage from '../pages/sales/SalesPage.jsx';
import UsersPage from '../pages/users/UsersPage.jsx';

const pageByKey = {
  products: ProductsPage,
  categories: CategoriesPage,
  clients: ClientsPage,
  sales: SalesPage,
  users: UsersPage
};

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
        {moduleCards
          .filter((module) => module.key !== 'dashboard')
          .map((module) => {
            const Page = pageByKey[module.key];

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
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}