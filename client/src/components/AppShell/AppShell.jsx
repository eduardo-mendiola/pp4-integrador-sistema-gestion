import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar.jsx';
import Header from '../Header/Header.jsx';
import ProductModal from '../ProductModal/ProductModal.jsx';
import { FiChevronRight } from 'react-icons/fi';  
import './AppShell.css';

export default function AppShell() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Header onProductSelect={setSelectedProduct} />
      
      {/* Solo se muestra cuando el sidebar está CERRADO */}
      {!sidebarOpen && (
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
          title="Abrir menú"
        >
          <FiChevronRight />
        </button>
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main-area">
        <Outlet />
      </main>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}