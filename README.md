# Sistema de Gestión de Tickets de Soporte (SGTS) — SENA

Proyecto formativo desarrollado para el **SENA Regional Putumayo** — programa de **Tecnología en Análisis y Desarrollo de Software (ADSO)**.

Este repositorio contiene la aplicación web del **Sistema de Gestión de Tickets de Soporte (SGTS)**, diseñada para centralizar, asignar y dar seguimiento a las solicitudes de soporte técnico e incidentes de infraestructura TI. 

La rama actual (`develop`) aloja la arquitectura **Frontend SPA** construida con **Vue 3, Vite, Tailwind CSS y Pinia**, equipada con un motor **Mock API en memoria** que permite ejecutar y evaluar el sistema completo de forma autónoma sin requerir conexión activa a un servidor backend o base de datos local.

> [!NOTE]
> **Respaldo Full-Stack (Backend + Base de Datos + Frontend):**
> El respaldo completo del proyecto que integra la API REST en **FastAPI**, los esquemas de base de datos en **PostgreSQL** y el **Frontend** se encuentra consolidado en la rama **`backup-completo`**:
> ```bash
> git checkout backup-completo
> ```

---

## 🛠️ Tecnologías Utilizadas

* **Framework Principal:** Vue 3 (Composition API)
* **Entorno de Construcción:** Vite
* **Diseño y Estilos:** Tailwind CSS + PostCSS
* **Gestión de Estado Global:** Pinia (`auth`, `recovery`)
* **Enrutamiento:** Vue Router 4
* **Cliente HTTP y Simulación:** Axios / Cliente HTTP propio (`http.js`) + Fake Backend en memoria (`mock.js`)
* **Despliegue Continuo:** Render (`render.yaml`)

---

## ✨ Módulos y Funcionalidades del Proyecto

### 1. Autenticación y Recuperación de Acceso
* **Login Multi-Rol (`LoginView.vue`):** Inicio de sesión con validación de credenciales y botones de acceso rápido (1 clic) en modo demostración para los perfiles de **Administrador**, **Técnico** y **Usuario**.
* **Flujo de Recuperación de Contraseña:** Pantallas integradas para solicitud de recuperación (`RecuperarView.vue`), validación por código de seguridad (`VerificarCodigoView.vue`), definición de nueva clave (`RestablecerView.vue`) y confirmación (`RestablecidoView.vue`).

### 2. Dashboard Analítico (`DashboardView.vue`)
* Indicadores clave de rendimiento (KPIs) mediante tarjetas de resumen (`StatCard.vue`).
* Visualización gráfica del estado y volumen de tickets mediante gráficos de barras (`BarChart.vue`) y gráficos de dona (`DonutChart.vue`).

### 3. Gestión de Tickets de Soporte
* **Creación de Solicitudes (`CrearTicketView.vue`):** Formulario para reportar incidencias asociando prioridad, categoría y descripción del problema.
* **Listado y Filtrado (`TicketsView.vue`):** Tabla de datos interactiva (`DataTable.vue`) con paginación (`Pagination.vue`), búsqueda y etiquetas dinámicas por estado (`EstadoBadge.vue`) y nivel de prioridad (`PrioridadBadge.vue`).
* **Detalle y Seguimiento (`TicketDetalleView.vue`):**
  * Monitoreo de tiempos de respuesta mediante barra de cumplimiento de acuerdos de nivel de servicio (`SlaBar.vue`).
  * Asignación de personal técnico mediante ventana modal (`AsignarTecnicoModal.vue`).
  * Actualización del flujo de estados del ticket (`CambiarEstadoModal.vue`).
  * Evaluación y calificación de la atención recibida mediante sistema de estrellas (`StarRating.vue`).

### 4. Administración y Auditoría
* **Gestión de Empleados (`EmpleadosView.vue`):** Administración de usuarios, roles y personal técnico registrado en la plataforma.
* **Bitácora de Auditoría (`AuditoriaView.vue`):** Historial y trazabilidad de las acciones críticas ejecutadas dentro del sistema.
* **Notificaciones (`ToastHost.vue` / `toast.js`):** Sistema de alertas flotantes en tiempo real para retroalimentar cada acción del usuario.

---

## 📂 Estructura del Proyecto

