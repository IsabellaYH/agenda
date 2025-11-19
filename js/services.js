// services.js (ES Module)
// Módulo ligero para cargar y validar `data/services.json`
export async function load() {
    let datos = null;
    try {
        const res = await fetch('data/services.json', { cache: 'no-store' });
        if (res.ok) datos = await res.json();
        else {
            try { if (window && window.UI && typeof window.UI.notify === 'function') window.UI.notify('No se pudo cargar data/services.json (status: ' + res.status + ')', 'warning'); } catch (e) {}
        }
    } catch (err) {
        try { if (window && window.UI && typeof window.UI.notify === 'function') window.UI.notify('Error cargando data/services.json', 'error'); } catch (e) {}
    }

    // Fallback mínimo si no hay archivo
    const fallback = {
        servicios: [],
        configuracion: { senia_minima: 8.00, porcentaje_senia_default: 30, politica_cancelacion: '' }
    };

    return datos || fallback;
}

export default { load };
