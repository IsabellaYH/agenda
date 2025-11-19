import Swal from './sweetalert.js';
import { load as loadServices } from './services.js';
import { notify, showBootstrapModalById } from './ui.js';
import { mostrarEstadisticas } from './modal.js';
import { renderizarCalendario, cambiarMes, obtenerServiciosHoy, obtenerServiciosEsteMes, obtenerServiciosEstaSemana, enableCalendarAutoResize } from './calendar.js';

// Temporal: suprimir en consola el ruido de extensiones que lanzan
// "Could not establish connection. Receiving end does not exist." durante pruebas.
// Esto evita el mensaje "Uncaught (in promise)" en DevTools sin afectar la app.
window.addEventListener('unhandledrejection', (ev) => {
    try {
        const reason = ev && ev.reason;
        const msg = reason && (reason.message || String(reason)) || '';
        if (typeof msg === 'string' && msg.includes('Could not establish connection. Receiving end does not exist.')) {
            ev.preventDefault();
            return;
        }
    } catch (e) {
        // no interrumpir si falla la detección
    }
});

// Sistema de Gestión - AgendaPro Plus con Sistema de Pagos (ES Module)
// Main application class: manages services, UI state, and interactions
class AgendaServicios {
    constructor() {
        this.servicios = [];
        this.fechaActual = new Date();
        this.fechaSeleccionada = null;
        this.filtroActual = 'todos';
        this.tiposServicio = [];
        this.configuracion = {};
    }

    async inicializarAplicacion() {
        // Load service catalog and configuration
        const datos = await loadServices();
        this.tiposServicio = datos.servicios || [];
        this.configuracion = datos.configuracion || {};

        // Load saved appointments from localStorage
        this.cargarServicios();

        // Populate selects and attach event handlers
        this.cargarCategorias();
        this.cargarOpcionesServicios();
        this.configurarEventos();

        // Initial render of calendar and statistics
        renderizarCalendario(this);
        enableCalendarAutoResize(this);
        this.mostrarServicios();
        this.actualizarEstadisticas();
    }

