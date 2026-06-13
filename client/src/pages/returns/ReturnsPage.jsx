import React from 'react';
import useReturnsLogic from './useReturnsLogic';
import ReturnsSearchPanel from '../../components/Returns/ReturnsSearchPanel';
import OriginalSaleDetails from '../../components/Returns/OriginalSaleDetails';
import './ReturnsPage.css';

export default function ReturnsPage() {
  const {
    currentStep,
    searchFilters,
    setSearchFilters,
    searchResults,
    isSearching,
    hasSearched,       // ✅ NUEVO
    originalSale,
    returnItems,
    error,
    performSearch,
    clearFilters,      // ✅ NUEVO
    selectSale,
    cancelOperation,
    updateReturnQuantity
  } = useReturnsLogic();

  return (
    <div className="returns-container">
      <div className="returns-header">
        <h1>Devoluciones y Cambios</h1>
        {currentStep === 'operation' && (
          <button className="cancel-operation-btn" onClick={cancelOperation}>
            ✕ Cancelar y Volver
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
          />
          
          <div className="operation-placeholder">
            <h3>Próximo paso: Selección de Método y Productos Nuevos</h3>
          </div>
        </div>
      )}
    </div>
  );
}