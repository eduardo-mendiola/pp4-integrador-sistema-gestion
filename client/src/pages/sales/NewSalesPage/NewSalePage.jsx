import React, { useEffect } from 'react';
import useSalesLogic from './useSalesLogic';
import ProductSearchBar from '../../../components/Sales/ProductSearchBar/ProductSearchBar';
import CartTable from '../../../components/Sales/CartTable/CartTable';
import ProductDetailsPanel from '../../../components/Sales/ProductDetailsPanel/ProductDetailsPanel';
import SalesFooter from '../../../components/Sales/SalesFooter/SalesFooter';
import SalesMessage from '../../../components/Sales/SalesMessage/SalesMessage';
import './NewSalePage.css';

export default function NewSalePage() {
  const sales = useSalesLogic();

  // Eliminar padding del main-area para usar todo el espacio
  useEffect(() => {
    const mainArea = document.querySelector('.main-area');

    if (mainArea) {
      mainArea.classList.add('no-padding');
    }

    return () => {
      if (mainArea) {
        mainArea.classList.remove('no-padding');
      }
    };
  }, []);

  return (
    <div className="sales-container">
      <ProductSearchBar
        searchQuery={sales.searchQuery}
        onSearchChange={sales.handleSearch}
        customerName={sales.customerName}
        onCustomerChange={sales.setCustomerName}
        filteredProducts={sales.filteredProducts}
        onProductSelect={sales.addToCart}
        showResults={sales.showSearchResults}
      />

      <SalesMessage
        message={sales.message}
        onClose={() => sales.setMessage('')}
      />

      <div className="sales-main-content">
        <CartTable
          items={sales.cartItems}
          selectedItemId={sales.selectedItem?._id}
          editingQuantities={sales.editingQuantities}
          onSelectItem={sales.selectItem}
          onRemoveItem={sales.removeFromCart}
          onQuantityFocus={sales.handleQuantityFocus}
          onQuantityChange={sales.handleQuantityChange}
          onQuantityBlur={sales.handleQuantityBlur}
          onQuantityKeyDown={sales.handleQuantityKeyDown}
        />

        <ProductDetailsPanel
          selectedItem={sales.selectedItem}
          loading={sales.loading}
          onPayment={sales.processPayment}
          onCheckStock={() => console.log('Check stock clicked')}
        />
      </div>

      <SalesFooter
        totals={sales.totals}
        itemsCount={sales.cartItems.length}
        loading={sales.loading}
        onCancel={sales.clearSale}
        onPay={() => sales.processPayment('cash')}
      />
    </div>
  );
}