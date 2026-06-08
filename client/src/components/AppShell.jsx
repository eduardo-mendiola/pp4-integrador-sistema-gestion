import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar.jsx';
import Header from './Header/Header.jsx';
import ProductModal from './ProductModal/ProductModal.jsx';

export default function AppShell() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="app-shell">
      <Header onProductSelect={setSelectedProduct} />
      <Sidebar />

      <main className="main-area">
        <Outlet />
      </main>

      {/* El modal se renderiza AQUÍ, fuera del header */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}