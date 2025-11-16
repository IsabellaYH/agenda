// Sistema de Gestión - AgendaPro Plus con Sistema de Pagos
class AgendaServicios {
    constructor() {
        this.servicios = [];
        this.fechaActual = new Date();
        this.fechaSeleccionada = null;
        this.filtroActual = 'todos';
        this.tiposServicio = [];
        this.configuracion = {};
        this.servicioSeleccionado = null;
    }

    async inicializarAplicacion() {
        try {
            await this.cargarDatos();
            this.cargarServicios();
            this.renderizarCalendario();
            this.mostrarServicios();
            this.actualizarEstadisticas();
            this.configurarEventos();
            this.mostrarNotificacion('Sistema AgendaPro inicializado correctamente', 'success');
        } catch (error) {
            console.error('Error inicializando aplicación:', error);
        }
    }

    async cargarDatos() {
        try {
            // Si el archivo no existe, usar datos por defecto
            const serviciosEjemplo = {
                "servicios": [
                    {
                        "id": 1,
                        "nombre": "Depilación Definitiva Zona Facial",
                        "categoria": "depilacion",
                        "subcategoria": "definitiva",
                        "duracion": 30,
                        "precio": 45.00,
                        "senia": 15.00,
                        "porcentaje_senia": 33,
                        "descripcion": "Sesión de depilación láser en zona facial completa",
                        "popular": true
                    },
                    {
                        "id": 2,
                        "nombre": "Depilación Definitiva Axilas",
                        "categoria": "depilacion",
                        "subcategoria": "definitiva",
                        "duracion": 45,
                        "precio": 60.00,
                        "senia": 20.00,
                        "porcentaje_senia": 33,
                        "descripcion": "Sesión de depilación láser en axilas",
                        "popular": true
                    },
                    {
                        "id": 3,
                        "nombre": "Manicura Semipermanente",
                        "categoria": "manicura",
                        "subcategoria": "semipermanente",
                        "duracion": 75,
                        "precio": 40.00,
                        "senia": 15.00,
                        "porcentaje_senia": 38,
                        "descripcion": "Manicura con esmalte semipermanente (dura hasta 3 semanas)",
                        "popular": true
                    }
                ],
                "configuracion": {
                    "senia_minima": 8.00,
                    "porcentaje_senia_default": 30,
                    "politica_cancelacion": "La seña no es reembolsable en caso de cancelación con menos de 24 horas de anticipación"
                }
            };

            this.tiposServicio = serviciosEjemplo.servicios;
            this.configuracion = serviciosEjemplo.configuracion;
            
            this.cargarOpcionesServicios();
            this.cargarCategorias();
            
        } catch (error) {
            console.error('Error cargando servicios:', error);
            this.mostrarNotificacion('Error cargando datos de servicios', 'error');
        }
    }

    cargarOpcionesServicios() {
        const select = document.getElementById('tipo-servicio');
        if (!select) {
            console.error('No se encontró el elemento tipo-servicio');
            return;
        }

        // Limpiar opciones excepto la primera
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }

