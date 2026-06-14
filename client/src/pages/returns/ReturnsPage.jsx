import React, { useEffect } from 'react';
import useReturnsLogic from './useReturnsLogic';
import ReturnsSearchPanel from '../../components/Returns/ReturnsSearchPanel';
import OriginalSaleDetails from '../../components/Returns/OriginalSaleDetails';
import OperationPanel from '../../components/Returns/OperationPanel';
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
    originalSale,
    returnItems,
    exchangeItems,
    operationType,
    setOperationType,
    returnReason,
    setReturnReason,
    error,
    performSearch,
    clearFilters,
    selectSale,
    cancelOperation,
    toggleSelectionMode,
    updateReturnQuantity,
    addExchangeItem,
    updateExchangeQuantity,
    totals
  } = useReturnsLogic();

  useEffect(() => {
    if (currentStep === 'operation') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const mainArea = document.querySelector('.main-area');
      if (mainArea) {
        mainArea.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [currentStep]);

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
          />
          
          <OperationPanel
            operationType={operationType}
            setOperationType={setOperationType}
            returnReason={returnReason}
            setReturnReason={setReturnReason}
            exchangeItems={exchangeItems}
            onAddExchangeItem={addExchangeItem}
            onUpdateExchangeQuantity={updateExchangeQuantity}
            totals={totals}
          />
        </div>
      )}
    </div>
  );
}