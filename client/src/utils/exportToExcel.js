import * as XLSX from 'xlsx';

/**
 * Exporta datos a un archivo Excel (.xlsx)
 * @param {Array} data - Array de objetos con los datos
 * @param {string} filename - Nombre del archivo (sin extensión)
 * @param {string} sheetName - Nombre de la hoja
 * @param {Array} columns - Array de objetos { key, label } para definir columnas y orden
 */
export function exportToExcel(data, filename = 'reporte', sheetName = 'Datos', columns = null) {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  // Si no se especifican columnas, usar las keys del primer objeto
  const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }));

  // Transformar datos al formato de Excel
  const excelData = data.map(item => {
    const row = {};
    cols.forEach(col => {
      row[col.label] = item[col.key];
    });
    return row;
  });

  // Crear libro de trabajo
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Ajustar anchos de columna
  const colWidths = cols.map(col => ({
    wch: Math.max(col.label.length, 15)
  }));
  ws['!cols'] = colWidths;

  // Agregar hoja al libro
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Descargar
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}