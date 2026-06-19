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
    marginTop = 0,
    marginBottom = 0,
    marginLeft = 10,
    marginRight = 10
  } = options;

  try {
    // Capturar el elemento como imagen
    const canvas = await html2canvas(element, {
      scale: 1.8,
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
    const imgWidth = pageWidth - marginLeft - marginRight;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Si la imagen es más alta que la página, dividir en páginas
    let heightLeft = imgHeight;
    let position = marginTop;

    pdf.addImage(imgData, 'PNG', marginLeft, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - marginTop - marginBottom);

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + marginTop;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', marginLeft, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - marginTop - marginBottom);
    }

    // Descargar
    pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generando PDF:', error);
    alert('Error al generar el PDF. Intente nuevamente.');
  }
}