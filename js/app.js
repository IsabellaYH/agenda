// Sistema de Gestión - AgendaPro
// Desarrollado por Isabella Yanes

class AgendaServicios {
    constructor() {
        this.servicios = [];
        this.fechaActual = new Date();
        this.fechaSeleccionada = null;
        this.inicializarAplicacion();
    }

    inicializarAplicacion() {
        this.cargarServicios();
        this.renderizarCalendario();
        this.mostrarServicios();
        this.actualizarEstadisticas();
        this.configurarEventos();
        this.mostrarMensaje('Sistema AgendaPro inicializado correctamente', 'info');
    }

    cargarServicios() {
        const serviciosGuardados = localStorage.getItem('agendaPro_servicios');
        if (serviciosGuardados) {
            this.servicios = JSON.parse(serviciosGuardados);
        }
    }

    guardarServicios() {
        localStorage.setItem('agendaPro_servicios', JSON.stringify(this.servicios));
        this.actualizarEstadisticas();
    }

    actualizarEstadisticas() {
        const totalServicios = document.getElementById('total-servicios');
        const serviciosMes = document.getElementById('servicios-mes');
        const contadorServicios = document.getElementById('contador-servicios');
        
        const mesActual = this.fechaActual.getMonth() + 1;
        const añoActual = this.fechaActual.getFullYear();
        
        const serviciosEsteMes = this.servicios.filter(servicio => {
            const [dia, mes] = servicio.fecha.split('/').map(Number);
            // Verificar que el servicio sea del mes y año actual
            return mes === mesActual && 
                   this.esServicioDelAñoActual(servicio.fecha, añoActual);
        }).length;

        totalServicios.textContent = this.servicios.length;
        serviciosMes.textContent = serviciosEsteMes;
        contadorServicios.textContent = this.servicios.length;
    }

    esServicioDelAñoActual(fechaServicio, añoActual) {
        // Asumimos que todos los servicios son del año actual
        // En una implementación real, deberías almacenar el año completo
        return true;
    }

