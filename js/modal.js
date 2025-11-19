// modal.js - helpers para modales (ES Module)
export function mostrarEstadisticas() {
    try {
        const modalElement = document.getElementById('modalEstadisticas');
        if (!modalElement) {
            throw new Error('Modal element not found');
        }

        if (typeof bootstrap === 'undefined') {
            throw new Error('Bootstrap not loaded');
        }

        const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        if (modal && modal._element) {
            modal.show();
        } else {
            try { if (window && window.UI && typeof window.UI.notify === 'function') window.UI.notify('Modal no inicializado correctamente', 'error'); } catch (e) {}
        }
    } catch (error) {
        try { if (window && window.UI && typeof window.UI.notify === 'function') window.UI.notify('Error al mostrar estadísticas', 'error'); } catch (e) {}
    }
}

// Compatibilidad global
if (typeof window !== 'undefined') window.mostrarEstadisticas = mostrarEstadisticas;