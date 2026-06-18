// Utilidad genérica para exportar datos a un archivo CSV y dispararlo como descarga.
//
// Uso:
//   exportToCsv('clientes', filteredClients, [
//     { header: 'NRO. DE CLIENTE', value: (row) => row.client_code || '-' },
//     { header: 'NOMBRE', value: (row) => getFullName(row) },
//   ]);
//
// Detalles pensados para Excel en español (es-AR):
//   - Delimitador ';' para que Excel separe las columnas al doble clic.
//   - Codificación Windows-1252 (ANSI): Excel en Windows español abre los .csv
//     con la codificación ANSI del sistema e ignora el BOM de UTF-8 al hacer
//     doble clic. Generando los bytes en Windows-1252 las tildes y la ñ se ven
//     bien sin depender de esa detección.

const DELIMITER = ';';

// Caracteres de Windows-1252 (rango 0x80–0x9F) que no coinciden con ISO-8859-1.
const WIN1252_EXTRA = {
  '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87,
  'ˆ': 0x88, '‰': 0x89, 'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c, 'Ž': 0x8e, '‘': 0x91,
  '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, '˜': 0x98,
  '™': 0x99, 'š': 0x9a, '›': 0x9b, 'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f
};

// Convierte el texto a bytes Windows-1252. Los acentos del español (á é í ó ú ñ
// ü ¿ ¡) caen en el rango 0–255 y se mapean directo; lo que no entra se reemplaza
// por '?'.
const toWindows1252 = (text) => {
  const bytes = new Uint8Array(text.length);

  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);

    if (code <= 0xff) {
      bytes[i] = code;
    } else if (WIN1252_EXTRA[text[i]] !== undefined) {
      bytes[i] = WIN1252_EXTRA[text[i]];
    } else {
      bytes[i] = 0x3f; // '?'
    }
  }

  return bytes;
};

// Convierte un valor a texto seguro para una celda CSV.
const escapeCell = (raw) => {
  const value = raw === null || raw === undefined ? '' : String(raw);

  if (value.includes(DELIMITER) || value.includes('"') || /[\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
};

const buildCsv = (rows, columns) => {
  const header = columns.map((column) => escapeCell(column.header)).join(DELIMITER);

  const body = rows.map((row) =>
    columns.map((column) => escapeCell(column.value(row))).join(DELIMITER)
  );

  return [header, ...body].join('\r\n');
};

const triggerDownload = (content, filename) => {
  const blob = new Blob([toWindows1252(content)], { type: 'text/csv;charset=windows-1252;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

// Normaliza un texto para usarlo en un nombre de archivo: sin acentos, en
// minúsculas y con guiones en lugar de espacios. Ej: 'En Stock' -> 'en-stock'.
export function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function exportToCsv(baseName, rows, columns) {
  const today = new Date().toISOString().slice(0, 10);
  const filename = `${baseName}_${today}.csv`;
  const csv = buildCsv(rows, columns);

  triggerDownload(csv, filename);
}
