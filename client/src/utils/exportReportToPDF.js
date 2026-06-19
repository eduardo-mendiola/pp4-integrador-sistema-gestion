import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exporta un elemento HTML a PDF
 * @param {HTMLElement} element - Elemento DOM a capturar
 * @param {string} filename - Nombre del archivo (sin extensión)
 * @param {Object} options - Opciones adicionales
 */
export async function exportReportToPDF(element, filename = 'reporte', options = {}) {
  if (!element) {
    alert('No hay contenido para exportar');
    return;
  }

  const {
    orientation = 'portrait',
    unit = 'mm',
    format = 'a4',
    margin = 10
  } = options;

  try {
    // Capturar el elemento como imagen
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Crear PDF
    const pdf = new jsPDF({
      orientation,
      unit,
      format
    });

    // Calcular dimensiones
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Si la imagen es más alta que la página, dividir en páginas
    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - margin * 2);

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - margin * 2);
    }

    // Descargar
    pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generando PDF:', error);
    alert('Error al generar el PDF. Intente nuevamente.');
  }
}