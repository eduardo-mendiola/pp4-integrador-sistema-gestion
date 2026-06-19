/**
 * Exporta datos a un archivo CSV
 * @param {Array} data - Array de objetos con los datos
 * @param {string} filename - Nombre del archivo (sin extensión)
 * @param {Array} columns - Array de objetos { key, label } para definir columnas y orden
 */
export function exportToCSV(data, filename = 'reporte', columns = null) {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  // Si no se especifican columnas, usar las keys del primer objeto
  const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }));

  // Generar encabezados
  const headers = cols.map(col => col.label);
  
  // Generar filas
  const rows = data.map(item => 
    cols.map(col => {
      const value = item[col.key];
      // Escapar comillas y comas
      const escaped = value === null || value === undefined 
        ? '' 
        : String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',')
  );

  // Unir todo
  const csvContent = [
    headers.join(','),
    ...rows
  ].join('\n');

  // Agregar BOM para que Excel reconozca UTF-8
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Descargar
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}