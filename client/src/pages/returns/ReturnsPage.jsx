import React, { useEffect, useState } from 'react';
import useReturnsLogic from './useReturnsLogic';
import ReturnsSearchPanel from '../../components/Returns/ReturnsSearchPanel';
import OriginalSaleDetails from '../../components/Returns/OriginalSaleDetails';
import OperationPanel from '../../components/Returns/OperationPanel';
import ReturnDetailModal from '../../components/Returns/ReturnDetailModal';
import ReturnReceiptModal from '../../components/Returns/ReturnReceiptModal';
import PaymentMethodModal from '../../components/Sales/PaymentMethodModal/PaymentMethodModal';
import PaymentProcessModal from '../../components/Sales/PaymentProcessModal/PaymentProcessModal';
import './ReturnsPage.css';

export default function ReturnsPage() {
  const {
    currentStep,
    selectionMode,
    searchFilters,
    setSearchFilters,
    searchResults,
    isSearching,
    hasSearched,
    loading,
    operationCompleted,
    originalSale,
    returnItems,
    exchangeItems,
    operationType,
    setOperationType,
    returnReason,
    setReturnReason,
    customReason,
    setCustomReason,
    error,
    warning,
    performSearch,
    clearFilters,
    selectSale,
    cancelOperation,
    toggleSelectionMode,
    updateReturnQuantity,
    addExchangeItem,
    exchangeItemDiscounts,
    exchangeDiscountRate,
    setExchangeDiscountRate,
    editingExchangeQuantities,
    removeExchangeItem,
    toggleExchangeItemActive,
    handleExchangeQuantityFocus,
    handleExchangeQuantityChange,
    handleExchangeQuantityBlur,
    handleExchangeQuantityKeyDown,
    setExchangeItemDiscount,
    updateExchangeQuantity,
    processReturn,
    totals
  } = useReturnsLogic();

  const [selectedReturn, setSelectedReturn] = useState(null);
  const [completedData, setCompletedData] = useState(null); 
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  // Estados para el flujo de pago
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showPaymentProcessModal, setShowPaymentProcessModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  useEffect(() => {
    if (currentStep === 'operation') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const mainArea = document.querySelector('.main-area');
      if (mainArea) {
        mainArea.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [currentStep]);

  const handleViewReturnDetail = (returnData) => {
    setSelectedReturn(returnData);
  };

  const handleCloseReturnDetail = () => {
    setSelectedReturn(null);
  };

  // Cuando el usuario hace clic en "Procesar Operación"
  const handleProcessClick = async () => {
    if (totals.difference > 0) {
      // El cliente debe pagar: abrir modal de método de pago
      setShowPaymentMethodModal(true);
    } else {
      // No hay nada que cobrar (o hay que devolver): procesar directo asumiendo efectivo
      const result = await processReturn('6a2a413493ebd9bb34545eeb', 'Devolución/Cambio en efectivo');
      if (result.success) {
        setCompletedData(result.data);
        setShowReceiptModal(true);
      }
    }
  };

  // Cuando se selecciona el método de pago
  const handleSelectPaymentMethod = (method) => {
    setSelectedPaymentMethod(method);
    setShowPaymentMethodModal(false);
    setShowPaymentProcessModal(true);
  };

  // Cuando se completa el proceso de pago
  const handleProcessPayment = async (paymentData) => {
    let paymentReference = '';
    if (selectedPaymentMethod === 'cash' && paymentData.amount_received) {
      paymentReference = `Recibido: $${paymentData.amount_received}, Vuelto: $${paymentData.change || 0}`;
    } else if ((selectedPaymentMethod === 'credit_card' || selectedPaymentMethod === 'debit_card') && paymentData.card_number) {
      const cleanNumber = paymentData.card_number.replace(/\s/g, "");
      paymentReference = `Tarjeta terminada en ${cleanNumber.slice(-4)}`;
    } else if (selectedPaymentMethod === 'transfer') {
      paymentReference = paymentData.transfer_reference || 'Transferencia bancaria';
    }

    const result = await processReturn(selectedPaymentMethod, paymentReference);
    
    if (result.success) {
      setShowPaymentProcessModal(false);
      setSelectedPaymentMethod(null);
      setCompletedData(result.data);
      setShowReceiptModal(true);
    }
  };

  // Manejar cierre del recibo y nueva operación
  const handleNewReturn = () => {
    setShowReceiptModal(false);
    setCompletedData(null);
    cancelOperation(); // Resetear todo el estado del hook y volver a búsqueda
  };

  const handleCloseReceipt = () => {
    setShowReceiptModal(false);
    setCompletedData(null);
    cancelOperation(); // Resetear todo el estado del hook y volver a búsqueda
  };

  return (
    <div className="returns-container">
      <div className="returns-header">
        <h1>Devoluciones y Cambios</h1>
        {currentStep === 'operation' && (
          <button className="cancel-operation-btn" onClick={cancelOperation}>
            Cancelar
          </button>
        )}
      </div>

      {currentStep === 'search' ? (
        <ReturnsSearchPanel
          filters={searchFilters}
          setFilters={setSearchFilters}
          onSearch={performSearch}
          onClear={clearFilters}
          results={searchResults}
          isSearching={isSearching}
          hasSearched={hasSearched}
          onSelect={selectSale}
          error={error}
        />
      ) : (
        <div className="operation-workspace">
          <OriginalSaleDetails
            sale={originalSale}
            returnItems={returnItems}
            onUpdateQuantity={updateReturnQuantity}
            onToggleSelectionMode={toggleSelectionMode}
            selectionMode={selectionMode}
            totals={totals}
            onViewReturnDetail={handleViewReturnDetail}
          />
          
          <OperationPanel
            operationType={operationType}
            setOperationType={setOperationType}
            returnReason={returnReason}
            setReturnReason={setReturnReason}
            customReason={customReason}
            setCustomReason={setCustomReason}
            exchangeItems={exchangeItems}
            exchangeItemDiscounts={exchangeItemDiscounts}
            exchangeDiscountRate={exchangeDiscountRate}
            setExchangeDiscountRate={setExchangeDiscountRate}
            editingExchangeQuantities={editingExchangeQuantities}
            onAddExchangeItem={addExchangeItem}
            onRemoveExchangeItem={removeExchangeItem}
            onToggleExchangeItemActive={toggleExchangeItemActive}
            onExchangeQuantityFocus={handleExchangeQuantityFocus}
            onExchangeQuantityChange={handleExchangeQuantityChange}
            onExchangeQuantityBlur={handleExchangeQuantityBlur}
            onExchangeQuantityKeyDown={handleExchangeQuantityKeyDown}
            onSetExchangeItemDiscount={setExchangeItemDiscount}
            totals={totals}
            onProcessReturn={handleProcessClick}
            loading={loading}
            error={error}
            warning={warning}
            operationCompleted={operationCompleted}
          />
        </div>
      )}

      <ReturnDetailModal
        returnData={selectedReturn}
        onClose={handleCloseReturnDetail}
      />

      {/* Modales de pago reutilizados */}
      <PaymentMethodModal
        isOpen={showPaymentMethodModal}
        onClose={() => setShowPaymentMethodModal(false)}
        onSelectMethod={handleSelectPaymentMethod}
        total={totals.difference}
      />

      <PaymentProcessModal
        isOpen={showPaymentProcessModal}
        method={selectedPaymentMethod}
        total={totals.difference}
        client={originalSale?.client_id}
        items={exchangeItems}
        loading={loading}
        onClose={() => {
          setShowPaymentProcessModal(false);
          setSelectedPaymentMethod(null);
        }}
        onProcess={handleProcessPayment}
      />

      {/* Modal de comprobante final */}
      <ReturnReceiptModal
        isOpen={showReceiptModal}
        data={completedData}
        onNewReturn={handleNewReturn}
        onClose={handleCloseReceipt}
      />
    </div>
  );
}