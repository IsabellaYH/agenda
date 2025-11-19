// SweetAlert2 - Versión simplificada para el proyecto (ES Module)
class SweetAlert {
    static async fire(options) {
        // Simular el comportamiento básico de SweetAlert2
        if (typeof options === 'string') options = { title: options };

        const {
            title = '',
            text = '',
            icon = 'success',
            confirmButtonText = 'Aceptar',
            cancelButtonText = 'Cancelar',
            showCancelButton = false,
            showConfirmButton = true
        } = options;

        return new Promise((resolve) => {
            const modal = this.createModal({
                title,
                text,
                icon,
                confirmButtonText,
                cancelButtonText,
                showCancelButton,
                showConfirmButton,
                resolve
            });
            document.body.appendChild(modal);
            // trigger CSS-driven enter animation
            requestAnimationFrame(() => modal.classList.add('open'));
        });
    }

    static createModal(options) {
        const modal = document.createElement('div');
        modal.className = 'sweet-alert-modal';

        const iconMap = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ',
            question: '?'
        };

        modal.innerHTML = `
            <div class="sweet-alert-content" role="dialog" aria-modal="true" aria-label="${SweetAlert._escapeHtml(options.title)}">
                <div class="sweet-alert-icon sweet-alert-icon--${options.icon}">${iconMap[options.icon]}</div>
                <h3 class="sweet-alert-title">${SweetAlert._escapeHtml(options.title)}</h3>
                ${options.text ? `<p class="sweet-alert-text">${SweetAlert._escapeHtml(options.text)}</p>` : ''}
                <div class="sweet-alert-buttons">
                    ${options.showCancelButton ? `<button class="sweet-cancel-btn" type="button">${SweetAlert._escapeHtml(options.cancelButtonText)}</button>` : ''}
                    ${options.showConfirmButton ? `<button class="sweet-confirm-btn" type="button">${SweetAlert._escapeHtml(options.confirmButtonText)}</button>` : ''}
                </div>
            </div>
        `;

        // Event listeners
        const confirmBtn = modal.querySelector('.sweet-confirm-btn');
        const cancelBtn = modal.querySelector('.sweet-cancel-btn');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                modal.classList.remove('open');
                modal.addEventListener('animationend', () => modal.remove(), { once: true });
                options.resolve({ isConfirmed: true, isDenied: false, isDismissed: false });
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modal.classList.remove('open');
                modal.addEventListener('animationend', () => modal.remove(), { once: true });
                options.resolve({ isConfirmed: false, isDenied: true, isDismissed: true });
            });
        }

        // Cerrar al hacer click fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('open');
                modal.addEventListener('animationend', () => modal.remove(), { once: true });
                options.resolve({ isConfirmed: false, isDenied: false, isDismissed: true });
            }
        });

        return modal;
    }

    // Simple HTML escaper for safe insertion into text nodes
    static _escapeHtml(str = '') {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Métodos de conveniencia
    static async success(title, text = '') {
        return this.fire({ title, text, icon: 'success' });
    }

    static async error(title, text = '') {
        return this.fire({ title, text, icon: 'error' });
    }

    static async warning(title, text = '') {
        return this.fire({ title, text, icon: 'warning' });
    }

    static async info(title, text = '') {
        return this.fire({ title, text, icon: 'info' });
    }

    static async question(title, text = '') {
        return this.fire({ 
            title, 
            text, 
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        });
    }

    static async confirm(title, text = '') {
        return this.fire({
            title,
            text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar'
        });
    }
}

// Hacer disponible globalmente (compatibilidad)
if (typeof window !== 'undefined') window.Swal = SweetAlert;

export default SweetAlert;