        this.tiposServicio.forEach(servicio => {
            const option = document.createElement('option');
            option.value = servicio.id;
            option.textContent = `${servicio.nombre} - $${servicio.precio} (${servicio.duracion}min)`;
            option.dataset.precio = servicio.precio;
            option.dataset.duracion = servicio.duracion;
            option.dataset.senia = servicio.senia;
            option.dataset.descripcion = servicio.descripcion;
            option.dataset.categoria = servicio.categoria;
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            this.mostrarInformacionServicio(e.target.value);
        });
    }

    cargarCategorias() {
        const select = document.getElementById('filtro-categoria');
        if (!select) return;

        const categorias = [...new Set(this.tiposServicio.map(s => s.categoria))];
        
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = this.formatearCategoria(categoria);
            select.appendChild(option);
        });
    }

    formatearCategoria(categoria) {
        const categorias = {
            'depilacion': 'Depilación',
            'manicura': 'Manicura',
            'peluqueria': 'Peluquería',
            'maquillaje': 'Maquillaje',
            'pestanas': 'Pestañas',
            'cejas': 'Cejas',
            'pedicura': 'Pedicura',
            'masajes': 'Masajes',
            'facial': 'Tratamientos Faciales'
        };
        return categorias[categoria] || categoria;
    }

    mostrarInformacionServicio(servicioId) {
        const servicio = this.tiposServicio.find(s => s.id == servicioId);
        const infoDiv = document.getElementById('info-servicio-seleccionado');
        
        if (!servicio || !infoDiv) {
            return;
        }

        infoDiv.classList.remove('d-none');
        document.getElementById('info-nombre-servicio').textContent = servicio.nombre;
        document.getElementById('info-duracion-servicio').textContent = `${servicio.duracion} min`;
        document.getElementById('info-precio-servicio').textContent = `$${servicio.precio}`;
        document.getElementById('info-descripcion-servicio').textContent = servicio.descripcion;

        this.servicioSeleccionado = servicio;
    }
    mostrarNotificacion(mensaje, tipo = 'info') {
        // Antes de línea 158 en modal.js, verifica:
console.log('Modal object:', modal);
console.log('Modal element:', document.getElementById('tuModalId'));

// Asegúrate de que el modal está en el HTML y tiene el ID correcto

    // En tu código de estadísticas, asegúrate de inicializar el modal:
 modalElement = document.getElementById('modalEstadisticas');
if (modalElement) {
    const modal = new bootstrap.Modal(modalElement);
    
    // Mostrar el modal
    modal.show();
} else {
    console.error('Modal element not found');
}
    }

    async agregarServicio(evento) {
        evento.preventDefault();
        
        const nombre = document.getElementById('nombre-cliente')?.value.trim();
        const apellido = document.getElementById('apellido-cliente')?.value.trim();
        const fecha = document.getElementById('fecha-servicio')?.value;
        const servicioId = document.getElementById('tipo-servicio')?.value;
        const telefono = document.getElementById('telefono-cliente')?.value.trim();
        const email = document.getElementById('email-cliente')?.value.trim();
        const detalles = document.getElementById('detalles-servicio')?.value.trim();
        const recordatorioSMS = document.getElementById('recordatorio-sms')?.checked;

        if (!this.validarFormulario(nombre, apellido, fecha, servicioId)) {
            return;
        }

        const servicio = this.tiposServicio.find(s => s.id == servicioId);
        
        const confirmacion = await this.mostrarModalPago(servicio);
        
        if (!confirmacion) {
            return;
        }

        const nuevoServicio = {
            id: Date.now(),
            fecha: fecha,
            nombre: nombre,
            apellido: apellido,
            telefono: telefono,
            email: email,
            servicio: servicio.nombre,
            servicioId: servicio.id,
            precio: servicio.precio,
            senia: servicio.senia,
            detalles: detalles || 'Sin detalles adicionales',
            recordatorioSMS: recordatorioSMS || false,
            estadoPago: 'pendiente',
            fechaCreacion: new Date().toISOString(),
            fechaPago: null
        };

        this.servicios.push(nuevoServicio);
        this.guardarServicios();
        this.limpiarFormulario();
        this.renderizarCalendario();
        this.mostrarServicios();
        
        this.mostrarNotificacion(
            `Servicio agendado para ${nombre} ${apellido}. Seña de $${servicio.senia} registrada.`,
            'success'
        );
    }

    async mostrarModalPago(servicio) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-pago-overlay';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            `;

            modal.innerHTML = `
                <div class="modal-pago-content" style="
                    background: #2C2C2C;
                    border: 2px solid #D4AF37;
                    border-radius: 12px;
                    padding: 2rem;
                    max-width: 500px;
                    width: 90%;
                    color: #F8F9FA;
                    text-align: center;
                ">
                    <div class="modal-pago-header" style="margin-bottom: 1.5rem;">
                        <i class="fas fa-credit-card" style="font-size: 3rem; color: #D4AF37; margin-bottom: 1rem;"></i>
                        <h4 style="color: #D4AF37; margin-bottom: 0.5rem;">Confirmación de Reserva</h4>
                        <p style="color: #F8F9FA; opacity: 0.8;">Se requiere seña para confirmar la reserva</p>
                    </div>
                    
                    <div class="modal-pago-info" style="
                        background: rgba(26,26,26,0.5);
                        border-radius: 8px;
                        padding: 1.5rem;
                        margin-bottom: 1.5rem;
                        text-align: left;
                    ">
                        <div class="row">
                            <div class="col-6">
                                <small style="color: #D4AF37;">Servicio:</small><br>
                                <strong>${servicio.nombre}</strong>
                            </div>
                            <div class="col-6">
                                <small style="color: #D4AF37;">Duración:</small><br>
                                <strong>${servicio.duracion} min</strong>
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-6">
                                <small style="color: #D4AF37;">Precio Total:</small><br>
                                <strong>$${servicio.precio}</strong>
                            </div>
                            <div class="col-6">
                                <small style="color: #D4AF37;">Seña Requerida:</small><br>
                                <strong style="color: #28a745;">$${servicio.senia} (${servicio.porcentaje_senia}%)</strong>
                            </div>
                        </div>
                    </div>

                    <div class="modal-pago-alert" style="
                        background: rgba(212, 175, 55, 0.1);
                        border: 1px solid #D4AF37;
                        border-radius: 6px;
                        padding: 1rem;
                        margin-bottom: 1.5rem;
                        text-align: left;
                    ">
                        <i class="fas fa-exclamation-triangle" style="color: #D4AF37; margin-right: 0.5rem;"></i>
                        <small>
                            <strong>Importante:</strong> La seña no es reembolsable en caso de cancelación con menos de 24 horas de anticipación.
                        </small>
                    </div>

                    <div class="modal-pago-buttons" style="display: flex; gap: 1rem;">
                        <button class="btn-cancelar-pago" style="
                            flex: 1;
                            padding: 0.75rem 1.5rem;
                            border: 2px solid #dc3545;
                            background: transparent;
                            color: #dc3545;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            transition: all 0.3s ease;
                        ">Cancelar</button>
                        
                        <button class="btn-confirmar-pago" style="
                            flex: 1;
                            padding: 0.75rem 1.5rem;
                            background: linear-gradient(135deg, #28a745, #1e7e34);
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            transition: all 0.3s ease;
                        ">
                            <i class="fas fa-credit-card me-2"></i>
                            Pagar Seña $${servicio.senia}
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const confirmarBtn = modal.querySelector('.btn-confirmar-pago');
            const cancelarBtn = modal.querySelector('.btn-cancelar-pago');

            confirmarBtn.addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });

            cancelarBtn.addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                    resolve(false);
                }
            });
        });
    }

    validarFormulario(nombre, apellido, fecha, servicioId) {
        if (!nombre || !apellido || !fecha || !servicioId) {
            this.mostrarNotificacion('Por favor, complete todos los campos obligatorios', 'error');
            return false;
        }
        return true;
    }

    guardarServicios() {
        localStorage.setItem('agendaServicios', JSON.stringify(this.servicios));
    }

    cargarServicios() {
        const serviciosGuardados = localStorage.getItem('agendaServicios');
        if (serviciosGuardados) {
            this.servicios = JSON.parse(serviciosGuardados);
        }
    }

    limpiarFormulario() {
        const form = document.getElementById('formulario-servicio');
        if (form) form.reset();
        
        const fechaInput = document.getElementById('fecha-servicio');
        if (fechaInput) fechaInput.value = '';
        
        const infoDiv = document.getElementById('info-servicio-seleccionado');
        if (infoDiv) infoDiv.classList.add('d-none');
    }

    mostrarServicios() {
        const contenedor = document.getElementById('contenedor-resultados');
        if (!contenedor) {
            console.error('No se encontró el contenedor de resultados');
            return;
        }

        if (this.servicios.length === 0) {
            contenedor.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-clipboard-list fa-3x mb-3"></i>
                    <h5>No hay servicios programados</h5>
                    <p class="small">Comienza agendando tu primer servicio</p>
                </div>
            `;
            return;
        }

        let serviciosFiltrados = this.servicios;

        // Aplicar filtros
        if (this.filtroActual === 'hoy') {
            const hoy = new Date().toLocaleDateString('es-ES');
            serviciosFiltrados = this.servicios.filter(s => s.fecha === hoy);
        } else if (this.filtroActual === 'semana') {
            serviciosFiltrados = this.obtenerServiciosEstaSemana();
        }

        // Aplicar búsqueda
        const busquedaInput = document.getElementById('buscar-servicios');
        if (busquedaInput) {
            const busqueda = busquedaInput.value.toLowerCase();
            if (busqueda) {
                serviciosFiltrados = serviciosFiltrados.filter(s => 
                    s.nombre.toLowerCase().includes(busqueda) ||
                    s.apellido.toLowerCase().includes(busqueda) ||
                    s.servicio.toLowerCase().includes(busqueda)
                );
            }
        }

        // Aplicar filtro de categoría
        const categoriaSelect = document.getElementById('filtro-categoria');
        if (categoriaSelect && categoriaSelect.value !== 'todas') {
            serviciosFiltrados = serviciosFiltrados.filter(s => {
                const servicioInfo = this.tiposServicio.find(t => t.id == s.servicioId);
                return servicioInfo && servicioInfo.categoria === categoriaSelect.value;
            });
        }

        if (serviciosFiltrados.length === 0) {
            contenedor.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-search fa-3x mb-3"></i>
                    <h5>No se encontraron servicios</h5>
                    <p class="small">Intenta con otros filtros de búsqueda</p>
                </div>
            `;
            return;
        }

        contenedor.innerHTML = serviciosFiltrados.map((servicio, indice) => 
            this.crearHTMLServicio(servicio, indice)
        ).join('');
    }

    crearHTMLServicio(servicio, indice) {
        const servicioInfo = this.tiposServicio.find(s => s.id == servicio.servicioId) || {};
        const estadoPago = servicio.estadoPago || 'pendiente';
        const badgeColor = estadoPago === 'pagado' ? 'success' : 'warning';
        const iconoPago = estadoPago === 'pagado' ? 'fa-check-circle' : 'fa-clock';

        return `
            <div class="servicio-item position-relative fade-in-up">
                <button class="btn-eliminar" data-id="${servicio.id}">
                    <i class="fas fa-times"></i>
                </button>
                
                <div class="encabezado-servicio">
                    <h3>Servicio #${indice + 1}</h3>
                    <div>
                        <span class="etiqueta-servicio">${servicio.servicio}</span>
                        <span class="badge bg-${badgeColor} ms-2">
                            <i class="fas ${iconoPago} me-1"></i>
                            ${estadoPago === 'pagado' ? 'Seña Pagada' : 'Seña Pendiente'}
                        </span>
                    </div>
                </div>

                <div class="detalle-servicio">
                    <i class="far fa-calendar"></i>
                    <span>${servicio.fecha}</span>
                </div>

                <div class="detalle-servicio">
                    <i class="far fa-user"></i>
                    <span>${servicio.nombre} ${servicio.apellido}</span>
                    ${servicio.telefono ? `<small class="text-muted ms-2">${servicio.telefono}</small>` : ''}
                </div>

                <div class="detalle-servicio">
                    <i class="fas fa-money-bill-wave"></i>
                    <span>
                        <strong>Total:</strong> $${servicio.precio} | 
                        <strong>Seña:</strong> $${servicio.senia}
                    </span>
                </div>

                ${servicio.detalles !== 'Sin detalles adicionales' ? `
                <div class="detalle-servicio">
                    <i class="far fa-file-lines"></i>
                    <span>${servicio.detalles}</span>
                </div>
                ` : ''}

                ${servicio.recordatorioSMS ? `
                <div class="detalle-servicio">
                    <i class="fas fa-sms text-info"></i>
                    <span class="text-info">Recordatorio SMS activado</span>
                </div>
                ` : ''}

                <div class="servicio-actions mt-3">
                    <div class="btn-group w-100">
                        ${estadoPago === 'pendiente' ? `
                            <button class="btn btn-success btn-sm" onclick="agenda.marcarPagoRealizado(${servicio.id})">
                                <i class="fas fa-credit-card me-1"></i>
                                Marcar Seña Pagada
                            </button>
                        ` : `
                            <button class="btn btn-outline-success btn-sm" disabled>
                                <i class="fas fa-check me-1"></i>
                                Seña Confirmada
                            </button>
                        `}
                        
                        <button class="btn btn-outline-primary btn-sm" onclick="agenda.mostrarDetallesServicio(${servicio.id})">
                            <i class="fas fa-info-circle me-1"></i>
                            Detalles
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    marcarPagoRealizado(servicioId) {
        const servicio = this.servicios.find(s => s.id === servicioId);
        if (!servicio) return;

        Swal.confirm(
            'Confirmar Pago de Seña',
            `¿Confirmar que se recibió la seña de $${servicio.senia} para el servicio de ${servicio.nombre} ${servicio.apellido}?`
        ).then((result) => {
            if (result.isConfirmed) {
                servicio.estadoPago = 'pagado';
                servicio.fechaPago = new Date().toISOString();
                this.guardarServicios();
                this.mostrarServicios();
                
                Swal.success(
                    'Pago Confirmado',
                    `Seña de $${servicio.senia} registrada correctamente.`
                );
            }
        });
    }

    mostrarDetallesServicio(servicioId) {
        const servicio = this.servicios.find(s => s.id === servicioId);
        const servicioInfo = this.tiposServicio.find(s => s.id == servicio.servicioId) || {};

        if (!servicio) return;

        const modal = new bootstrap.Modal(document.getElementById('infoServicioModal'));
        document.getElementById('modal-nombre-servicio').textContent = servicio.servicio;
        document.getElementById('modal-descripcion-servicio').textContent = servicioInfo.descripcion || 'Sin descripción disponible';
        document.getElementById('modal-duracion-servicio').textContent = `${servicioInfo.duracion || 'N/A'} minutos`;
        document.getElementById('modal-precio-servicio').textContent = `$${servicio.precio} (Seña: $${servicio.senia})`;
        document.getElementById('modal-categoria-servicio').textContent = this.formatearCategoria(servicioInfo.categoria);
        
        modal.show();
    }

    renderizarCalendario() {
        const primerDia = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), 1);
        const ultimoDia = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth() + 1, 0);
        
        const nombresMeses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const mesActualElement = document.getElementById('mes-actual');
        if (mesActualElement) {
            mesActualElement.textContent = 
                `${nombresMeses[this.fechaActual.getMonth()]} ${this.fechaActual.getFullYear()}`;
        }

        const contenedorDias = document.getElementById('dias-calendario');
        if (!contenedorDias) {
            console.error('No se encontró el contenedor de días del calendario');
            return;
        }
        
        contenedorDias.innerHTML = '';

        const primerDiaSemana = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1;
        const ultimoDiaMesAnterior = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), 0).getDate();
        const hoy = new Date();

        // Días del mes anterior
        for (let i = primerDiaSemana; i > 0; i--) {
            const diaElemento = this.crearElementoDia(ultimoDiaMesAnterior - i + 1, ['dia-calendario', 'otro-mes']);
            contenedorDias.appendChild(diaElemento);
        }

        // Días del mes actual
        for (let i = 1; i <= ultimoDia.getDate(); i++) {
            const fechaStr = this.formatearFecha(new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), i));
            const clases = ['dia-calendario', 'mes-actual'];
            
            // Verificar si es hoy
            if (this.fechaActual.getMonth() === hoy.getMonth() && 
                this.fechaActual.getFullYear() === hoy.getFullYear() && 
                i === hoy.getDate()) {
                clases.push('hoy');
            }
            
            // Verificar si tiene servicios
            const serviciosDia = this.servicios.filter(s => s.fecha === fechaStr);
            if (serviciosDia.length > 0) {
                clases.push('con-servicio');
            }
            
            // Verificar si está seleccionado
            if (this.fechaSeleccionada === fechaStr) {
                clases.push('seleccionado');
            }

            const diaElemento = this.crearElementoDia(i, clases, serviciosDia.length);
            diaElemento.addEventListener('click', () => this.seleccionarFecha(i));
            contenedorDias.appendChild(diaElemento);
        }

        // Días del próximo mes
        const totalCeldas = 42;
        const diasAgregados = primerDiaSemana + ultimoDia.getDate();
        const diasRestantes = totalCeldas - diasAgregados;
        
        for (let i = 1; i <= diasRestantes; i++) {
            const diaElemento = this.crearElementoDia(i, ['dia-calendario', 'otro-mes']);
            contenedorDias.appendChild(diaElemento);
        }
    }

    crearElementoDia(numero, clases, cantidadServicios = 0) {
        const dia = document.createElement('div');
        dia.className = clases.join(' ');
        
        const numeroSpan = document.createElement('span');
        numeroSpan.className = 'numero-dia';
        numeroSpan.textContent = numero;
        dia.appendChild(numeroSpan);
        
        if (cantidadServicios > 0) {
            const contador = document.createElement('span');
            contador.className = 'contador-servicios';
            contador.textContent = cantidadServicios;
            dia.appendChild(contador);
        }
        
        return dia;
    }

    seleccionarFecha(dia) {
        const fechaSeleccionada = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), dia);
        this.fechaSeleccionada = this.formatearFecha(fechaSeleccionada);
        
        const fechaInput = document.getElementById('fecha-servicio');
        if (fechaInput) {
            fechaInput.value = this.fechaSeleccionada;
        }
        
        this.renderizarCalendario();
    }

    formatearFecha(fecha) {
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getFullYear();
        return `${dia}/${mes}/${año}`;
    }

    cambiarMes(direccion) {
        this.fechaActual.setMonth(this.fechaActual.getMonth() + direccion);
        this.renderizarCalendario();
    }

    obtenerServiciosHoy() {
        const hoy = new Date().toLocaleDateString('es-ES');
        return this.servicios.filter(s => s.fecha === hoy);
    }

    obtenerServiciosEsteMes() {
        const mesActual = this.fechaActual.getMonth();
        const añoActual = this.fechaActual.getFullYear();
        return this.servicios.filter(s => {
            const [dia, mes, año] = s.fecha.split('/');
            return parseInt(mes) === mesActual + 1 && parseInt(año) === añoActual;
        });
    }

    obtenerServiciosEstaSemana() {
        const hoy = new Date();
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1);
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6);

        return this.servicios.filter(s => {
            const [dia, mes, año] = s.fecha.split('/');
            const fechaServicio = new Date(año, mes - 1, dia);
            return fechaServicio >= inicioSemana && fechaServicio <= finSemana;
        });
    }

    actualizarEstadisticas() {
        const totalServicios = this.servicios.length;
        const serviciosHoy = this.obtenerServiciosHoy().length;
        const serviciosMes = this.obtenerServiciosEsteMes().length;
        const serviciosSemana = this.obtenerServiciosEstaSemana().length;

        const ingresosTotales = this.servicios.reduce((sum, s) => sum + s.precio, 0);
        const seniasCobradas = this.servicios
            .filter(s => s.estadoPago === 'pagado')
            .reduce((sum, s) => sum + s.senia, 0);

        // Actualizar elementos solo si existen
        const contadorServicios = document.getElementById('contador-servicios');
        const badgeHoy = document.getElementById('badge-servicios-hoy');
        const resumenTotal = document.getElementById('resumen-total');
        const resumenIngresos = document.getElementById('resumen-ingresos');
        const statsTotal = document.getElementById('stats-total');
        const statsMes = document.getElementById('stats-mes');
        const statsSemana = document.getElementById('stats-semana');

        if (contadorServicios) contadorServicios.textContent = totalServicios;
        if (badgeHoy) badgeHoy.textContent = `${serviciosHoy} hoy`;
        if (resumenTotal) resumenTotal.textContent = totalServicios;
        if (resumenIngresos) resumenIngresos.textContent = `$${ingresosTotales.toFixed(2)}`;
        if (statsTotal) statsTotal.textContent = totalServicios;
        if (statsMes) statsMes.textContent = serviciosMes;
        if (statsSemana) statsSemana.textContent = serviciosSemana;

        this.actualizarEstadisticasDetalladas(ingresosTotales, seniasCobradas);
    }

    actualizarEstadisticasDetalladas(ingresosTotales, seniasCobradas) {
        const statsCategorias = document.getElementById('stats-categorias');
        const statsPopulares = document.getElementById('stats-populares');
        const statsIngresos = document.getElementById('stats-ingresos');

        if (statsCategorias) {
            const conteoCategorias = this.servicios.reduce((acc, servicio) => {
                const servicioInfo = this.tiposServicio.find(s => s.id == servicio.servicioId);
                const categoria = servicioInfo?.categoria || 'otra';
                acc[categoria] = (acc[categoria] || 0) + 1;
                return acc;
            }, {});

            let htmlCategorias = '';
            Object.entries(conteoCategorias).forEach(([categoria, cantidad]) => {
                const porcentaje = ((cantidad / this.servicios.length) * 100).toFixed(1);
                htmlCategorias += `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="small">${this.formatearCategoria(categoria)}</span>
                        <div class="d-flex align-items-center">
                            <div class="progress flex-grow-1 mx-2" style="width: 100px; height: 8px;">
                                <div class="progress-bar" style="width: ${porcentaje}%"></div>
                            </div>
                            <span class="small text-muted">${cantidad}</span>
                        </div>
                    </div>
                `;
            });
            statsCategorias.innerHTML = htmlCategorias || '<p class="text-muted small">No hay datos disponibles</p>';
        }

        if (statsPopulares) {
            const serviciosPopulares = [...this.servicios]
                .reduce((acc, servicio) => {
                    const existing = acc.find(item => item.servicio === servicio.servicio);
                    if (existing) {
                        existing.cantidad++;
                    } else {
                        acc.push({ servicio: servicio.servicio, cantidad: 1 });
                    }
                    return acc;
                }, [])
                .sort((a, b) => b.cantidad - a.cantidad)
                .slice(0, 5);

            let htmlPopulares = '';
            serviciosPopulares.forEach((item, index) => {
                htmlPopulares += `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="small">${index + 1}. ${item.servicio}</span>
                        <span class="badge bg-primary">${item.cantidad}</span>
                    </div>
                `;
            });
            statsPopulares.innerHTML = htmlPopulares || '<p class="text-muted small">No hay datos disponibles</p>';
        }

        if (statsIngresos) {
            statsIngresos.innerHTML = `
                <div class="row text-center">
                    <div class="col-6">
                        <div class="card bg-success text-white mb-3">
                            <div class="card-body py-2">
                                <h6 class="mb-0">$${ingresosTotales.toFixed(2)}</h6>
                                <small>Ingresos Totales</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="card bg-warning text-dark mb-3">
                            <div class="card-body py-2">
                                <h6 class="mb-0">$${seniasCobradas.toFixed(2)}</h6>
                                <small>Señas Cobradas</small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    configurarEventos() {
        // Formulario de servicio
        const formulario = document.getElementById('formulario-servicio');
        if (formulario) {
            formulario.addEventListener('submit', (e) => this.agregarServicio(e));
        }
        
        // Navegación del calendario
        const mesAnterior = document.getElementById('mes-anterior');
        const mesSiguiente = document.getElementById('mes-siguiente');
        
        if (mesAnterior) {
            mesAnterior.addEventListener('click', () => this.cambiarMes(-1));
        }
        if (mesSiguiente) {
            mesSiguiente.addEventListener('click', () => this.cambiarMes(1));
        }
        
        // Filtros
        const filtroTodos = document.getElementById('filtro-todos');
        const filtroHoy = document.getElementById('filtro-hoy');
        const filtroSemana = document.getElementById('filtro-semana');
        
        if (filtroTodos) {
            filtroTodos.addEventListener('click', () => {
                this.filtroActual = 'todos';
                this.actualizarBotonesFiltro();
                this.mostrarServicios();
            });
        }
        
        if (filtroHoy) {
            filtroHoy.addEventListener('click', () => {
                this.filtroActual = 'hoy';
                this.actualizarBotonesFiltro();
                this.mostrarServicios();
            });
        }
        
        if (filtroSemana) {
            filtroSemana.addEventListener('click', () => {
                this.filtroActual = 'semana';
                this.actualizarBotonesFiltro();
                this.mostrarServicios();
            });
        }
        
        // Búsqueda
        const btnBuscar = document.getElementById('btn-buscar');
        const inputBuscar = document.getElementById('buscar-servicios');
        
        if (btnBuscar) {
            btnBuscar.addEventListener('click', () => this.mostrarServicios());
        }
        if (inputBuscar) {
            inputBuscar.addEventListener('input', () => this.mostrarServicios());
        }
        
        // Filtro de categoría
        const filtroCategoria = document.getElementById('filtro-categoria');
        if (filtroCategoria) {
            filtroCategoria.addEventListener('change', () => this.mostrarServicios());
        }
        
        // Eliminar servicios
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-eliminar')) {
                const servicioId = parseInt(e.target.closest('.btn-eliminar').dataset.id);
                this.eliminarServicio(servicioId);
            }
        });
    }

    actualizarBotonesFiltro() {
        const botones = ['filtro-todos', 'filtro-hoy', 'filtro-semana'];
        botones.forEach(id => {
            const boton = document.getElementById(id);
            if (boton) {
                boton.classList.toggle('active', id === `filtro-${this.filtroActual}`);
            }
        });
    }

    eliminarServicio(servicioId) {
        const servicio = this.servicios.find(s => s.id === servicioId);
        if (!servicio) return;

        Swal.confirm(
            'Eliminar Servicio',
            `¿Estás seguro de que quieres eliminar el servicio de ${servicio.nombre} ${servicio.apellido}?`
        ).then((result) => {
            if (result.isConfirmed) {
                this.servicios = this.servicios.filter(s => s.id !== servicioId);
                this.guardarServicios();
                this.renderizarCalendario();
                this.mostrarServicios();
                this.actualizarEstadisticas();
                
                Swal.success(
                    'Servicio Eliminado',
                    'El servicio ha sido eliminado correctamente.'
                );
            }
        });
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        // Implementación básica de notificación - puedes mejorarla después
        console.log(`${tipo.toUpperCase()}: ${mensaje}`);
        
        // Notificación visual básica
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${tipo === 'error' ? '#dc3545' : tipo === 'success' ? '#28a745' : '#17a2b8'};
            color: white;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        notification.textContent = mensaje;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.agenda = new AgendaServicios();
    window.agenda.inicializarAplicacion();
});
// En tu código, envuelve las conexiones en try-catch
try {
    // Tu código de conexión aquí
} catch (error) {
    console.warn('Conexión fallida:', error);
}

// Para promesas:
someConnection()
    .catch(error => {
        console.warn('Error de conexión manejado:', error);
    });