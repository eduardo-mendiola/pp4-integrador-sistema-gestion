// Convierte una fecha a formato YYYY-MM-DD (para inputs de tipo date)
export function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

// Formatea las fechas de los campos especificados en un objeto
export function formatDatesForInput(item, fields = []) {
    if (!item) return item;

    const formatDate = (date) => {
        if (date === null || date === undefined) return '';
        const d = new Date(date);
        // Validar que la fecha sea válida
        if (isNaN(d.getTime())) return date; // Retornar el valor original si no es una fecha válida
        return d.toISOString().split('T')[0];
    };

    const formatted = { ...item };
    fields.forEach(field => {
        if (item[field] !== undefined) {
            formatted[field] = formatDate(item[field]);
        }
    });

    return formatted;
}
