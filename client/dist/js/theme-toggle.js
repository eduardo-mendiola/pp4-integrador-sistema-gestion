// Función para cambiar el tema
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    updateThemeIcon(newTheme);
    updateAllCharts();
    updateLogos(newTheme);
}

// Función para actualizar el icono y texto del tema
function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');

    if (!icon || !text) return;

    if (theme === 'dark') {
        icon.className = 'bi bi-sun-fill me-2';
        text.textContent = 'Modo Claro';
    } else {
        icon.className = 'bi bi-moon-fill me-2';
        text.textContent = 'Modo Oscuro';
    }
}

// Función para actualizar los logos según el tema
function updateLogos(theme) {
    const logos = document.querySelectorAll('img[data-light-src][data-dark-src]');

    logos.forEach(img => {
        const newSrc = theme === 'light'
            ? img.getAttribute('data-light-src')
            : img.getAttribute('data-dark-src');

        if (newSrc && img.src !== newSrc) {
            img.src = newSrc;
        }
    });
}

// Función para actualizar todos los gráficos Chart.js
function updateAllCharts() {
    // Verificar si Chart.js está disponible
    if (typeof Chart === 'undefined') return;

    // Actualizar todos los gráficos activos
    if (window.chartInstances && Array.isArray(window.chartInstances)) {
        window.chartInstances.forEach(chart => {
            if (typeof window.updateChartTheme === 'function') {
                window.updateChartTheme(chart);
            }
        });
    }
}

// Cargar el tema guardado al iniciar
(function () {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Función de inicialización
    const initTheme = () => {
        updateThemeIcon(savedTheme);
        updateLogos(savedTheme);
    };

    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();
