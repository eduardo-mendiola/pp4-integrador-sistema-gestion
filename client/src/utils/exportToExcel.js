import * as XLSX from 'xlsx';

/**
 * Exporta datos a un archivo Excel (.xlsx)
 * Soporta tanto un array simple como un objeto con múltiples hojas
 * @param {Array|Object} data - Array de objetos o objeto con { nombreHoja: arrayDatos }
 * @param {string} filename - Nombre del archivo (sin extensión)
 * @param {string} sheetName - Nombre de la hoja (solo si data es array)
 * @param {Array} columns - Array de objetos { key, label } (solo si data es array)
 */
export function exportToExcel(data, filename = 'reporte', sheetName = 'Datos', columns = null) {
  if (!data) {
    alert('No hay datos para exportar');
    return;
  }

  const wb = XLSX.utils.book_new();

  // Caso 1: data es un objeto con múltiples hojas
  if (!Array.isArray(data) && typeof data === 'object') {
    Object.entries(data).forEach(([sheet, sheetData]) => {
      if (!sheetData || sheetData.length === 0) return;
      
      const ws = XLSX.utils.json_to_sheet(sheetData);
      
      // Ajustar anchos de columna
      const colKeys = Object.keys(sheetData[0]);
      const colWidths = colKeys.map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, sheet);
    });
  } 
  
  // Caso 2: data es un array simple
  else if (Array.isArray(data)) {
    if (data.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }));

    const excelData = data.map(item => {
      const row = {};
      cols.forEach(col => {
        row[col.label] = item[col.key];
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(excelData);

    const colWidths = cols.map(col => ({
      wch: Math.max(col.label.length, 15)
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}