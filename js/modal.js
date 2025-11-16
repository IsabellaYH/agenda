// En modal.js alrededor de la línea 158, modifica:
function mostrarEstadisticas() {
    try {
        const modalElement = document.getElementById('modalEstadisticas');
        
        if (!modalElement) {
            throw new Error('Modal element not found');
        }
        
        // Verificar si Bootstrap está disponible
        if (typeof bootstrap === 'undefined') {
            throw new Error('Bootstrap not loaded');
        }
        
        const modal = bootstrap.Modal.getInstance(modalElement) || 
                     new bootstrap.Modal(modalElement);
        
        // Verificar que el modal existe antes de acceder a backdrop
        if (modal && modal._element) {
            modal.show();
        } else {
            console.error('Modal not properly initialized');
        }
        
    } catch (error) {
        console.error('Error al mostrar estadísticas:', error);
        // Mostrar fallback o mensaje al usuario
    }
} 