    renderizarCalendario() {
        const primerDia = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), 1);
        const ultimoDia = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth() + 1, 0);
        
        const nombresMeses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        document.getElementById('mes-actual').textContent = 
            `${nombresMeses[this.fechaActual.getMonth()]} ${this.fechaActual.getFullYear()}`;

        const contenedorDias = document.getElementById('dias-calendario');
        contenedorDias.innerHTML = '';

        const primerDiaSemana = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1;
        const ultimoDiaMesAnterior = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), 0).getDate();
        const hoy = new Date();

        // Días del mes anterior
        for (let i = primerDiaSemana; i > 0; i--) {
            const diaElemento = this.crearElementoDia(ultimoDiaMesAnterior - i + 1, 'otro-mes');
            contenedorDias.appendChild(diaElemento);
        }

        // Días del mes actual
        for (let i = 1; i <= ultimoDia.getDate(); i++) {
            const fechaStr = `${i.toString().padStart(2, '0')}/${(this.fechaActual.getMonth() + 1).toString().padStart(2, '0')}`;
            const clases = [];
            
            // Verificar si es hoy
            if (this.fechaActual.getMonth() === hoy.getMonth() && 
                this.fechaActual.getFullYear() === hoy.getFullYear() && 
                i === hoy.getDate()) {
                clases.push('actual');
            }
            
            // Verificar si tiene servicios
            if (this.servicios.some(s => s.fecha === fechaStr)) {
                clases.push('con-servicio');
            }
            
            // Verificar si está seleccionado
            if (this.fechaSeleccionada === fechaStr) {
                clases.push('seleccionado');
            }

            const diaElemento = this.crearElementoDia(i, clases.join(' '));
            diaElemento.addEventListener('click', () => this.seleccionarFecha(i));
            contenedorDias.appendChild(diaElemento);
        }

        // Días del próximo mes
        const totalCeldas = 42; // 6 semanas
        const diasAgregados = primerDiaSemana + ultimoDia.getDate();
        const diasRestantes = totalCeldas - diasAgregados;
        
        for (let i = 1; i <= diasRestantes; i++) {
            const diaElemento = this.crearElementoDia(i, 'otro-mes');
            contenedorDias.appendChild(diaElemento);
        }
    }

    crearElementoDia(numero, clases) {
        const dia = document.createElement('div');
        dia.className = `dia ${clases}`;
        dia.textContent = numero;
        return dia;
    }

    seleccionarFecha(dia) {
        const mes = (this.fechaActual.getMonth() + 1).toString().padStart(2, '0');
        const diaStr = dia.toString().padStart(2, '0');
        this.fechaSeleccionada = `${diaStr}/${mes}`;
        document.getElementById('fecha-servicio').value = this.fechaSeleccionada;
        this.renderizarCalendario();
    }

    configurarEventos() {
        document.getElementById('formulario-servicio').addEventListener('submit', (e) => this.agregarServicio(e));
        document.getElementById('mes-anterior').addEventListener('click', () => this.navegarMes(-1));
        document.getElementById('mes-siguiente').addEventListener('click', () => this.navegarMes(1));
        document.getElementById('ver-todos').addEventListener('click', () => this.mostrarServicios());
        document.getElementById('buscar-fecha').addEventListener('click', () => this.buscarPorFecha());
        document.getElementById('limpiar-lista').addEventListener('click', () => this.limpiarAgenda());
    }

    navegarMes(direccion) {
        this.fechaActual.setMonth(this.fechaActual.getMonth() + direccion);
        this.renderizarCalendario();
    }

    agregarServicio(evento) {
        evento.preventDefault();
        
        const nombre = document.getElementById('nombre-cliente').value.trim();
        const apellido = document.getElementById('apellido-cliente').value.trim();
        const fecha = document.getElementById('fecha-servicio').value;
        const servicio = document.getElementById('tipo-servicio').value;
        const detalles = document.getElementById('detalles-servicio').value.trim();

        if (!this.validarFormulario(nombre, apellido, fecha, servicio)) {
            return;
        }

        const nuevoServicio = {
            id: Date.now(),
            fecha: fecha,
            nombre: nombre,
            apellido: apellido,
            servicio: servicio,
            detalles: detalles || 'Sin detalles adicionales',
            fechaCreacion: new Date().toISOString()
        };

        this.servicios.push(nuevoServicio);
        this.guardarServicios();
        this.limpiarFormulario();
        this.renderizarCalendario();
        this.mostrarServicios();
        
        this.mostrarMensaje(
            `✅ Servicio agendado para <strong>${nombre} ${apellido}</strong><br>
            📅 ${fecha} | 💼 ${servicio}`, 
            'exito'
        );
    }

    validarFormulario(nombre, apellido, fecha, servicio) {
        if (!nombre || !apellido || !fecha || !servicio) {
            this.mostrarMensaje('❌ Completa todos los campos obligatorios', 'error');
            return false;
        }

        const regexFecha = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/;
        if (!regexFecha.test(fecha)) {
            this.mostrarMensaje('❌ Formato de fecha inválido. Usa DD/MM', 'error');
            return false;
        }

        return true;
    }

    limpiarFormulario() {
        document.getElementById('formulario-servicio').reset();
        this.fechaSeleccionada = null;
        document.getElementById('fecha-servicio').value = '';
    }

    mostrarServicios() {
        const contenedor = document.getElementById('contenedor-resultados');
        
        if (this.servicios.length === 0) {
            contenedor.innerHTML = `
                <div class="estado-vacio">
                    <div class="icono-vacio">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <h3>No hay servicios programados</h3>
                    <p>Comienza agendando tu primer servicio usando el formulario</p>
                </div>
            `;
            return;
        }

        const serviciosOrdenados = [...this.servicios].sort((a, b) => {
            const [diaA, mesA] = a.fecha.split('/').map(Number);
            const [diaB, mesB] = b.fecha.split('/').map(Number);
            return mesA - mesB || diaA - diaB;
        });

        let html = '';
        serviciosOrdenados.forEach((servicio, indice) => {
            html += this.crearHTMLServicio(servicio, indice);
        });

        contenedor.innerHTML = html;
        this.configurarBotonesEliminar();
    }

    crearHTMLServicio(servicio, indice) {
        return `
            <div class="servicio">
                <button class="btn-eliminar" onclick="agenda.eliminarServicio(${servicio.id})">
                    <i class="fas fa-times"></i>
                </button>
                <div class="encabezado-servicio">
                    <h3>Servicio #${indice + 1}</h3>
                    <span class="etiqueta-servicio">${servicio.servicio}</span>
                </div>
                <div class="detalle-servicio">
                    <i class="far fa-calendar"></i>
                    <span class="fecha">${servicio.fecha}</span>
                </div>
                <div class="detalle-servicio">
                    <i class="far fa-user"></i>
                    <span class="cliente">${servicio.nombre} ${servicio.apellido}</span>
                </div>
                <div class="detalle-servicio">
                    <i class="far fa-file-lines"></i>
                    <span class="detalles">${servicio.detalles}</span>
                </div>
            </div>
        `;
    }

    configurarBotonesEliminar() {
        document.querySelectorAll('.btn-eliminar').forEach(boton => {
            boton.addEventListener('click', function() {
                this.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            });
        });
    }

    buscarPorFecha() {
        if (this.servicios.length === 0) {
            this.mostrarMensaje('📭 No hay servicios registrados', 'info');
            return;
        }

        const fechaBuscada = prompt('🔍 Ingresa la fecha a buscar (DD/MM):');
        if (!fechaBuscada) return;

        const serviciosEncontrados = this.servicios.filter(s => s.fecha === fechaBuscada);
        const contenedor = document.getElementById('contenedor-resultados');

        if (serviciosEncontrados.length > 0) {
            let html = `<h3 style="margin-bottom: 16px; color: var(--color-primario);">📅 Servicios para el ${fechaBuscada}</h3>`;
            serviciosEncontrados.forEach((servicio, indice) => {
                html += this.crearHTMLServicio(servicio, indice);
            });
            contenedor.innerHTML = html;
            this.configurarBotonesEliminar();
        } else {
            this.mostrarMensaje(`❌ No se encontraron servicios para ${fechaBuscada}`, 'error');
        }
    }

    eliminarServicio(id) {
        const servicio = this.servicios.find(s => s.id === id);
        if (!servicio) return;

        const confirmacion = confirm(
            `¿Eliminar servicio de ${servicio.nombre} ${servicio.apellido} para el ${servicio.fecha}?`
        );

        if (confirmacion) {
            this.servicios = this.servicios.filter(s => s.id !== id);
            this.guardarServicios();
            this.renderizarCalendario();
            this.mostrarServicios();
            this.mostrarMensaje('✅ Servicio eliminado correctamente', 'exito');
        }
    }

    limpiarAgenda() {
        if (this.servicios.length === 0) {
            this.mostrarMensaje('La agenda ya está vacía', 'info');
            return;
        }

        const confirmacion = confirm(
            `¿Estás seguro de eliminar los ${this.servicios.length} servicios registrados?\n\nEsta acción no se puede deshacer.`
        );

        if (confirmacion) {
            // Limpiar todos los servicios
            this.servicios = [];
            
            // Limpiar localStorage
            localStorage.removeItem('agendaPro_servicios');
            
            // Actualizar la interfaz
            this.renderizarCalendario();
            this.mostrarServicios();
            this.actualizarEstadisticas(); // ¡Esta línea es crucial!
            
            this.mostrarMensaje('🗑️ Todos los servicios han sido eliminados correctamente', 'exito');
            
            // Forzar una actualización visual adicional
            setTimeout(() => {
                this.actualizarEstadisticas();
            }, 100);
        }
    }

    mostrarMensaje(mensaje, tipo) {
        const contenedor = document.getElementById('contenedor-resultados');
        contenedor.innerHTML = `
            <div class="mensaje ${tipo}">
                ${mensaje}
            </div>
        `;
        
        if (tipo !== 'info') {
            setTimeout(() => {
                this.mostrarServicios();
            }, 3000);
        }
    }
}

// Inicializar la aplicación
const agenda = new AgendaServicios();

// Efectos visuales adicionales
document.addEventListener('DOMContentLoaded', function() {
    // Efecto de carga inicial
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);

    // Efectos hover en tarjetas de servicio
    const tarjetas = document.querySelectorAll('.tarjeta');
    tarjetas.forEach(tarjeta => {
        tarjeta.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        tarjeta.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});