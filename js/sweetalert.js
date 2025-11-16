// SweetAlert2 - Versión simplificada para el proyecto
class SweetAlert {
    static async fire(options) {
        // Simular el comportamiento básico de SweetAlert2
        if (typeof options === 'string') {
            options = { title: options };
        }

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
        });
    }

    static createModal(options) {
        const modal = document.createElement('div');
        modal.className = 'sweet-alert-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;

        const iconMap = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ',
            question: '?'
        };

        const iconColorMap = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8',
            question: '#D4AF37'
        };

        modal.innerHTML = `
            <div class="sweet-alert-content" style="
                background: #2C2C2C;
                border: 2px solid #D4AF37;
                border-radius: 12px;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
                color: #F8F9FA;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ">
                <div class="sweet-alert-icon" style="
                    font-size: 3rem;
                    color: ${iconColorMap[options.icon]};
                    margin-bottom: 1rem;
                ">${iconMap[options.icon]}</div>
                
                <h3 style="color: #D4AF37; margin-bottom: 1rem;">${options.title}</h3>
                
                ${options.text ? `<p style="margin-bottom: 1.5rem; line-height: 1.5;">${options.text}</p>` : ''}
                
                <div class="sweet-alert-buttons" style="
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                ">
                    ${options.showCancelButton ? `
                        <button class="sweet-cancel-btn" style="
                            padding: 0.75rem 1.5rem;
                            border: 2px solid #dc3545;
                            background: transparent;
                            color: #dc3545;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            transition: all 0.3s ease;
                        ">${options.cancelButtonText}</button>
                    ` : ''}
                    
                    ${options.showConfirmButton ? `
                        <button class="sweet-confirm-btn" style="
                            padding: 0.75rem 1.5rem;
                            background: linear-gradient(135deg, #D4AF37, #B8860B);
                            color: #1A1A1A;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            transition: all 0.3s ease;
                        ">${options.confirmButtonText}</button>
                    ` : ''}
                </div>
            </div>
        `;

        // Event listeners
        const confirmBtn = modal.querySelector('.sweet-confirm-btn');
        const cancelBtn = modal.querySelector('.sweet-cancel-btn');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                modal.remove();
                options.resolve({ isConfirmed: true, isDenied: false, isDismissed: false });
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modal.remove();
                options.resolve({ isConfirmed: false, isDenied: true, isDismissed: true });
            });
        }

        // Cerrar al hacer click fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                options.resolve({ isConfirmed: false, isDenied: false, isDismissed: true });
            }
        });

        return modal;
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

// Hacer disponible globalmente
window.Swal = SweetAlert;