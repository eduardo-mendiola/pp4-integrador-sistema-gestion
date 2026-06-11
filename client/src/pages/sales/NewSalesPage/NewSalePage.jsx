import React, { useEffect } from 'react';
import useSalesLogic from './useSalesLogic';
import useClientLogic from './useClientLogic';
import ProductSearchBar from '../../../components/Sales/ProductSearchBar/ProductSearchBar';
import CartTable from '../../../components/Sales/CartTable/CartTable';
import ProductDetailsPanel from '../../../components/Sales/ProductDetailsPanel/ProductDetailsPanel';
import SalesFooter from '../../../components/Sales/SalesFooter/SalesFooter';
import SalesMessage from '../../../components/Sales/SalesMessage/SalesMessage';
import ClientModal from '../../../components/Sales/ClientModal/ClientModal';
import PaymentMethodModal from '../../../components/Sales/PaymentMethodModal/PaymentMethodModal';
import PaymentProcessModal from '../../../components/Sales/PaymentProcessModal/PaymentProcessModal';
import ReceiptModal from '../../../components/Sales/ReceiptModal/ReceiptModal';
import './NewSalePage.css';

export default function NewSalePage() {
  const sales = useSalesLogic();
  const client = useClientLogic();

  useEffect(() => {
    const mainArea = document.querySelector('.main-area');
    if (mainArea) mainArea.classList.add('no-padding');
    return () => {
      if (mainArea) mainArea.classList.remove('no-padding');
    };
  }, []);

  const handlePayClick = () => {
    if (sales.cartItems.length === 0) {
      sales.setMessage({ type: 'error', text: 'Agrega productos al carrito' });
      return;
    }
    if (!client.selectedClient) {
      sales.setMessage({ type: 'error', text: 'Seleccione un cliente para continuar' });
      return;
    }
    sales.openPaymentModal();
  };

  const handleProcessPayment = async (paymentData) => {
    const result = await sales.processPayment(
      client.selectedClient,
      sales.selectedPaymentMethod,
      paymentData
    );
    
    if (result.success) {
      // Aquí en FASE 3 abriremos el modal de comprobante
      console.log('Pago procesado exitosamente:', result.sale);
    }
  };

  return (
    <div className="sales-container">
      <ProductSearchBar
        searchQuery={sales.searchQuery}
        onSearchChange={sales.handleSearch}
        filteredProducts={sales.filteredProducts}
        onProductSelect={sales.addToCart}
        showResults={sales.showSearchResults}
        selectedClient={client.selectedClient}
        onAddClient={() => client.openModal('search')}
        onViewClient={client.viewClient}
        onEditClient={client.editClient}
        onChangeClient={client.changeClient}
        onClearClient={client.clearClient}
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
        />
      </div>

      <SalesFooter
        totals={sales.totals}
        itemsCount={sales.cartItems.length}
        loading={sales.loading}
        onCancel={sales.clearSale}
        onPay={handlePayClick}
      />

      <ClientModal
        isOpen={client.isModalOpen}
        mode={client.modalMode}
        client={client.selectedClient}
        clients={client.clients}
        loading={client.loadingClients}
        saving={client.saving}
        onClose={client.closeModal}
        onSelect={client.selectClient}
        onCreate={client.createClient}
        onUpdate={client.updateClient}
        onModeChange={client.setModalMode}
      />

      <PaymentMethodModal
        isOpen={sales.showPaymentModal}
        onClose={() => sales.setShowPaymentModal(false)}
        onSelectMethod={sales.handleSelectPaymentMethod}
        total={sales.totals.total}
      />

      <PaymentProcessModal
        isOpen={sales.showPaymentProcessModal}
        method={sales.selectedPaymentMethod}
        total={sales.totals.total}
        client={client.selectedClient}
        items={sales.cartItems}
        loading={sales.loading}
        onClose={sales.closePaymentProcessModal}
        onProcess={handleProcessPayment}
      />

      <ReceiptModal
        isOpen={sales.showReceiptModal}
        sale={sales.lastSale}
        onNewSale={sales.handleNewSale}
        onClose={() => sales.setShowReceiptModal(false)}
      />
    </div>
  );
}