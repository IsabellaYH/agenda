// Calendar module: renders the month view and provides helpers to query services
// Exported functions accept the main `agenda` instance when they require app state.
export function formatearFecha(fecha) {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const year = fecha.getFullYear();
    return `${dia}/${mes}/${year}`;
}

export function crearElementoDia(numero, clases, cantidadServicios = 0) {
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

export function seleccionarFecha(agenda, dia) {
    const fechaSeleccionada = new Date(agenda.fechaActual.getFullYear(), agenda.fechaActual.getMonth(), dia);
    // block selecting past dates as a safety net
    const hoy = new Date();
    const hoyInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    if (fechaSeleccionada < hoyInicio) {
        if (agenda && typeof agenda.mostrarNotificacion === 'function') {
            agenda.mostrarNotificacion('No se puede agendar en fechas pasadas', 'error');
        }
        return;
    }

    agenda.fechaSeleccionada = formatearFecha(fechaSeleccionada);

    const fechaInput = document.getElementById('fecha-servicio');
    if (fechaInput) {
        fechaInput.value = agenda.fechaSeleccionada;
    }

    // Re-render del calendario para actualizar la selección
    renderizarCalendario(agenda);
}

// Renders the full calendar grid (including prev/next-month cells).
// Uses `agenda.fechaActual`, `agenda.servicios` and `agenda.fechaSeleccionada`.
export function renderizarCalendario(agenda) {
    const primerDia = new Date(agenda.fechaActual.getFullYear(), agenda.fechaActual.getMonth(), 1);
    const ultimoDia = new Date(agenda.fechaActual.getFullYear(), agenda.fechaActual.getMonth() + 1, 0);

    const nombresMeses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const mesActualElement = document.getElementById('mes-actual');
    if (mesActualElement) {
        mesActualElement.textContent = `${nombresMeses[agenda.fechaActual.getMonth()]} ${agenda.fechaActual.getFullYear()}`;
    }

    const contenedorDias = document.getElementById('dias-calendario');
    if (!contenedorDias) {
        try { if (agenda && typeof agenda.mostrarNotificacion === 'function') agenda.mostrarNotificacion('No se encontró el contenedor de días del calendario', 'error'); } catch (e) {}
        return;
    }

    contenedorDias.innerHTML = '';

    const primerDiaSemana = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1;
    const ultimoDiaMesAnterior = new Date(agenda.fechaActual.getFullYear(), agenda.fechaActual.getMonth(), 0).getDate();
    const hoy = new Date();
    const hoyInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    // Build an array with all day elements (previous month, current, next month)
    const allDays = [];


    // Días del mes anterior
    for (let i = primerDiaSemana; i > 0; i--) {
        const dayNum = ultimoDiaMesAnterior - i + 1;
        const dateObj = new Date(agenda.fechaActual.getFullYear(), agenda.fechaActual.getMonth() - 1, dayNum);
        const clasesPrev = ['dia-calendario', 'otro-mes'];
        if (dateObj < hoyInicio) {
            clasesPrev.push('disabled');
        }
        const diaElemento = crearElementoDia(dayNum, clasesPrev);
        if (dateObj < hoyInicio) diaElemento.setAttribute('aria-disabled', 'true');
        allDays.push(diaElemento);
    }

    // Días del mes actual
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
        const dateObj = new Date(agenda.fechaActual.getFullYear(), agenda.fechaActual.getMonth(), i);
        const fechaStr = formatearFecha(dateObj);
        const clases = ['dia-calendario', 'mes-actual'];

        // Verificar si es hoy
        if (agenda.fechaActual.getMonth() === hoy.getMonth() && agenda.fechaActual.getFullYear() === hoy.getFullYear() && i === hoy.getDate()) {
            clases.push('hoy');
        }

        // Verificar si tiene servicios
        const serviciosDia = agenda.servicios.filter(s => s.fecha === fechaStr);
        if (serviciosDia.length > 0) {
            clases.push('con-servicio');
        }

        // Verificar si está seleccionado
        if (agenda.fechaSeleccionada === fechaStr) {
            clases.push('seleccionado');
        }

        // Si la fecha es anterior a hoy, marcarla y evitar el click
        const isPast = dateObj < hoyInicio;
        if (isPast) clases.push('disabled');

        const diaElemento = crearElementoDia(i, clases, serviciosDia.length);
        if (!isPast) {
            diaElemento.addEventListener('click', () => seleccionarFecha(agenda, i));
        } else {
            diaElemento.setAttribute('aria-disabled', 'true');
        }
        allDays.push(diaElemento);
    }

    // Días del próximo mes
    const totalCeldas = 42;
    const diasAgregados = primerDiaSemana + ultimoDia.getDate();
    const diasRestantes = totalCeldas - diasAgregados;

    for (let i = 1; i <= diasRestantes; i++) {
        const dateObj = new Date(agenda.fechaActual.getFullYear(), agenda.fechaActual.getMonth() + 1, i);
        const clasesNext = ['dia-calendario', 'otro-mes'];
        if (dateObj < hoyInicio) clasesNext.push('disabled');
        const diaElemento = crearElementoDia(i, clasesNext);
        if (dateObj < hoyInicio) diaElemento.setAttribute('aria-disabled', 'true');
        allDays.push(diaElemento);
    }

    // If the screen is narrow, render a week-per-row horizontal scroller (compact mobile layout)
    const isNarrow = typeof window !== 'undefined' && window.innerWidth && window.innerWidth <= 420;

    if (isNarrow) {
        // create week rows (7 days each) and append as horizontal scrollable sections
        for (let w = 0; w < allDays.length; w += 7) {
            const weekRow = document.createElement('div');
            weekRow.className = 'semana-row';
            for (let d = 0; d < 7; d++) {
                const idx = w + d;
                if (allDays[idx]) weekRow.appendChild(allDays[idx]);
            }
            contenedorDias.appendChild(weekRow);
        }
        // add carousel controls for mobile scroller
        ensureCarouselControls(contenedorDias);
    } else {
        // Default: append days directly for grid layout
        allDays.forEach(d => contenedorDias.appendChild(d));
    }
}

