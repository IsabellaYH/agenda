# AgendaPro

AgendaPro es una agenda virtual orientada a centros de servicios (salones, centros de estética, peluquerías, etc.).
Permite visualizar un calendario, agendar servicios (con seña), filtrar y buscar servicios, y calcular un resumen de ingresos estimados.

# AgendaPro

AgendaPro es una pequeña aplicación frontend para gestionar turnos y servicios (pensada para salones, peluquerías y centros de estética). Está implementada como un prototipo con HTML, SCSS y JavaScript (ES Modules).

Estado
- Prototipo UI con lógica cliente (no incluye backend). Los datos de catálogo se cargan desde `data/services.json` y las reservas se guardan en `localStorage`.

Tecnologías clave
- HTML5, SCSS (Dart Sass), JavaScript (ES Modules), Bootstrap 5.
- Opcional: Node.js + `sass` como herramienta de compilación de SCSS (scripts incluidos en `package.json`).

Arrancar localmente
1) Opción rápida (sin instalar nada): abre `index.html` con Live Server o un servidor estático.

2) Usando `npx serve` (si tienes Node):

```powershell
npx serve -s . -l 63914
# o el puerto que el servicio elija
```

3) Compilar SCSS (si editás estilos):

```powershell
npm install        # instala devDependencies (opcional)
npm run build:css  # compila css/scss/main.scss → css/style.css
```

Estructura del proyecto
- `index.html` — entrada principal y layout.
- `css/style.css` — estilos compilados (generado desde `css/scss/main.scss`).
- `css/scss/` — fuentes SCSS organizadas por partes.
- `js/` — módulos ES: `app.js` (orquestador), `calendar.js` (render del calendario), `services.js` (carga de catálogo), `modal.js`, `ui.js`, `sweetalert.js`.
- `data/services.json` — catálogo de servicios y `configuracion` por defecto.

Notas importantes
- `node_modules/` no debe subirse al repositorio. Asegurate de que `.gitignore` contiene `node_modules/` (ya incluida).
- Mantener `package.json` y `package-lock.json` es recomendado si vas a usar `npm` para compilar SCSS o agregar herramientas.
- Export: la app incluye integración con SheetJS (CDN) para generar `.xlsx`, y un fallback a CSV.

Buen punto de partida
- Recomendación: probar la app en un navegador moderno, abrir DevTools y validar consola para detectar errores (no deberían quedar logs innecesarios).

Licencia y contribución
- Este repositorio no incluye licencia. Si vas a publicar, añade `LICENSE` (ej. MIT). Para contribuciones: fork → branch → PR.

Contacto
- Abrí un issue en el repo para preguntas o propuestas.
```

