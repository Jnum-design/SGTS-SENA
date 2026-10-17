# Sistema de Gestión de Tickets de Soporte (SGTS) — Frontend SENA

Proyecto desarrollado para el SENA Regional Putumayo — ADSO.

Esta rama (`develop`) contiene la **aplicación cliente Frontend** construida en **Vue 3 + Vite + TailwindCSS + Pinia**, con soporte para **Modo Autónomo (Mock API)** para desarrollo y diseño de interfaces sin dependencias de backend o bases de datos locales.

> [!NOTE]
> El sistema full-stack original (con la API en FastAPI y los scripts de PostgreSQL) se encuentra respaldado y disponible en la rama:
> **`backup-completo`** (`git checkout backup-completo`).

---

## 🚀 Inicio Rápido del Frontend

### 1. Requisitos
- **Node.js** (versión 18 o superior)
- **npm**

### 2. Instalar dependencias
```powershell
npm --prefix frontend install
```

### 3. Iniciar el servidor de desarrollo
Desde la raíz del repositorio:
```powershell
npm run dev
```

El servidor Vite iniciará en **`http://localhost:5173/`**.

### 4. Modo Autónomo (Mock API)
El frontend incluye un Fake Backend en memoria ([frontend/src/api/mock.js](file:///c:/JOHAN/workspace/SGTS-SENA/frontend/src/api/mock.js)) que permite:
- Iniciar sesión como **Administrador**, **Técnico** o **Usuario** con 1 solo clic en la pantalla de Login.
- Visualizar el Dashboard con estadísticas y gráficos interactivos.
- Crear, listar, filtrar y gestionar tickets.
- Administrar empleados y consultar auditoría.

---

## 📦 Compilación para Producción
```powershell
npm run build
```
Genera los archivos estáticos optimizados en `frontend/dist/`.

## 🌐 Despliegue en Render
El archivo `render.yaml` está configurado para publicar el frontend como un sitio estático SPA de alto rendimiento con enrutamiento automático a `index.html`.

1. Conecta el repositorio GitHub a Render.
2. Elige **New → Static Site**, selecciona la rama `develop`.
3. Render compilará automáticamente con `npm run build` y servirá el frontend.


##  Equipo de Desarrollo
- **Johan Pantoja**  Lider Frontend
- **Rito Delgado**  Modulo de Tickets
- **Daniel Montoya**  Modulo de Inventario TI
- **Patrick Morales**  Administracion, Infraestructura y Pruebas

## Endpoints Principales de la API (Acordados)
| Metodo | Endpoint | Descripcion | Roles Permitidos |
|---|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesion | Todos |
| `GET` | `/api/tickets` | Listar tickets | Todos (segun rol) |
| `POST` | `/api/tickets` | Crear ticket | Todos |
| `PUT` | `/api/tickets/:id/cerrar` | Cerrar ticket | Solo Admin |
| `GET` | `/api/equipos` | Listar equipos de inventario | Todos |