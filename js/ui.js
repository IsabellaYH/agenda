// ui.js - helpers de UI (notificaciones, modales ligeros) - ES Module
export function notify(message, type = 'info', timeout = 3000){
    const colors = { info: '#17a2b8', success: '#28a745', error: '#dc3545', warning: '#ffc107' };
    const notification = document.createElement('div');
    notification.className = 'ap-notification';
    notification.style.cssText = `position: fixed; top: 20px; right: 20px; padding: 12px 16px; background: ${colors[type] || colors.info}; color: #fff; border-radius: 6px; z-index: 11000; box-shadow: 0 6px 18px rgba(0,0,0,0.15); font-weight:600;`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(()=> notification.remove(), timeout);
}

export function showBootstrapModalById(id){
    const el = document.getElementById(id);
    if (!el) return null;
    if (typeof bootstrap === 'undefined') {
        // Usar notificación de UI en vez de console.warn para no ensuciar la consola
        try { notify('Bootstrap no encontrado al intentar mostrar modal: ' + id, 'warning'); } catch (e) {}
        return null;
    }
    const modal = bootstrap.Modal.getInstance(el) || new bootstrap.Modal(el);
    modal.show();
    return modal;
}

// Export default for convenience and backwards compatibility
export default { notify, showBootstrapModalById };

// Also attach to window for any legacy code that might rely on window.UI
if (typeof window !== 'undefined') window.UI = { notify, showBootstrapModalById };
