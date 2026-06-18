import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import useMovementsLogic from './useMovementsLogic';
import MovementsTable from '../../components/CashRegister/Movements/MovementsTable';
import MovementDetailModal from '../../components/CashRegister/Movements/MovementDetailModal';
import MovementReceiptModal from '../../components/CashRegister/Movements/MovementReceiptModal';
import './MovementsPage.css';

const typeLabels = {
  INCOME: 'Ingreso',
  EXPENSE: 'Egreso'
};

const paymentMethodLabels = {
  cash: 'Efectivo',
  debit_card: 'Débito',
  credit_card: 'Crédito',
  transfer: 'Transferencia'
};

const sourceTypeLabels = {
  SALE: 'Venta',
  RETURN: 'Devolución',
  VOUCHER: 'Comprobante',
  MANUAL: 'Manual',
  OPENING: 'Apertura',
  CLOSING: 'Cierre'
};

export default function MovementsPage() {
  const {
    movements,
    loading,
    error,
    filters,
    setFilters,
    loadMovements,
    refreshMovements
  } = useMovementsLogic();

  const [selectedMovement, setSelectedMovement] = useState(null);
  const [receiptMovement, setReceiptMovement] = useState(null);

  const handleViewDetail = (movement) => {
    setSelectedMovement(movement);
  };

  const handleCloseDetail = () => {
    setSelectedMovement(null);
  };

  const handlePrintMovement = (movement) => {
    setReceiptMovement(movement);
  };

  const handleCloseReceipt = () => {
    setReceiptMovement(null);
  };

  const handleDownloadMovement = async (movement) => {
    // Crear un elemento temporal con el contenido del comprobante
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '400px';
    tempDiv.style.background = 'white';
    tempDiv.style.padding = '20px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    
    const date = new Date(movement.date).toLocaleString('es-AR');
    const operator = movement.operatorId 
      ? `${movement.operatorId.first_name || ''} ${movement.operatorId.last_name || ''}`.trim()
      : '-';
    
    tempDiv.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 22px; color: #333;">PLANETA JUGUETES</h1>
        <p style="margin: 4px 0; font-size: 13px; color: #666;">Av. Siempre Viva 123</p>
        <p style="margin: 4px 0; font-size: 13px; color: #666;">Tel: (011) 4567-8900</p>
        <p style="margin: 4px 0; font-size: 13px; color: #666;">CUIT: 30-12345678-9</p>
        <hr style="border: 1px dashed #ccc; margin: 15px 0;" />
        <h2 style="margin: 0; font-size: 16px; color: #333;">COMPROBANTE DE MOVIMIENTO</h2>
      </div>
      
      <div style="margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="font-weight: bold; color: #555; font-size: 14px;">Fecha:</span>
          <span style="color: #333; font-size: 14px;">${date}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="font-weight: bold; color: #555; font-size: 14px;">Tipo:</span>
          <span style="color: #333; font-size: 14px;">${typeLabels[movement.type]}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="font-weight: bold; color: #555; font-size: 14px;">Concepto:</span>
          <span style="color: #333; font-size: 14px;">${movement.concept}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="font-weight: bold; color: #555; font-size: 14px;">Origen:</span>
          <span style="color: #333; font-size: 14px;">${sourceTypeLabels[movement.sourceType] || movement.sourceType}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="font-weight: bold; color: #555; font-size: 14px;">Método de Pago:</span>
          <span style="color: #333; font-size: 14px;">${paymentMethodLabels[movement.paymentMethod] || movement.paymentMethod}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="font-weight: bold; color: #555; font-size: 14px;">Operador:</span>
          <span style="color: #333; font-size: 14px;">${operator}</span>
        </div>
        ${movement.notes ? `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="font-weight: bold; color: #555; font-size: 14px;">Notas:</span>
          <span style="color: #333; font-size: 14px;">${movement.notes}</span>
        </div>
        ` : ''}
      </div>
      
      <hr style="border: 1px dashed #ccc; margin: 15px 0;" />
      
      <div style="text-align: center; padding: 20px; background: ${movement.type === 'INCOME' ? '#d4edda' : '#f8d7da'}; border-radius: 8px; margin: 15px 0;">
        <div style="font-size: 28px; font-weight: bold; font-family: 'Courier New', monospace; color: ${movement.type === 'INCOME' ? '#28a745' : '#dc3545'};">
          ${movement.type === 'INCOME' ? '+' : '-'}$${(movement.amount || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </div>
      </div>
      
      <hr style="border: 1px dashed #ccc; margin: 15px 0;" />
      
      <div style="text-align: center; margin-top: 15px;">
        <p style="margin: 0; font-size: 12px; color: #888;">Generado el ${new Date().toLocaleString('es-AR')}</p>
      </div>
    `;
    
    document.body.appendChild(tempDiv);
    
    try {
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, canvas.height * 100 / canvas.width]
      });
      
      const imgWidth = 100;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const fileName = `movimiento_${movement._id.slice(-8).toUpperCase()}_${new Date(movement.date).toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Intente nuevamente.');
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  return (
    <div className="movements-container">
      <div className="movements-header">
        <h1>Movimientos de Caja</h1>
        <button 
          className="refresh-btn" 
          onClick={refreshMovements}
          title="Refrescar movimientos"
        >
          🔄 Refrescar
        </button>
      </div>

      {error && <div className="movements-error">{error}</div>}

      <MovementsTable
        movements={movements}
        loading={loading}
        filters={filters}
        onFilterChange={setFilters}
        onViewDetail={handleViewDetail}
        onPrintMovement={handlePrintMovement}
        onDownloadMovement={handleDownloadMovement}
      />

      <MovementDetailModal
        movement={selectedMovement}
        onClose={handleCloseDetail}
        onPrint={handlePrintMovement}
        onDownload={handleDownloadMovement}
      />

      <MovementReceiptModal
        movement={receiptMovement}
        onClose={handleCloseReceipt}
      />
    </div>
  );
}