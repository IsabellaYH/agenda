# Agenda

Agenda para reservar servicios personalizados

## Descripción General

Este repositorio contiene el código base para una aplicación de agendamiento diseñada para gestionar servicios personalizados. Es una aplicación frontend que tiene como objetivo proporcionar una agenda virtual adecuada para negocios orientados a servicios como salones de belleza, centros estéticos y peluquerías. Incluye funciones para visualizar un calendario, agendar servicios (con depósitos), filtrar y buscar servicios, y estimar ingresos.

## Características y Beneficios Principales

*   **Visualización de Calendario:** Una representación visual de las citas y la disponibilidad.
*   **Agendamiento de Servicios:** Funcionalidad para reservar y gestionar citas con opciones de depósito.
*   **Filtrado y Búsqueda:** Capacidad para localizar fácilmente servicios o citas específicas.
*   **Estimación de Ingresos:** Herramientas para calcular y visualizar los ingresos estimados.
*   **Interfaz Responsiva:** Diseño adaptable que funciona en diferentes dispositivos.

## Tecnologías Utilizadas

*   **HTML** - Estructura de la aplicación
*   **CSS** - Estilos básicos
*   **SASS** - Preprocesador CSS para una gestión más eficiente de estilos
*   **JavaScript** - Funcionalidad e interactividad de la aplicación

## Prerrequisitos

Para trabajar con este proyecto necesitas:

*   Un navegador web moderno (Chrome, Firefox, Safari, Edge)
*   Un editor de código (VS Code, Sublime Text, etc.)
*   Conocimientos básicos de SASS para modificar los estilos

## Instrucciones de Instalación y Configuración

1.  **Clonar o Descargar el Repositorio:**

    ```bash
    git clone https://github.com/IsabellaYH/agenda.git
    cd agenda
    ```

    O descarga los archivos directamente desde el repositorio.

2.  **Compilar SASS a CSS:**

    El proyecto utiliza SASS para los estilos. Necesitarás un compilador de SASS. Puedes usar:

    **Opción 1: Usando el comando SASS (recomendado)**
    ```bash
    # Instalar SASS globalmente
    npm install -g sass
    
    # Compilar una vez
    sass scss/style.scss css/style.css
    
    # O compilar en modo watch (actualización automática)
    sass --watch scss/style.scss css/style.css
    ```

    **Opción 2: Usando extensiones de editor**
    *   En VS Code: Instalar la extensión "Live Sass Compiler"
    *   En otros editores: Buscar extensiones similares para SASS

3.  **Abrir la Aplicación:**

    Navega hasta el directorio del proyecto y abre el archivo `index.html` en tu navegador web. La aplicación se cargará y estará lista para usar.

## Estructura del Proyecto

```
agenda/
├── index.html          # Archivo principal HTML
├── css/
│   └── style.css      # CSS compilado (generado automáticamente)
├── scss/
│   ├── style.scss     # Archivo principal SASS
│   └── abstracts/     # Variables, mixins y funciones SASS
├── js/
│   ├── app.js         # Archivo principal JavaScript
│   ├── calendar.js    # Lógica del calendario
│   ├── services.js    # Gestión de servicios
│   ├── ui.js          # Utilidades de interfaz
│   ├── modal.js       # Manejo de modales
│   └── sweetalert.js  # Integración con SweetAlert
└── assets/            # Imágenes y otros recursos
```

## Ejemplos de Uso

La aplicación se organiza en módulos JavaScript que trabajan conjuntamente:

*   `app.js` - Punto de entrada principal que coordina todos los módulos
*   `calendar.js` - Renderiza y gestiona la vista del calendario
*   `services.js` - Maneja la carga y gestión de datos de servicios
*   `ui.js` - Proporciona utilidades para la interfaz de usuario
*   `modal.js` - Controla la visualización de ventanas modales

**Ejemplo de inicialización básica:**
```javascript
// En app.js
import { renderizarCalendario } from './calendar.js';
import { cargarServicios } from './services.js';

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    renderizarCalendario();
    cargarServicios();
});
```

## Personalización

### Colores y Estilos

Los estilos principales se configuran en los archivos SASS. Puedes personalizar:

*   **Colores principales:** Modifica las variables en `scss/abstracts/_variables.scss`
*   **Tipografía:** Cambia las fuentes y tamaños de texto
*   **Layout:** Ajusta espaciados y disposición de elementos

### Funcionalidad

Puedes extender la funcionalidad modificando los archivos JavaScript correspondientes:

*   Agregar nuevos tipos de servicios en `services.js`
*   Modificar la vista del calendario en `calendar.js`
*   Añadir nuevas interacciones en `ui.js`

## Pautas de Contribución

¡Agradecemos las contribuciones para mejorar este proyecto! Para contribuir:

1.  Haz un fork del repositorio
2.  Crea una nueva rama para tu característica o corrección
3.  Realiza tus cambios y asegúrate de compilar los archivos SASS
4.  Haz commits con mensajes claros y descriptivos
5.  Envía un pull request a la rama principal

Por favor, mantén el estilo de código consistente y asegúrate de que todo funcione correctamente antes de enviar contribuciones.

## Licencia

Licencia no especificada. Todos los derechos reservados a menos que se indique lo contrario.

## Agradecimientos

*   SweetAlert por proporcionar alertas y diálogos atractivos
*   Comunidad de desarrolladores web por las herramientas y recursos utilizados