```text
SGTS-SENA-develop/
├── docs/
│   ├── SGTS_API_Tests.json              # Colección de pruebas de endpoints de la API
│   └── document.txt                     # Documentación técnica del proyecto
├── frontend/
│   ├── public/
│   │   ├── favicon.svg                  # Ícono de la pestaña del navegador
│   │   └── logo-sena.jpg                # Logotipo institucional SENA
│   ├── src/
│   │   ├── api/
│   │   │   ├── http.js                  # Configuración de peticiones HTTP y cabeceras
│   │   │   └── mock.js                  # Base de datos y endpoints simulados en memoria
│   │   ├── components/
│   │   │   ├── AppLayout.vue            # Estructura principal (Sidebar y Navbar)
│   │   │   ├── AsignarTecnicoModal.vue  # Modal para asignar técnico a un ticket
│   │   │   ├── AuthCard.vue             # Contenedor visual para vistas de autenticación
│   │   │   ├── BarChart.vue             # Componente de gráfico de barras
│   │   │   ├── CambiarEstadoModal.vue   # Modal para transición de estados de tickets
│   │   │   ├── DataTable.vue            # Tabla reutilizable de datos
│   │   │   ├── DonutChart.vue           # Componente de gráfico circular/dona
│   │   │   ├── EstadoBadge.vue          # Etiqueta visual para estado del ticket
│   │   │   ├── Icon.vue                 # Catálogo de íconos SVG del sistema
│   │   │   ├── Modal.vue                # Componente base para ventanas modales
│   │   │   ├── Pagination.vue           # Control de paginación de registros
│   │   │   ├── PrioridadBadge.vue       # Etiqueta visual para prioridad (Baja, Media, Alta, Crítica)
│   │   │   ├── SenaLogo.vue             # Componente visual del logo institucional
│   │   │   ├── SlaBar.vue               # Barra de progreso de cumplimiento SLA
│   │   │   ├── StarRating.vue           # Calificación de servicio por estrellas
│   │   │   ├── StatCard.vue             # Tarjeta de métricas para el Dashboard
│   │   │   └── ToastHost.vue            # Contenedor de notificaciones emergentes
│   │   ├── composables/
│   │   │   └── toast.js                 # Lógica reactiva para disparar notificaciones
│   │   ├── router/
│   │   │   └── index.js                 # Definición de rutas y control de acceso
│   │   ├── stores/
│   │   │   ├── auth.js                  # Estado de sesión, usuario activo y roles
│   │   │   └── recovery.js              # Estado del flujo de recuperación de clave
│   │   ├── utils/
│   │   │   └── format.js                # Formateadores de fechas, textos y estados
│   │   ├── views/
│   │   │   ├── AuditoriaView.vue        # Vista de registros de auditoría
│   │   │   ├── CrearTicketView.vue      # Vista de formulario de nuevo ticket
│   │   │   ├── DashboardView.vue        # Vista principal de estadísticas
│   │   │   ├── EmpleadosView.vue        # Vista de gestión de usuarios/empleados
│   │   │   ├── LoginView.vue            # Vista de inicio de sesión
│   │   │   ├── RecuperarView.vue        # Vista de solicitud de recuperación
│   │   │   ├── RestablecerView.vue      # Vista de cambio de contraseña
│   │   │   ├── RestablecidoView.vue     # Vista de confirmación de contraseña actualizada
│   │   │   ├── TicketDetalleView.vue    # Vista detallada y gestión de un ticket
│   │   │   ├── TicketsView.vue          # Vista de listado general de tickets
│   │   │   └── VerificarCodigoView.vue  # Vista de validación de código de seguridad
│   │   ├── App.vue                      # Componente raíz de Vue
│   │   ├── main.js                      # Punto de montaje de la aplicación
│   │   └── style.css                    # Directivas globales de Tailwind CSS y estilos base
│   ├── .env.example                     # Plantilla de variables de entorno
│   ├── index.html                       # Plantilla HTML principal
│   ├── package.json                     # Dependencias y scripts del cliente
│   ├── postcss.config.js                # Configuración de PostCSS
│   ├── tailwind.config.js               # Tema y configuración de Tailwind CSS
│   └── vite.config.js                   # Configuración de Vite
├── package.json                         # Scripts puente en la raíz del repositorio
└── render.yaml                          # Especificación de despliegue automático en Render
```

---

## 🚀 Instalación y Ejecución Local

### 1. Requisitos Previos
* **Node.js** (versión 18 o superior)
* **npm** (incluido con Node.js)

### 2. Clonar el repositorio e instalar dependencias
Ejecuta el siguiente comando desde la **raíz del proyecto** para instalar los paquetes dentro del directorio `frontend`:

```powershell
npm --prefix frontend install
```

### 3. Configurar variables de entorno (Opcional)
En la carpeta `frontend/` encontrarás el archivo `.env.example`. Por defecto, el sistema puede ejecutarse directamente en modo Mock sin configuración adicional, o apuntar a una API externa creando un archivo `.env`.

### 4. Iniciar el servidor de desarrollo
Desde la raíz del repositorio ejecuta:

```powershell
npm run dev
```

Abre tu navegador en **`http://localhost:5173/`**.

---

## 📦 Compilación y Despliegue en Producción

### Generar compilación estática (Build)
Desde la raíz del proyecto:

```powershell
npm run build
```
Los archivos optimizados y minificados se generarán en la carpeta `frontend/dist/`.

### 🌐 Despliegue en Render
El proyecto incluye el archivo `render.yaml` configurado bajo el estándar *Infrastructure as Code (IaC)* para publicarse como un **Static Site (SPA)**:
1. Vincula este repositorio de GitHub en tu cuenta de **Render**.
2. Crea un nuevo **Static Site** apuntando a la rama `develop`.
3. Render detectará la configuración, ejecutará la compilación de `frontend` y redirigirá todas las rutas hacia `index.html` automáticamente.

---

## 🔌 Endpoints Principales de la API

| Método | Endpoint | Descripción | Roles Permitidos |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Autenticación de usuario y generación de sesión | Todos |
| `GET` | `/api/tickets` | Consulta de tickets registrados | Todos (según rol) |
| `POST` | `/api/tickets` | Registro de un nuevo ticket de soporte | Todos |
| `PUT` | `/api/tickets/:id/cerrar` | Cierre formal de un ticket de soporte | Solo Admin |
| `GET` | `/api/equipos` | Consulta de equipos del inventario TI | Todos |

*(La colección completa de pruebas se encuentra disponible en `docs/SGTS_API_Tests.json`).*

---

## 👥 Equipo de Desarrollo

* **Johan Pantoja** — *Líder Frontend*
* **Rito Delgado** — *Módulo de Tickets*
* **Daniel Montoya** — *Módulo de Inventario TI*
* **Patrick Morales** — *Administración, Infraestructura y Pruebas*