    cargarCategorias() {
        const categoriaSelect = document.getElementById('filtro-categoria');
        if (!categoriaSelect) return;
        categoriaSelect.innerHTML = '';
        const todas = document.createElement('option');
        todas.value = 'todas';
        todas.textContent = 'Todas';
        categoriaSelect.appendChild(todas);

        const categorias = [...new Set((this.tiposServicio || []).map(s => s.categoria).filter(Boolean))];
        categorias.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = this.formatearCategoria(c);
            categoriaSelect.appendChild(opt);
        });
    }

    cargarOpcionesServicios(categoriaFilter = null) {
        const tipoSelect = document.getElementById('tipo-servicio');
        if (!tipoSelect) return;
        tipoSelect.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Selecciona un servicio';
        tipoSelect.appendChild(placeholder);

        const items = (this.tiposServicio || []).filter(t => !categoriaFilter || t.categoria === categoriaFilter);
        items.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = `${s.nombre} - $${s.precio}`;
            tipoSelect.appendChild(opt);
        });
    }

    formatearCategoria(categoria) {
        if (!categoria) return '';
        return String(categoria).charAt(0).toUpperCase() + String(categoria).slice(1);
    }

    // Handle form submit to add a new service appointment
    async agregarServicio(e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        const form = document.getElementById('formulario-servicio');
        if (!form) return;

        const nombre = form.querySelector('#nombre-cliente')?.value || '';
        const apellido = form.querySelector('#apellido-cliente')?.value || '';
        const fecha = form.querySelector('#fecha-servicio')?.value || '';
        const servicioId = form.querySelector('#tipo-servicio')?.value || '';

        if (!this.validarFormulario(nombre, apellido, fecha, servicioId)) return;

        const servicio = (this.tiposServicio || []).find(t => String(t.id) === String(servicioId)) || { nombre: '', precio: 0, senia: 0, id: servicioId };

        const nuevoServicio = {
            id: Date.now(),
            fecha: fecha,
            nombre: nombre,
            apellido: apellido,
            telefono: form.querySelector('#telefono-cliente')?.value || '',
            email: form.querySelector('#email-cliente')?.value || '',
            servicio: servicio.nombre,
            servicioId: servicio.id,
            precio: servicio.precio || 0,
            senia: servicio.senia || 0,
            detalles: form.querySelector('#detalles-servicio')?.value || 'Sin detalles adicionales',
            recordatorioSMS: !!form.querySelector('#recordatorio-sms')?.checked,
            estadoPago: 'pendiente',
            fechaCreacion: new Date().toISOString(),
            fechaPago: null
        };

        this.servicios.push(nuevoServicio);
        this.guardarServicios();
        this.limpiarFormulario();
        renderizarCalendario(this);
        this.mostrarServicios();
        notify(`Servicio agendado para ${nombre} ${apellido}. Seña de $${nuevoServicio.senia} registrada.`, 'success');
    }
    

    async mostrarModalPago(servicio) {
        return new Promise((resolve) => {
            const modalEl = document.getElementById('modalPagoReserva');
            if (!modalEl) {
                // fallback: if modal template not present, resolve true
                resolve(true);
                return;
            }

            // populate modal fields
            const nombreEl = modalEl.querySelector('#modal-pago-nombre');
            const duracionEl = modalEl.querySelector('#modal-pago-duracion');
            const precioEl = modalEl.querySelector('#modal-pago-precio');
            const seniaEl = modalEl.querySelector('#modal-pago-senia');

            if (nombreEl) nombreEl.textContent = servicio.nombre || '';
            if (duracionEl) duracionEl.textContent = `${servicio.duracion} min`;
            if (precioEl) precioEl.textContent = `$${servicio.precio}`;
            if (seniaEl) seniaEl.textContent = `$${servicio.senia} (${servicio.porcentaje_senia}%)`;

            const bsModal = new bootstrap.Modal(modalEl, { backdrop: true });
            let settled = false;

            const confirmBtn = modalEl.querySelector('#btnConfirmarPago');
            const cancelBtn = modalEl.querySelector('#btnCancelarPago');

            const resolveOnce = (val) => {
                if (!settled) {
                    settled = true;
                    resolve(val);
                }
            };

            const cleanup = () => {
                try { confirmBtn.removeEventListener('click', onConfirm); } catch (e) {}
                try { cancelBtn.removeEventListener('click', onCancel); } catch (e) {}
                try { modalEl.removeEventListener('hidden.bs.modal', onHidden); } catch (e) {}
            };

            const onConfirm = () => {
                resolveOnce(true);
                cleanup();
                try { bsModal.hide(); } catch (e) {}
            };

            const onCancel = () => {
                resolveOnce(false);
                cleanup();
                try { bsModal.hide(); } catch (e) {}
            };

            const onHidden = () => {
                // if modal closed without confirmation, treat as cancel
                resolveOnce(false);
                cleanup();
            };

            confirmBtn.addEventListener('click', onConfirm);
            cancelBtn.addEventListener('click', onCancel);
            modalEl.addEventListener('hidden.bs.modal', onHidden);

            bsModal.show();
        });
    }

    validarFormulario(nombre, apellido, fecha, servicioId) {
        if (!nombre || !apellido || !fecha || !servicioId) {
            this.mostrarNotificacion('Por favor, complete todos los campos obligatorios', 'error');
            return false;
        }

        // Impedir agendar en fechas pasadas (usar fecha de la computadora)
        try {
            const parts = fecha.split('/');
            if (parts.length === 3) {
                const d = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10) - 1;
                const y = parseInt(parts[2], 10);
                const fechaSeleccionada = new Date(y, m, d);
                const hoy = new Date();
                const hoyInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
                if (fechaSeleccionada < hoyInicio) {
                    this.mostrarNotificacion('No se puede agendar en una fecha pasada', 'error');
                    return false;
                }
            }
        } catch (e) {
            // si falla el parseo, continuar con validación básica
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
            this.mostrarNotificacion('No se encontró el contenedor de resultados', 'error');
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
            serviciosFiltrados = obtenerServiciosEstaSemana(this);
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

    obtenerServiciosFiltrados() {
        // Devuelve la lista de servicios aplicada con los filtros activos en la UI
        let serviciosFiltrados = this.servicios.slice();

        // Aplicar filtro temporal (hoy / semana)
        if (this.filtroActual === 'hoy') {
            serviciosFiltrados = obtenerServiciosHoy(this);
        } else if (this.filtroActual === 'semana') {
            serviciosFiltrados = obtenerServiciosEstaSemana(this);
        }

        // Aplicar búsqueda
        const busquedaInput = document.getElementById('buscar-servicios');
        if (busquedaInput) {
            const busqueda = busquedaInput.value.toLowerCase().trim();
            if (busqueda) {
                serviciosFiltrados = serviciosFiltrados.filter(s =>
                    (s.nombre || '').toLowerCase().includes(busqueda) ||
                    (s.apellido || '').toLowerCase().includes(busqueda) ||
                    (s.servicio || '').toLowerCase().includes(busqueda)
                );
            }
        }

        // Aplicar filtro de categoría
        const categoriaSelect = document.getElementById('filtro-categoria');
        if (categoriaSelect && categoriaSelect.value && categoriaSelect.value !== 'todas') {
            serviciosFiltrados = serviciosFiltrados.filter(s => {
                const servicioInfo = this.tiposServicio.find(t => t.id == s.servicioId);
                return servicioInfo && servicioInfo.categoria === categoriaSelect.value;
            });
        }

        return serviciosFiltrados;
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

    generarReporteDia() {
        // Determinar la fecha a exportar: fechaSeleccionada o hoy
        const fechaExport = this.fechaSeleccionada || new Date().toLocaleDateString('es-ES');
        const serviciosDia = this.servicios.filter(s => s.fecha === fechaExport);

        if (!serviciosDia || serviciosDia.length === 0) {
            this.mostrarNotificacion(`No hay servicios programados para ${fechaExport}`, 'info');
            return;
        }

        // Preparar filas: encabezado + datos
        const rows = [];
        rows.push([
            'Fecha', 'Nombre', 'Apellido', 'Servicio', 'Categoría', 'Precio', 'Seña', 'Estado Pago', 'Teléfono', 'Email', 'Detalles', 'Fecha Creación', 'Fecha Pago'
        ]);

        serviciosDia.forEach(s => {
            const servicioInfo = this.tiposServicio.find(t => t.id == s.servicioId) || {};
            rows.push([
                s.fecha,
                s.nombre,
                s.apellido,
                s.servicio,
                this.formatearCategoria(servicioInfo.categoria || ''),
                s.precio != null ? s.precio : '',
                s.senia != null ? s.senia : '',
                s.estadoPago || '',
                s.telefono || '',
                s.email || '',
                s.detalles || '',
                s.fechaCreacion || '',
                s.fechaPago || ''
            ]);
        });

        // Usar SheetJS si está disponible
        if (typeof window !== 'undefined' && window.XLSX) {
            try {
                const ws = window.XLSX.utils.aoa_to_sheet(rows);
                const wb = window.XLSX.utils.book_new();
                window.XLSX.utils.book_append_sheet(wb, ws, 'Agenda');
                const wbout = window.XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                const blob = new Blob([wbout], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const safeDate = fechaExport.replace(/\//g, '-');
                a.download = `agenda-${safeDate}.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                this.mostrarNotificacion(`Reporte descargado: agenda-${safeDate}.xlsx`, 'success');
                return;
            } catch (e) {
                // Notificar al usuario y continuar con CSV de respaldo
                this.mostrarNotificacion('Error generando XLSX. Se intentará descargar CSV de respaldo.', 'error');
            }
        }

        // Fallback a CSV si SheetJS no está presente
        try {
            const csvRows = rows.map(r => r.map(field => {
                if (field == null) return '';
                const value = String(field).replace(/"/g, '""');
                return `"${value}"`;
            }).join(','));

            // Añadir BOM para compatibilidad con Excel y usar UTF-8
            const csvContent = '\uFEFF' + csvRows.join('\r\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const safeDate = fechaExport.replace(/\//g, '-');
            a.download = `agenda-${safeDate}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            this.mostrarNotificacion(`Reporte descargado: agenda-${safeDate}.csv`, 'success');
            return;
        } catch (e) {
            this.mostrarNotificacion('No se pudo generar el reporte', 'error');
        }
    }

    

    actualizarEstadisticas() {
        const totalServicios = this.servicios.length;
        const serviciosHoy = obtenerServiciosHoy(this).length;
        const serviciosMes = obtenerServiciosEsteMes(this).length;
        const serviciosSemana = obtenerServiciosEstaSemana(this).length;

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
            mesAnterior.addEventListener('click', () => cambiarMes(this, -1));
        }
        if (mesSiguiente) {
            mesSiguiente.addEventListener('click', () => cambiarMes(this, 1));
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
            filtroCategoria.addEventListener('change', (e) => {
                // Actualizar listado visible de servicios guardados
                this.mostrarServicios();
                // Actualizar el select de tipos de servicio para que muestre solo los de la categoría seleccionada
                const valor = e.target.value;
                // Si existe un select de tipo-servicio, recargar opciones filtradas
                try {
                    this.cargarOpcionesServicios(valor === 'todas' ? null : valor);
                } catch (err) {
                    // en caso de error, notificar de forma no intrusiva
                    try { this.mostrarNotificacion('No se pudieron filtrar las opciones de servicios', 'warning'); } catch (e) {}
                }
            });
        }

        // Exportar reporte (XLSX) del día seleccionado
        const btnExportar = document.getElementById('btn-exportar');
        if (btnExportar) {
            btnExportar.addEventListener('click', () => this.generarReporteDia());
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
                renderizarCalendario(this);
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
        // Delegar a UI.notify si está disponible
        if (window.UI && typeof UI.notify === 'function') {
            UI.notify(mensaje, tipo);
            return;
        }
        // Fallback simple si UI no está presente
        const notification = document.createElement('div');
        notification.style.cssText = `position: fixed; top: 20px; right: 20px; padding: 12px 16px; background: ${tipo === 'error' ? '#dc3545' : tipo === 'success' ? '#28a745' : '#17a2b8'}; color: #fff; border-radius: 6px; z-index: 10000;`;
        notification.textContent = mensaje;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.agenda = new AgendaServicios();
    window.agenda.inicializarAplicacion();
});
// FIN de archivo - código de prueba eliminado