// Create simple prev/next controls and wire scrolling by one week
function ensureCarouselControls(contenedorDias) {
    // prefer inserting controls inside the calendar card body so positioning is relative
    const containerForControls = contenedorDias.closest('.card-body') || contenedorDias.parentElement || document.body;
    // mark container as positioned so absolute controls are relative to it
    containerForControls.classList.add('has-calendar-controls');

    // remove existing controls inside this container
    const existing = containerForControls.querySelector('.calendar-controls');
    if (existing) existing.remove();

    const controls = document.createElement('div');
    // use 'floating' so controls appear as floating buttons on small screens
    controls.className = 'calendar-controls floating';
    controls.innerHTML = `
        <button type="button" class="calendar-control prev" aria-label="Semana anterior" title="Semana anterior">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
        </button>
        <button type="button" class="calendar-control next" aria-label="Semana siguiente" title="Semana siguiente">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        </button>
    `;

    // insert controls inside the calendar card body, after the days container
    containerForControls.insertBefore(controls, contenedorDias.nextSibling);

    const btnPrev = controls.querySelector('.calendar-control.prev');
    const btnNext = controls.querySelector('.calendar-control.next');

    btnPrev.addEventListener('click', () => scrollWeek(contenedorDias, -1));
    btnNext.addEventListener('click', () => scrollWeek(contenedorDias, 1));
}

function scrollWeek(contenedorDias, direction = 1) {
    const firstWeek = contenedorDias.querySelector('.semana-row');
    if (!firstWeek) return;

    const weekWidth = firstWeek.getBoundingClientRect().width + parseFloat(getComputedStyle(contenedorDias).gap || 8);
    const delta = Math.round(weekWidth) * direction;
    contenedorDias.scrollBy({ left: delta, behavior: 'smooth' });
}

// Attach a debounced resize listener that re-renders calendar when crossing narrow/wide threshold
export function enableCalendarAutoResize(agenda, wait = 150) {
    if (typeof window === 'undefined') return;
    let timeout = null;
    let lastIsNarrow = window.innerWidth <= 420;

    const handler = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const nowNarrow = window.innerWidth <= 420;
            if (nowNarrow !== lastIsNarrow) {
                lastIsNarrow = nowNarrow;
                renderizarCalendario(agenda);
            }
        }, wait);
    };

    window.addEventListener('resize', handler);
    // return an unsubscribe function in case caller wants to remove the listener later
    return () => window.removeEventListener('resize', handler);
}

export function cambiarMes(agenda, direccion) {
    agenda.fechaActual.setMonth(agenda.fechaActual.getMonth() + direccion);
    renderizarCalendario(agenda);
}

export function obtenerServiciosHoy(agenda) {
    const hoy = new Date().toLocaleDateString('es-ES');
    return agenda.servicios.filter(s => s.fecha === hoy);
}

export function obtenerServiciosEsteMes(agenda) {
    const mesActual = agenda.fechaActual.getMonth();
    const añoActual = agenda.fechaActual.getFullYear();
    return agenda.servicios.filter(s => {
        const [dia, mes, año] = s.fecha.split('/');
        return parseInt(mes) === mesActual + 1 && parseInt(año) === añoActual;
    });
}

export function obtenerServiciosEstaSemana(agenda) {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1);
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);

    return agenda.servicios.filter(s => {
        const [dia, mes, año] = s.fecha.split('/');
        const fechaServicio = new Date(año, mes - 1, dia);
        return fechaServicio >= inicioSemana && fechaServicio <= finSemana;
    });
}
