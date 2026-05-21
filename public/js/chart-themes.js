// Helper para colores de gráficos Chart.js según el tema

/**
 * Obtiene los colores del tema actual para gráficos desde las variables CSS
 * @returns {Object} Objeto con colores para gráficos
 */
function getChartThemeColors() {
  // Leer las variables CSS del documento
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  return {
    gridColor: computedStyle.getPropertyValue('--chart-grid').trim() || '#444444',
    textColor: computedStyle.getPropertyValue('--chart-text').trim() || '#f0f0f0',
    backgroundColor: computedStyle.getPropertyValue('--chart-bg').trim() || 'rgba(255, 255, 255, 0.05)',
    borderColor: computedStyle.getPropertyValue('--border-color').trim() || 'rgba(255, 255, 255, 0.1)',
    tooltipBg: computedStyle.getPropertyValue('--modal-bg').trim() || '#2a2a2a',
    tooltipBorder: computedStyle.getPropertyValue('--border-color').trim() || 'rgba(255, 255, 255, 0.2)'
  };
}

/**
 * Obtiene las opciones de configuración de Chart.js según el tema
 * @param {Object} customOptions - Opciones personalizadas adicionales
 * @returns {Object} Opciones de configuración para Chart.js
 */
function getChartThemeOptions(customOptions = {}) {
    const colors = getChartThemeColors();

    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                labels: {
                    color: colors.textColor
                }
            },
            tooltip: {
                backgroundColor: colors.tooltipBg,
                titleColor: colors.textColor,
                bodyColor: colors.textColor,
                borderColor: colors.tooltipBorder,
                borderWidth: 1
            }
        },
        scales: {
            x: {
                ticks: {
                    color: colors.textColor
                },
                grid: {
                    color: colors.gridColor
                }
            },
            y: {
                ticks: {
                    color: colors.textColor
                },
                grid: {
                    color: colors.gridColor
                }
            }
        }
    };

    // Merge con opciones personalizadas
    return mergeDeep(defaultOptions, customOptions);
}

/**
 * Función auxiliar para hacer merge profundo de objetos
 */
function mergeDeep(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = mergeDeep(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Actualiza un gráfico existente con los colores del tema actual
 * @param {Chart} chart - Instancia de Chart.js
 */
function updateChartTheme(chart) {
    if (!chart) return;

    const colors = getChartThemeColors();

    // Actualizar colores de texto
    if (chart.options.plugins && chart.options.plugins.legend) {
        chart.options.plugins.legend.labels.color = colors.textColor;
    }

    // Actualizar tooltip
    if (chart.options.plugins && chart.options.plugins.tooltip) {
        chart.options.plugins.tooltip.backgroundColor = colors.tooltipBg;
        chart.options.plugins.tooltip.titleColor = colors.textColor;
        chart.options.plugins.tooltip.bodyColor = colors.textColor;
        chart.options.plugins.tooltip.borderColor = colors.tooltipBorder;
    }

    // Actualizar escalas
    if (chart.options.scales) {
        Object.keys(chart.options.scales).forEach(scaleKey => {
            const scale = chart.options.scales[scaleKey];
            if (scale.ticks) scale.ticks.color = colors.textColor;
            if (scale.grid) scale.grid.color = colors.gridColor;
        });
    }

    // Re-renderizar el gráfico
    chart.update();
}

// Exportar funciones para uso global
if (typeof window !== 'undefined') {
    window.getChartThemeColors = getChartThemeColors;
    window.getChartThemeOptions = getChartThemeOptions;
    window.updateChartTheme = updateChartTheme;
}
